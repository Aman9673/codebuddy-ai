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

## Python API

The website uses the FastAPI backend in [`backend`](./backend) for accounts, database notes, and the Ollama tutor. The mobile app can use on-device notes and tutor tips without the API. See [`frontend/README.md`](./frontend/README.md) for local backend setup.

### C++, Java, and C# playground execution

Lesson examples, practice exercises, and saved drafts are available in the website playground. To enable **Run code** for these three languages, connect the FastAPI server to a private [Piston](https://github.com/engineer-man/piston) instance. Install the `c++`, `java`, and `csharp.net` runtimes in Piston, set `PISTON_API_URL` to its API base (for example, `http://127.0.0.1:2000/api/v2`), then start FastAPI with that environment variable set. Set `PISTON_API_TOKEN` in the backend environment if your endpoint requires a bearer token.

Python and JavaScript run in the browser. For the compiled languages, Run sends the editor contents and standard input to the configured runner.
