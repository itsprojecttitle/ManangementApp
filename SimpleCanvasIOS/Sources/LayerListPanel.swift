import SwiftUI

struct LayerListPanel: View {
    @Binding var layers: [CanvasLayer]
    @Binding var selectedLayerID: UUID?
    let onMove: () -> Void
    let onDelete: () -> Void

    var body: some View {
        NavigationView {
            List {
                ForEach(Array(layers.enumerated()).reversed(), id: \.element.id) { index, layer in
                    HStack(spacing: 12) {
                        Image(uiImage: layer.image)
                            .resizable()
                            .scaledToFill()
                            .frame(width: 44, height: 44)
                            .clipped()
                            .cornerRadius(6)

                        Text("Layer \(index + 1)")
                            .font(.body)

                        Spacer()

                        Button("Up") {
                            moveLayer(from: index, to: index + 1)
                        }
                        .disabled(index >= layers.count - 1)

                        Button("Down") {
                            moveLayer(from: index, to: index - 1)
                        }
                        .disabled(index <= 0)
                    }
                    .contentShape(Rectangle())
                    .onTapGesture { selectedLayerID = layer.id }
                }
                .onDelete { offsets in
                    onDelete()
                    let realOffsets = offsets.map { layers.count - 1 - $0 }.sorted()
                    layers.remove(atOffsets: IndexSet(realOffsets))
                    selectedLayerID = nil
                }
            }
            .navigationTitle("Layers")
            .toolbar {
                EditButton()
            }
        }
    }

    private func moveLayer(from: Int, to: Int) {
        guard from != to, from >= 0, from < layers.count, to >= 0, to < layers.count else { return }
        onMove()
        layers.swapAt(from, to)
    }
}
