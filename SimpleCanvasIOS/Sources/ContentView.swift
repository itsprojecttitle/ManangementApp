import SwiftUI
import PhotosUI

struct ContentView: View {
    @Environment(\.displayScale) private var displayScale
    @State private var layers: [CanvasLayer] = []
    @State private var selectedLayerID: UUID? = nil
    @State private var history = CanvasHistory()

    @State private var photoItem: PhotosPickerItem? = nil
    @State private var showExportAlert = false
    @State private var exportMessage = ""
    @State private var showLayers = false
    @State private var showCanvasSettings = false
    @State private var canvasWidthText = "1080"
    @State private var canvasHeightText = "1350"
    @State private var copiedLayer: CanvasLayer? = nil

    @State private var canvasSize = CGSize(width: 1080, height: 1350)

    var body: some View {
        VStack(spacing: 12) {
            headerBar
                .background(Color.black)
                .overlay(Rectangle().frame(height: 1).foregroundColor(Color.green.opacity(0.4)), alignment: .bottom)

            GeometryReader { geo in
                let scale = min(geo.size.width / canvasSize.width, geo.size.height / canvasSize.height)
                let scaledWidth = canvasSize.width * scale
                let scaledHeight = canvasSize.height * scale
                ZStack {
                    CanvasView(
                        layers: $layers,
                        selectedLayerID: $selectedLayerID,
                        history: history,
                        canvasSize: canvasSize
                    )
                    .frame(width: canvasSize.width, height: canvasSize.height)
                    .scaleEffect(scale, anchor: .center)
                    .frame(width: scaledWidth, height: scaledHeight)
                    .overlay(
                        Rectangle()
                            .stroke(Color.green.opacity(0.6), lineWidth: 2)
                    )
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                .background(Color.black)
            }

            if let selected = bindingForSelectedLayer() {
                VStack(spacing: 6) {
                    Text("Feather")
                        .font(.caption)
                        .foregroundColor(.green.opacity(0.75))
                    Slider(
                        value: selected.feather,
                        in: 0...30,
                        step: 0.5,
                        onEditingChanged: { editing in
                            if editing {
                                history.push(layers)
                            }
                        }
                    )
                    Text("Scale")
                        .font(.caption)
                        .foregroundColor(.green.opacity(0.75))
                    Slider(
                        value: selected.scale,
                        in: 0.1...3.0,
                        step: 0.01,
                        onEditingChanged: { editing in
                            if editing {
                                history.push(layers)
                            }
                        }
                    )
                }
                .padding(.horizontal, 16)
            }
        }
        .padding(.top, 12)
        .background(Color.black)
        .tint(Color.green)
        .onChange(of: photoItem) { _, newItem in
            guard let newItem else { return }
            Task { await importFromPicker(item: newItem) }
        }
        .alert("Export", isPresented: $showExportAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(exportMessage)
        }
        .sheet(isPresented: $showLayers) {
            LayerListPanel(
                layers: $layers,
                selectedLayerID: $selectedLayerID,
                onMove: { history.push(layers) },
                onDelete: { history.push(layers) }
            )
        }
        .sheet(isPresented: $showCanvasSettings) {
            CanvasSettingsView(
                widthText: $canvasWidthText,
                heightText: $canvasHeightText,
                onApply: applyCanvasSize
            )
        }
    }

    private var headerBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                Button("Copy") { copySelectedLayer() }
                    .disabled(selectedLayerID == nil)
                Button("Paste") { pasteFromClipboardOrCopy() }
                PhotosPicker(selection: $photoItem, matching: .images) {
                    Text("Import")
                }
                Button("Undo") {
                    layers = history.undo(current: layers)
                    selectedLayerID = nil
                }
                .disabled(!history.canUndo())
                Button("Redo") {
                    layers = history.redo(current: layers)
                    selectedLayerID = nil
                }
                .disabled(!history.canRedo())
                Button("Export") { exportImage() }
                Button("Canvas") { showCanvasSettings = true }
                Button("Layers") { showLayers = true }
                Button("Back") { sendBackward() }
                    .disabled(!canSendBackward())
                Button("Front") { bringForward() }
                    .disabled(!canBringForward())
                Button("Delete") { deleteSelected() }
                    .disabled(selectedLayerID == nil)
                Button("Clear") {
                    history.push(layers)
                    layers.removeAll()
                    selectedLayerID = nil
                }
                .foregroundColor(.red)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
        }
        .font(.system(.caption, design: .monospaced))
        .foregroundColor(.green)
    }

    private func importFromPicker(item: PhotosPickerItem) async {
        if let data = try? await item.loadTransferable(type: Data.self),
           let image = UIImage(data: data) {
            addLayer(image: image)
        }
        await MainActor.run { photoItem = nil }
    }

    private func pasteFromClipboard() {
        if let image = UIPasteboard.general.image {
            addLayer(image: image)
        } else {
            exportMessage = "Clipboard does not contain an image."
            showExportAlert = true
        }
    }

    private func copySelectedLayer() {
        guard let selected = bindingForSelectedLayer()?.wrappedValue else { return }
        copiedLayer = CanvasLayer(copying: selected)
    }

    private func pasteFromClipboardOrCopy() {
        if let image = UIPasteboard.general.image {
            addLayer(image: image)
            return
        }
        guard let copiedLayer else {
            exportMessage = "Clipboard is empty and no layer is copied."
            showExportAlert = true
            return
        }
        history.push(layers)
        var newLayer = CanvasLayer(copying: copiedLayer)
        newLayer.position = CGPoint(
            x: newLayer.position.x + 20,
            y: newLayer.position.y + 20
        )
        layers.append(newLayer)
        selectedLayerID = newLayer.id
    }

    @MainActor
    private func addLayer(image: UIImage) {
        history.push(layers)
        let position = CGPoint(x: canvasSize.width / 2, y: canvasSize.height / 2)
        let newLayer = CanvasLayer(image: image, position: position)
        layers.append(newLayer)
        selectedLayerID = newLayer.id
    }

    private func applyCanvasSize() {
        let width = Double(canvasWidthText.trimmingCharacters(in: .whitespacesAndNewlines)) ?? 1080
        let height = Double(canvasHeightText.trimmingCharacters(in: .whitespacesAndNewlines)) ?? 1350
        let next = CGSize(width: max(200, width), height: max(200, height))
        canvasSize = next
        showCanvasSettings = false
    }

    private func exportImage() {
        let exportView = CanvasExportView(layers: layers, canvasSize: canvasSize)
        let renderer = ImageRenderer(content: exportView)
        renderer.scale = displayScale
        if let image = renderer.uiImage {
            UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
            exportMessage = "Saved to Photos."
        } else {
            exportMessage = "Export failed."
        }
        showExportAlert = true
    }

    private func bindingForSelectedLayer() -> Binding<CanvasLayer>? {
        guard let id = selectedLayerID,
              let index = layers.firstIndex(where: { $0.id == id }) else { return nil }
        return $layers[index]
    }

    private func selectedIndex() -> Int? {
        guard let id = selectedLayerID else { return nil }
        return layers.firstIndex(where: { $0.id == id })
    }

    private func canBringForward() -> Bool {
        guard let index = selectedIndex() else { return false }
        return index < layers.count - 1
    }

    private func canSendBackward() -> Bool {
        guard let index = selectedIndex() else { return false }
        return index > 0
    }

    private func bringForward() {
        guard let index = selectedIndex(), index < layers.count - 1 else { return }
        history.push(layers)
        layers.swapAt(index, index + 1)
    }

    private func sendBackward() {
        guard let index = selectedIndex(), index > 0 else { return }
        history.push(layers)
        layers.swapAt(index, index - 1)
    }

    private func deleteSelected() {
        guard let index = selectedIndex() else { return }
        history.push(layers)
        layers.remove(at: index)
        selectedLayerID = nil
    }
}

#Preview {
    ContentView()
}
