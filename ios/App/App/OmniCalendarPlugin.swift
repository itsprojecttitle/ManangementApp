import Foundation
import Capacitor
import EventKit

@objc(OmniCalendarPlugin)
public class OmniCalendarPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "OmniCalendarPlugin"
    public let jsName = "OmniCalendar"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "checkPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "upsertEvent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteEvent", returnType: CAPPluginReturnPromise)
    ]

    private let eventStore = EKEventStore()
    private let iso8601Parser: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    @objc override public func checkPermissions(_ call: CAPPluginCall) {
        call.resolve(permissionPayload())
    }

    @objc override public func requestPermissions(_ call: CAPPluginCall) {
        requestEventAccess { granted, error in
            if let error {
                call.reject(error.localizedDescription)
                return
            }
            var payload = self.permissionPayload()
            payload["granted"] = granted
            call.resolve(payload)
        }
    }

    @objc func upsertEvent(_ call: CAPPluginCall) {
        let permissionState = calendarPermissionState()
        guard permissionState == "granted" || permissionState == "write-only" else {
            call.reject("Calendar permission has not been granted.")
            return
        }
        guard let title = call.getString("title"), !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            call.reject("Missing event title.")
            return
        }
        guard let startDate = parseIsoDate(call.getString("startDate")) else {
            call.reject("Missing or invalid startDate.")
            return
        }

        let fallbackEnd = startDate.addingTimeInterval(30 * 60)
        let endDate = max(parseIsoDate(call.getString("endDate")) ?? fallbackEnd, fallbackEnd)
        let eventId = String(call.getString("eventId") ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let syncKey = String(call.getString("syncKey") ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let notes = String(call.getString("notes") ?? "")
        let alarms = (call.getArray("alarmsMins", Int.self) ?? []).filter { $0 >= 0 }

        let event = resolveExistingEvent(eventId: eventId, syncKey: syncKey, startDate: startDate, endDate: endDate) ?? EKEvent(eventStore: eventStore)
        guard let calendar = event.calendar ?? eventStore.defaultCalendarForNewEvents else {
            call.reject("No writable Apple Calendar is available.")
            return
        }

        event.calendar = calendar
        event.title = title
        event.startDate = startDate
        event.endDate = endDate
        event.notes = notesWithMarker(notes, syncKey: syncKey)
        event.alarms = alarms.map { EKAlarm(relativeOffset: -TimeInterval($0 * 60)) }

        do {
            try eventStore.save(event, span: .thisEvent, commit: true)
            call.resolve([
                "eventId": event.eventIdentifier ?? "",
                "calendarTitle": calendar.title,
                "calendarPermission": permissionState
            ])
        } catch {
            call.reject(error.localizedDescription)
        }
    }

    @objc func deleteEvent(_ call: CAPPluginCall) {
        let eventId = String(call.getString("eventId") ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        guard !eventId.isEmpty else {
            call.resolve()
            return
        }
        guard let event = eventStore.event(withIdentifier: eventId) else {
            call.resolve()
            return
        }
        do {
            try eventStore.remove(event, span: .thisEvent, commit: true)
            call.resolve()
        } catch {
            call.reject(error.localizedDescription)
        }
    }

    private func requestEventAccess(completion: @escaping (Bool, Error?) -> Void) {
        if #available(iOS 17.0, *) {
            eventStore.requestFullAccessToEvents { granted, error in
                completion(granted, error)
            }
        } else {
            eventStore.requestAccess(to: .event) { granted, error in
                completion(granted, error)
            }
        }
    }

    private func permissionPayload() -> [String: Any] {
        let calendar = calendarPermissionState()
        return [
            "calendar": calendar,
            "granted": calendar == "granted" || calendar == "write-only"
        ]
    }

    private func calendarPermissionState() -> String {
        let status = EKEventStore.authorizationStatus(for: .event)
        if #available(iOS 17.0, *) {
            switch status {
            case .fullAccess:
                return "granted"
            case .writeOnly:
                return "write-only"
            case .restricted, .denied:
                return "denied"
            case .notDetermined:
                return "prompt"
            @unknown default:
                return "prompt"
            }
        }
        switch status {
        case .authorized:
            return "granted"
        case .fullAccess:
            return "granted"
        case .writeOnly:
            return "write-only"
        case .restricted, .denied:
            return "denied"
        case .notDetermined:
            return "prompt"
        @unknown default:
            return "prompt"
        }
    }

    private func parseIsoDate(_ raw: String?) -> Date? {
        guard let raw else { return nil }
        if let parsed = iso8601Parser.date(from: raw) {
            return parsed
        }
        return ISO8601DateFormatter().date(from: raw)
    }

    private func syncMarker(_ syncKey: String) -> String {
        "OMNI_SYNC_KEY:\(syncKey)"
    }

    private func notesWithMarker(_ notes: String, syncKey: String) -> String {
        let trimmedNotes = notes.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !syncKey.isEmpty else { return trimmedNotes }
        let marker = syncMarker(syncKey)
        if trimmedNotes.isEmpty {
            return marker
        }
        if trimmedNotes.contains(marker) {
            return trimmedNotes
        }
        return "\(trimmedNotes)\n\n\(marker)"
    }

    private func resolveExistingEvent(eventId: String, syncKey: String, startDate: Date, endDate: Date) -> EKEvent? {
        if !eventId.isEmpty, let event = eventStore.event(withIdentifier: eventId) {
            return event
        }
        guard !syncKey.isEmpty else { return nil }
        let startSearch = Calendar.current.date(byAdding: .day, value: -30, to: startDate) ?? startDate.addingTimeInterval(-30 * 24 * 60 * 60)
        let endSearch = Calendar.current.date(byAdding: .day, value: 30, to: endDate) ?? endDate.addingTimeInterval(30 * 24 * 60 * 60)
        let predicate = eventStore.predicateForEvents(withStart: startSearch, end: endSearch, calendars: nil)
        let marker = syncMarker(syncKey)
        return eventStore.events(matching: predicate).first { event in
            String(event.notes ?? "").contains(marker)
        }
    }
}
