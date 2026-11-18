/* Executes student-authored code off the UI thread, not on a server. */
let python;
let busy = false;
const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.29.4/full/";
self.onmessage = async ({ data }) => {
  if (busy) return;
  busy = true;
  let lines = 0;
  const send = self.postMessage.bind(self);
  const write = (value, kind = "log") => {
    if (lines++ >= 200) throw new Error("Output limit reached (200 lines). Try a smaller loop.");
    send({ type: "line", kind, text: String(value).slice(0, 4000) });
  };
  try {
    if (data.language === "python" && !python) {
      send({ type: "loading" });
      importScripts(`${PYODIDE_URL}pyodide.js`);
      python = await self.loadPyodide({ indexURL: PYODIDE_URL, stdout: () => {}, stderr: () => {} });
    }
    send({ type: "started" });
    const started = performance.now();
    if (data.language === "python") {
      python.setStdout({ batched: (text) => write(text) });
      python.setStderr({ batched: (text) => write(text, "error") });
      const input = String(data.stdin || "").split("\n");
      let index = 0;
      python.setStdin({ stdin: () => index < input.length ? input[index++] : undefined });
      const globals = python.toPy({ __name__: "__main__" });
      try {
        const result = await python.runPythonAsync(data.code, { globals });
        if (result && typeof result.destroy === "function") result.destroy();
      } finally { globals.destroy(); }
    } else {
      const format = (value) => {
        if (typeof value === "string") return value;
        try { return JSON.stringify(value) ?? String(value); } catch { return String(value); }
      };
      const output = Object.fromEntries(["log", "info", "warn", "error"].map((kind) => [kind, (...args) => write(args.map(format).join(" "), kind)]));
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      await new AsyncFunction("console", data.code)(output);
    }
    send({ type: "done", duration: Math.round(performance.now() - started) });
  } catch (error) { send({ type: "error", text: error instanceof Error ? error.message : String(error) }); }
  finally { busy = false; }
};
