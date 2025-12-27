# 🍎 iOS Simulator Instructions

Since you are using **Expo**, you do **NOT** need to open a specific project file inside Xcode to run the app. Xcode provides the **Simulators**, and Expo talks to them automatically.

## 1. Prerequisites
- [x] Download **Xcode** from the App Store.
- [ ] Open Xcode once to accept the license agreement.
- [ ] Go to **Xcode > Settings > Platforms** and ensure "iOS" is installed (usually installed by default).

## 2. How to Run (The Easy Way)
You don't need to open the Xcode app every time. Just use your terminal!

1.  **Open your Terminal** (VS Code).
2.  Start the mobile app:
    ```bash
    cd apps/mobile
    npx expo start
    ```
3.  Once the server starts, press **`i`** on your keyboard.
4.  Expo will automatically:
    -   Open the iPhone Simulator.
    -   Install "Expo Go".
    -   Launch your **Exam Evaluator** app inside it.

## 3. Troubleshooting
**"No iPhone Simulator found"**
-   Open **Xcode**.
-   In the top menu, go to **Window > Devices and Simulators**.
-   Make sure you have at least one Simulator listed under "Simulators".

**"Command check failed"**
-   Open Xcode.
-   Go to **Xcode > Settings > Locations**.
-   Ensure "Command Line Tools" is selected (e.g., "Xcode 16.0").
