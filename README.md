# CodeBuddy AI

CodeBuddy is a beginner coding studio with a website/PWA and a separate native Android/iOS app.

## Website

The Next.js site lives in [`frontend`](./frontend). Start it with:

```bash
cd frontend
npm install
npm run dev
```

The website's production build can be hosted on Vercel. See [`frontend/README.md`](./frontend/README.md) for phone installation and publishing steps. A public HTTPS URL is required for PWA installation.

## Native mobile app

The React Native and Expo app lives in [`mobile`](./mobile). To preview it on a phone:

```bash
cd mobile
npm install
npx expo start --lan
```

Install Expo Go on the phone and scan the terminal QR code while both devices are on the same Wi-Fi. See [`mobile/README.md`](./mobile/README.md) for the store-build and submission steps.

The website and mobile app are separate projects: changes to one do not automatically change the other.

## Optional Python API

The FastAPI backend in [`backend`](./backend) supports saved database notes and an Ollama tutor. The website and mobile app still provide on-device notes and tutor tips without the API. See [`frontend/README.md`](./frontend/README.md) for local backend setup.
