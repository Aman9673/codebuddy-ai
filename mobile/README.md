# CodeBuddy AI mobile app

This is the native Android and iOS app, built with React Native and Expo. It shares the website's Python course and offers a mobile dashboard, JavaScript playground, Panda tutor, and notebook.

## Try it on a phone

1. Install **Expo Go** on your Android phone or iPhone.
2. From this directory, run:

   ```bash
   npm install
   npx expo start --lan
   ```

3. Keep your phone and computer on the same Wi-Fi, then scan the terminal's QR code with Expo Go. If the computer's firewall asks, allow the development server on your private network.

The project uses Expo SDK 57 so it can be opened in Expo Go on a physical phone. This preview is not a store-installable build.

## Create store builds

Store builds use Expo Application Services (EAS) and can be created from Windows:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --profile production --platform android
npx eas-cli@latest build --profile production --platform ios
```

After the builds are ready, submit them with:

```bash
npx eas-cli@latest submit --platform android
npx eas-cli@latest submit --platform ios
```

You need an Expo account, a Google Play developer account, and an Apple Developer account. Before submission, confirm the application IDs in `app.json` are available to you, add store screenshots and descriptions, and publish a privacy policy. EAS will guide you through signing credentials; do not commit signing keys or credentials.

## App data and tutor connection

Lesson progress and notebook entries are stored on the device with AsyncStorage. They are not encrypted and are not synced between devices.

Panda provides beginner tips on-device. To connect it to a hosted CodeBuddy API, copy `.env.example` to `.env`, set `EXPO_PUBLIC_API_URL` to the API's public HTTPS base URL, then rebuild the app. Do not put secret keys in `EXPO_PUBLIC_*` values.

The playground executes JavaScript in a sandboxed WebView. Like any code runner, it should be treated as a learning feature rather than a hardened environment for running untrusted code.
