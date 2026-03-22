import UIKit
import Capacitor

@objc(OmniBridgeViewController)
class OmniBridgeViewController: CAPBridgeViewController {
    fileprivate enum RuntimeMode: String {
        case live
        case bundled
    }

    private let runtimeModeOverrideKey = "OMNIRuntimeModeOverride"
    private let bundledEntryPage = "ManagementApp.html"
    private let offlineOnly = false

    override open func capacitorDidLoad() {
        bridge?.registerPluginType(OmniCalendarPlugin.self)
        bridge?.registerPluginType(OmniRuntimeModePlugin.self)
    }

    override open func viewDidLoad() {
        super.viewDidLoad()
        applyPersistedRuntimeModeIfNeeded()
    }

    fileprivate func runtimeModeStatusPayload() -> [String: Any] {
        let remoteCapable = isRemoteCapable()
        let activeMode = activeRuntimeMode()
        let persistedMode = persistedRuntimeMode()?.rawValue ?? ""
        return [
            "available": true,
            "remoteCapable": remoteCapable,
            "activeMode": activeMode.rawValue,
            "persistedMode": persistedMode,
            "currentUrl": webView?.url?.absoluteString ?? "",
            "localUrl": bundledAppURL().absoluteString,
            "remoteUrl": remoteCapable ? liveAppURL().absoluteString : ""
        ]
    }

    fileprivate func switchRuntimeMode(to mode: RuntimeMode, persist: Bool = true) {
        if persist {
            setPersistedRuntimeMode(mode)
        }
        loadRuntimeMode(mode)
    }

    private func applyPersistedRuntimeModeIfNeeded() {
        guard isRemoteCapable() else {
            loadRuntimeMode(.bundled)
            return
        }
        webView?.stopLoading()
        probeLiveAvailability { [weak self] reachable in
            DispatchQueue.main.async {
                guard let self else { return }
                if reachable {
                    self.setPersistedRuntimeMode(.live)
                    self.loadRuntimeMode(.live)
                } else {
                    self.setPersistedRuntimeMode(.bundled)
                    self.loadRuntimeMode(.bundled)
                }
            }
        }
    }

    private func loadRuntimeMode(_ mode: RuntimeMode) {
        guard let targetURL = targetURL(for: mode) else {
            return
        }
        DispatchQueue.main.async { [weak self] in
            self?.webView?.load(URLRequest(url: targetURL))
        }
    }

    private func targetURL(for mode: RuntimeMode) -> URL? {
        switch mode {
        case .live:
            guard isRemoteCapable() else { return nil }
            return liveAppURL()
        case .bundled:
            return bundledAppURL()
        }
    }

    private func liveAppURL() -> URL {
        bridge?.config.appStartServerURL ?? bundledAppURL()
    }

    private func bundledAppURL() -> URL {
        guard let bridge else {
            return URL(string: "capacitor://localhost/\(bundledEntryPage)")!
        }
        if let startPath = bridge.config.appStartPath, !startPath.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return bridge.config.localURL.appendingPathComponent(startPath)
        }
        return bridge.config.localURL.appendingPathComponent(bundledEntryPage)
    }

    private func isRemoteCapable() -> Bool {
        if offlineOnly { return false }
        guard let bridge else { return false }
        return bridge.config.serverURL.absoluteString != bridge.config.localURL.absoluteString
    }

    private func activeRuntimeMode() -> RuntimeMode {
        let current = webView?.url?.absoluteString.lowercased() ?? ""
        let local = bundledAppURL().absoluteString.lowercased()
        let remote = liveAppURL().absoluteString.lowercased()
        if isRemoteCapable(), current.hasPrefix(remote) {
            return .live
        }
        if current.hasPrefix(local) {
            return .bundled
        }
        if let persisted = persistedRuntimeMode() {
            return persisted
        }
        return .bundled
    }

    private func persistedRuntimeMode() -> RuntimeMode? {
        guard let raw = UserDefaults.standard.string(forKey: runtimeModeOverrideKey) else {
            return nil
        }
        return RuntimeMode(rawValue: raw)
    }

    private func setPersistedRuntimeMode(_ mode: RuntimeMode) {
        UserDefaults.standard.set(mode.rawValue, forKey: runtimeModeOverrideKey)
    }

    fileprivate func probeLiveAvailability(completion: @escaping (Bool) -> Void) {
        guard isRemoteCapable() else {
            completion(false)
            return
        }
        let liveURL = liveAppURL()
        var headRequest = URLRequest(url: liveURL)
        headRequest.httpMethod = "HEAD"
        headRequest.cachePolicy = .reloadIgnoringLocalCacheData
        headRequest.timeoutInterval = 2.0
        URLSession.shared.dataTask(with: headRequest) { _, response, error in
            let headOk = error == nil && ((response as? HTTPURLResponse).map { (200...399).contains($0.statusCode) } ?? false)
            if headOk {
                completion(true)
                return
            }
            var getRequest = URLRequest(url: liveURL)
            getRequest.httpMethod = "GET"
            getRequest.cachePolicy = .reloadIgnoringLocalCacheData
            getRequest.timeoutInterval = 2.5
            URLSession.shared.dataTask(with: getRequest) { _, response2, error2 in
                let getOk = error2 == nil && ((response2 as? HTTPURLResponse).map { (200...399).contains($0.statusCode) } ?? false)
                completion(getOk)
            }.resume()
        }.resume()
    }

    fileprivate func liveServerAPIURL(path: String) -> URL? {
        guard isRemoteCapable(), var components = URLComponents(url: liveAppURL(), resolvingAgainstBaseURL: false) else {
            return nil
        }
        components.query = nil
        components.fragment = nil
        components.path = path.hasPrefix("/") ? path : "/\(path)"
        return components.url
    }

    fileprivate func performLiveServerJSONRequest(
        path: String,
        method: String,
        body: [String: Any]? = nil,
        timeout: TimeInterval = 6.0,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        guard let url = liveServerAPIURL(path: path) else {
            completion(.failure(NSError(domain: "OMNI", code: 1, userInfo: [NSLocalizedDescriptionKey: "Live server URL is unavailable."])))
            return
        }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.cachePolicy = .reloadIgnoringLocalCacheData
        request.timeoutInterval = timeout
        if let body {
            do {
                request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
                request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            } catch {
                completion(.failure(error))
                return
            }
        }
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error {
                completion(.failure(error))
                return
            }
            guard let http = response as? HTTPURLResponse else {
                completion(.failure(NSError(domain: "OMNI", code: 2, userInfo: [NSLocalizedDescriptionKey: "No HTTP response from live server."])))
                return
            }
            let raw = data ?? Data()
            let parsedAny = (try? JSONSerialization.jsonObject(with: raw, options: [])) as? [String: Any]
            if !(200...299).contains(http.statusCode) {
                let message = (parsedAny?["error"] as? String) ?? "Live server request failed."
                completion(.failure(NSError(domain: "OMNI", code: http.statusCode, userInfo: [NSLocalizedDescriptionKey: message])))
                return
            }
            completion(.success(parsedAny ?? [:]))
        }.resume()
    }

    fileprivate func pushBackupPayloadToLiveServer(_ payload: [String: Any], completion: @escaping (Result<[String: Any], Error>) -> Void) {
        performLiveServerJSONRequest(path: "/api/backup/import", method: "POST", body: payload, timeout: 8.0, completion: completion)
    }

    fileprivate func fetchBackupPayloadFromLiveServer(completion: @escaping (Result<[String: Any], Error>) -> Void) {
        performLiveServerJSONRequest(path: "/api/backup/export", method: "GET", body: nil, timeout: 6.0, completion: completion)
    }
}

@objc(OmniRuntimeModePlugin)
public class OmniRuntimeModePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "OmniRuntimeModePlugin"
    public let jsName = "OmniRuntimeMode"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pushBackupToLive", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "fetchBackupFromLive", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "switchToBundled", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "switchToLive", returnType: CAPPluginReturnPromise)
    ]

    @objc func getStatus(_ call: CAPPluginCall) {
        guard let viewController = bridge?.viewController as? OmniBridgeViewController else {
            call.reject("Runtime mode controller unavailable.")
            return
        }
        call.resolve(viewController.runtimeModeStatusPayload())
    }

    @objc func switchToBundled(_ call: CAPPluginCall) {
        guard let viewController = bridge?.viewController as? OmniBridgeViewController else {
            call.reject("Runtime mode controller unavailable.")
            return
        }
        call.resolve(viewController.runtimeModeStatusPayload())
        viewController.switchRuntimeMode(to: .bundled, persist: true)
    }

    @objc func pushBackupToLive(_ call: CAPPluginCall) {
        guard let viewController = bridge?.viewController as? OmniBridgeViewController else {
            call.reject("Runtime mode controller unavailable.")
            return
        }
        let status = viewController.runtimeModeStatusPayload()
        guard (status["remoteCapable"] as? Bool) == true else {
            call.reject("Live runtime mode is not available in this build.")
            return
        }
        guard let payload = call.getObject("payload") else {
            call.reject("Backup payload missing.")
            return
        }
        viewController.probeLiveAvailability { reachable in
            DispatchQueue.main.async {
                guard reachable else {
                    call.reject("Mac live server is unreachable. Open OMNI on the Mac and press CONNECT IPHONE first.")
                    return
                }
                viewController.pushBackupPayloadToLiveServer(payload) { result in
                    DispatchQueue.main.async {
                        switch result {
                        case .success(let response):
                            call.resolve(response)
                        case .failure(let error):
                            call.reject(error.localizedDescription)
                        }
                    }
                }
            }
        }
    }

    @objc func fetchBackupFromLive(_ call: CAPPluginCall) {
        guard let viewController = bridge?.viewController as? OmniBridgeViewController else {
            call.reject("Runtime mode controller unavailable.")
            return
        }
        let status = viewController.runtimeModeStatusPayload()
        guard (status["remoteCapable"] as? Bool) == true else {
            call.reject("Live runtime mode is not available in this build.")
            return
        }
        viewController.probeLiveAvailability { reachable in
            DispatchQueue.main.async {
                guard reachable else {
                    call.reject("Mac live server is unreachable. Open OMNI on the Mac and press CONNECT IPHONE first.")
                    return
                }
                viewController.fetchBackupPayloadFromLiveServer { result in
                    DispatchQueue.main.async {
                        switch result {
                        case .success(let response):
                            call.resolve(response)
                        case .failure(let error):
                            call.reject(error.localizedDescription)
                        }
                    }
                }
            }
        }
    }

    @objc func switchToLive(_ call: CAPPluginCall) {
        guard let viewController = bridge?.viewController as? OmniBridgeViewController else {
            call.reject("Runtime mode controller unavailable.")
            return
        }
        let status = viewController.runtimeModeStatusPayload()
        guard (status["remoteCapable"] as? Bool) == true else {
            call.reject("Live runtime mode is not available in this build.")
            return
        }
        viewController.probeLiveAvailability { reachable in
            DispatchQueue.main.async {
                guard reachable else {
                    call.reject("Mac live server is unreachable. Open OMNI on the Mac and press CONNECT IPHONE first.")
                    return
                }
                call.resolve(status)
                viewController.switchRuntimeMode(to: .live, persist: true)
            }
        }
    }
}
