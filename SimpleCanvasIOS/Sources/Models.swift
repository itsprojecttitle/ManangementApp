import SwiftUI
import PhotosUI

struct CanvasLayer: Identifiable {
    let id: UUID
    var image: UIImage
    var position: CGPoint
    var scale: CGFloat
    var rotation: Angle
    var feather: CGFloat

    init(image: UIImage, position: CGPoint) {
        self.id = UUID()
        self.image = image
        self.position = position
        self.scale = 1.0
        self.rotation = .zero
        self.feather = 0.0
    }

    init(copying other: CanvasLayer) {
        self.id = other.id
        self.image = other.image
        self.position = other.position
        self.scale = other.scale
        self.rotation = other.rotation
        self.feather = other.feather
    }
}

final class CanvasHistory {
    private var undoStack: [[CanvasLayer]] = []
    private var redoStack: [[CanvasLayer]] = []

    func push(_ layers: [CanvasLayer]) {
        undoStack.append(layers.map { CanvasLayer(copying: $0) })
        redoStack.removeAll()
    }

    func canUndo() -> Bool { !undoStack.isEmpty }
    func canRedo() -> Bool { !redoStack.isEmpty }

    func undo(current: [CanvasLayer]) -> [CanvasLayer] {
        guard let last = undoStack.popLast() else { return current }
        redoStack.append(current.map { CanvasLayer(copying: $0) })
        return last.map { CanvasLayer(copying: $0) }
    }

    func redo(current: [CanvasLayer]) -> [CanvasLayer] {
        guard let last = redoStack.popLast() else { return current }
        undoStack.append(current.map { CanvasLayer(copying: $0) })
        return last.map { CanvasLayer(copying: $0) }
    }

    func reset() {
        undoStack.removeAll()
        redoStack.removeAll()
    }
}

struct DottedGrid: View {
    let spacing: CGFloat
    let dotSize: CGFloat
    let dotColor: Color

    var body: some View {
        GeometryReader { geo in
            Canvas { context, size in
                let columns = Int(size.width / spacing) + 1
                let rows = Int(size.height / spacing) + 1
                for row in 0..<rows {
                    for col in 0..<columns {
                        let x = CGFloat(col) * spacing
                        let y = CGFloat(row) * spacing
                        let rect = CGRect(x: x - dotSize / 2, y: y - dotSize / 2, width: dotSize, height: dotSize)
                        context.fill(Path(ellipseIn: rect), with: .color(dotColor))
                    }
                }
            }
        }
        .drawingGroup()
    }
}

struct FeatheredImage: View {
    let image: UIImage
    let feather: CGFloat

    var body: some View {
        let base = Image(uiImage: image).resizable().scaledToFit()
        if feather <= 0.5 {
            base
        } else {
            base.mask(
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .blur(radius: feather)
            )
        }
    }
}
