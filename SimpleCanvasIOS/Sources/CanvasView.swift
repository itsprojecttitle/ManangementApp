import SwiftUI
import UniformTypeIdentifiers

struct CanvasView: View {
    @Binding var layers: [CanvasLayer]
    @Binding var selectedLayerID: UUID?
    var history: CanvasHistory
    let canvasSize: CGSize

    var body: some View {
        ZStack {
            Color.black
            DottedGrid(spacing: 32, dotSize: 2, dotColor: Color.green.opacity(0.2))
                .allowsHitTesting(false)

            ForEach($layers) { $layer in
                LayerView(
                    layer: $layer,
                    isSelected: layer.id == selectedLayerID,
                    onSelect: { selectedLayerID = layer.id },
                    onCommit: { history.push(layers) }
                )
            }
        }
        .frame(width: canvasSize.width, height: canvasSize.height)
        .contentShape(Rectangle())
        .onDrop(of: [UTType.image.identifier], isTargeted: nil) { providers in
            guard let provider = providers.first else { return false }
            provider.loadDataRepresentation(forTypeIdentifier: UTType.image.identifier) { data, _ in
                guard let data, let image = UIImage(data: data) else { return }
                DispatchQueue.main.async {
                    let position = CGPoint(x: canvasSize.width / 2, y: canvasSize.height / 2)
                    let newLayer = CanvasLayer(image: image, position: position)
                    history.push(layers)
                    layers.append(newLayer)
                    selectedLayerID = newLayer.id
                }
            }
            return true
        }
    }
}

struct LayerView: View {
    @Binding var layer: CanvasLayer
    let isSelected: Bool
    let onSelect: () -> Void
    let onCommit: () -> Void

    @State private var handleStartPos: CGPoint? = nil
    @GestureState private var dragDelta: CGSize = .zero
    @GestureState private var scaleDelta: CGFloat = 1.0
    @GestureState private var rotationDelta: Angle = .zero

    var body: some View {
        let drag = DragGesture(minimumDistance: 0)
            .updating($dragDelta) { value, state, _ in
                state = value.translation
            }

        // Scale is controlled by a slider (not pinch).
        let rotate = RotationGesture()
            .updating($rotationDelta) { value, state, _ in
                state = value
            }

        let combined = drag
            .simultaneously(with: rotate)
            .onChanged { _ in
                if !isSelected {
                    onSelect()
                }
            }
            .onEnded { value in
                onCommit()
                let dragValue = value.first?.translation ?? .zero
                let rotateValue = value.second ?? .zero
                layer.position = CGPoint(
                    x: layer.position.x + dragValue.width,
                    y: layer.position.y + dragValue.height
                )
                layer.rotation += rotateValue
            }

        let handleDrag = DragGesture(minimumDistance: 0)
            .onChanged { value in
                if !isSelected {
                    onSelect()
                }
                if handleStartPos == nil {
                    handleStartPos = layer.position
                }
                guard let start = handleStartPos else { return }
                layer.position = CGPoint(
                    x: start.x + value.translation.width,
                    y: start.y + value.translation.height
                )
            }
            .onEnded { _ in
                onCommit()
                handleStartPos = nil
            }

        ZStack {
            FeatheredImage(image: layer.image, feather: layer.feather)
                .frame(width: 800, height: 800)
            if isSelected {
                Rectangle()
                    .stroke(Color.green.opacity(0.7), lineWidth: 2)
                    .frame(width: 800, height: 800)
                    .allowsHitTesting(false)
                Circle()
                    .fill(Color.black)
                    .overlay(Circle().stroke(Color.green.opacity(0.9), lineWidth: 2))
                    .frame(width: 24, height: 24)
                    .offset(x: 400 - 12, y: 400 - 12)
                    .gesture(handleDrag)
            }
        }
            .contentShape(Rectangle())
            .scaleEffect(layer.scale)
            .rotationEffect(layer.rotation + rotationDelta)
            .position(
                x: layer.position.x + dragDelta.width,
                y: layer.position.y + dragDelta.height
            )
            .gesture(combined)
            .simultaneousGesture(TapGesture().onEnded { onSelect() })
    }
}

struct CanvasExportView: View {
    let layers: [CanvasLayer]
    let canvasSize: CGSize

    var body: some View {
        ZStack {
            Color.black
            DottedGrid(spacing: 32, dotSize: 2, dotColor: Color.green.opacity(0.2))
            ForEach(layers) { layer in
                FeatheredImage(image: layer.image, feather: layer.feather)
                    .frame(maxWidth: 800, maxHeight: 800)
                    .scaleEffect(layer.scale)
                    .rotationEffect(layer.rotation)
                    .position(x: layer.position.x, y: layer.position.y)
            }
        }
        .frame(width: canvasSize.width, height: canvasSize.height)
    }
}
