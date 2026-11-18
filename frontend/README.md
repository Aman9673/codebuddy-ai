# CodeBuddy AI

CodeBuddy is a beginner coding studio: Python lessons, a Python and JavaScript playground, the Panda tutor, and a notebook. The same site installs on a phone as an app.

## Run it on this computer

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Notes and Panda work in the browser without any other program. On this computer, if you also start the FastAPI backend, notes are saved in SQLite and Panda can use a local Ollama model.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Ollama is optional. Install it, run `ollama pull qwen2.5:3b`, and keep it running before you start the backend.

## Install it on a phone

Phones can only install the app from a secure address (`https://` or the phone's own localhost).

1. Publish the site using the steps below, then open its `https://` address on your phone. A local `http://<computer-ip>:3000` address can be used to preview the site on the same Wi-Fi, but browsers will not allow installing it or using its offline support from that address.
2. On Android, open that link in Chrome and tap **Install app** (or the menu, then **Add to Home screen**).
3. On iPhone, open it in Safari, tap **Share**, then **Add to Home Screen**.

Lessons, the playground, Panda's beginner answers, and notes then open from the home-screen icon. Notes stay in that browser on the device.

## Publish the website

The frontend is a Next.js app and can be deployed on its own.

1. Push the project to GitHub.
2. Import `frontend` on [Vercel](https://vercel.com/new).
3. Set `NEXT_PUBLIC_SITE_URL` to your public address, for example `https://your-name.vercel.app`.
4. Deploy, open the address on your phone, and install it.

The Python backend is for local SQLite notes and Ollama. The published site does not need it.

Set `NEXT_PUBLIC_API_URL` only if you host that API somewhere the phone can reach, and set `FRONTEND_ORIGIN` on the API to your website address.

The separate React Native Android/iOS app is in `../mobile`. Its Expo Go preview and store-build instructions are in [`../mobile/README.md`](../mobile/README.md).


## Launch validation and operating notes

The frontend can launch independently: notes, bookmarks, activity, code drafts, and quiz progress are stored in the current browser. There are no accounts or cross-device sync. The About & privacy page explains these limits to students.

- Python uses Pyodide 0.29.4 in a Web Worker, downloaded from jsDelivr on first use. Allow access to that CDN; a first Python run requires internet. JavaScript does not require this download. Both runners have a five-second execution limit and a Stop control; output is capped at 200 lines. Code is student-authored and runs locally, not in a hardened server sandbox. DOM examples and third-party Python packages are outside the beginner playground's scope.
- The optional FastAPI service is a local prototype without user authentication. Do not expose its notes API publicly as a shared notebook. Leave NEXT_PUBLIC_API_URL unset for a browser-only launch; add authentication and per-user authorization before offering hosted database notes.
- Set NEXT_PUBLIC_SITE_URL to the real HTTPS domain before building. Copy .env.example to .env.local and replace the example address. Verify the generated sitemap, metadata, and install behavior on that address.
- Run npm run lint and npm run build before deployment. Run npm start to serve the production build; npm run dev is for development. The service worker is registered only in production.
- Smoke-check: run a lesson's Python example, test input(), run JavaScript, stop an infinite loop, refresh a saved draft, save and filter a bookmark, pass a quiz, and create and refresh a note. Check a narrow phone layout as well as desktop.
- Notes support Markdown downloads and notebook JSON exports. Browser data is not a cloud backup. Full offline support for the Python runtime is not guaranteed.

Local browser QA screenshots and the smoke-check script are saved in .qa/ (ignored by Git). Verified with headless Chrome: Python, stdin, JavaScript, loop timeout, draft persistence, bookmarks, quiz completion, activity updates, note persistence, and mobile overflow checks for the main pages.
