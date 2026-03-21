import SwiftUI

struct CanvasSettingsView: View {
    @Binding var widthText: String
    @Binding var heightText: String
    let onApply: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Text("Canvas Size")
                .font(.headline)

            HStack(spacing: 12) {
                TextField("Width", text: $widthText)
                    .keyboardType(.numberPad)
                    .textFieldStyle(.roundedBorder)
                Text("x")
                TextField("Height", text: $heightText)
                    .keyboardType(.numberPad)
                    .textFieldStyle(.roundedBorder)
            }
            .padding(.horizontal, 16)

            HStack(spacing: 8) {
                Button("1080x1350") {
                    widthText = "1080"
                    heightText = "1350"
                }
                Button("1080x1080") {
                    widthText = "1080"
                    heightText = "1080"
                }
                Button("1200x1500") {
                    widthText = "1200"
                    heightText = "1500"
                }
            }
            .font(.caption)

            Button("Apply") {
                onApply()
            }
            .buttonStyle(.borderedProminent)

            Spacer()
        }
        .padding(.top, 24)
    }
}
