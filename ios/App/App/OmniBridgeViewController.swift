import UIKit
import Capacitor

@objc(OmniBridgeViewController)
class OmniBridgeViewController: CAPBridgeViewController {
    fileprivate enum RuntimeMode: String {
        case live
        case bundled
    }

    private let runtimeModeOverrideKey = "OMNIRuntimeModeOverride"

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
        guard isRemoteCapable(), let mode = persistedRuntimeMode(), mode == .bundled else {
            return
        }
        loadRuntimeMode(mode)
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
            return URL(string: "capacitor://localhost/index.html")!
        }
        if let startPath = bridge.config.appStartPath, !startPath.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return bridge.config.localURL.appendingPathComponent(startPath)
        }
        return bridge.config.localURL.appendingPathComponent("index.html")
    }

    private func isRemoteCapable() -> Bool {
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
        return isRemoteCapable() ? .live : .bundled
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
}

@objc(OmniRuntimeModePlugin)
public class OmniRuntimeModePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "OmniRuntimeModePlugin"
    public let jsName = "OmniRuntimeMode"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise),
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
        call.resolve(status)
        viewController.switchRuntimeMode(to: .live, persist: true)
    }
}
