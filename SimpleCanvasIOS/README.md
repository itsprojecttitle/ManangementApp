# SimpleCanvasIOS

Minimal SwiftUI canvas app skeleton for iOS (Xcode).

Features:
- White grid background (dots)
- Paste/import images onto canvas
- Drag, pinch to scale, rotate
- Per-layer feather slider
- Undo/redo
- Export to PNG

## How to Use in Xcode
1. Create a new **iOS App** project in Xcode (SwiftUI).
2. Replace the generated files with the contents in `SimpleCanvasIOS/Sources/`.
3. Ensure deployment target is iOS 16+ (needed for `ImageRenderer`).
4. Build and run on device.

## Notes
- Paste uses the system clipboard (UIImage).
- Import uses PhotosPicker.
- Export saves to Photos (request permission on first use).
