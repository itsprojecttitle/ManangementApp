Drop real offline exercise photos here.

Supported formats:
- `.png`
- `.jpg`
- `.jpeg`
- `.webp`
- `.gif`
- `.heic`
- `.avif`

Recommended naming:
- `bench_press.jpg`
- `dead_bug.png`
- `farmers_carry.webp`

You can also organize by section:
- `Chest/bench_press.jpg`
- `Core_Abs/dead_bug.png`
- `Boxing/shadow_boxing_drill.jpg`

Matching rules:
- The app first looks for `section + exercise name`
- Then it looks for just the exercise name
- Then it falls back to the generated offline placeholder

After adding new photos:
1. Run the app build again
2. Run Capacitor copy again
3. Reinstall from Xcode
