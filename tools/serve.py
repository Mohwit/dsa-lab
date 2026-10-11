"""Serve the DSA Lab site and keep the page's progress in tracking/lab-state.json.

Usage:
  python3 tools/serve.py [--port 8765]     then open http://localhost:8765

GET /api/state returns the saved progress; PUT /api/state replaces it (written atomically).
Everything else is served from site/. Standard library only; listens on localhost only.
"""
import argparse, functools, http.server, json, os, pathlib, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent      # workspace root
SITE = ROOT / "site"
STATE = ROOT / "tracking" / "lab-state.json"


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")         # a rebuilt page shows on refresh
        super().end_headers()

    def send_json(self, code, body):
        data = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/state":
            return self.send_json(200, STATE.read_text() if STATE.exists() else "{}")
        super().do_GET()

    def do_PUT(self):
        if self.path.split("?")[0] != "/api/state":
            return self.send_json(404, '{"error": "not found"}')
        try:
            state = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            assert isinstance(state, dict)
        except Exception:
            return self.send_json(400, '{"error": "expected a JSON object"}')
        STATE.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp = tempfile.mkstemp(dir=STATE.parent, prefix=".lab-state.")
        with os.fdopen(fd, "w") as f:
            json.dump(state, f, indent=2, sort_keys=True)
            f.write("\n")
        os.replace(tmp, STATE)
        self.send_json(200, '{"ok": true}')

    do_POST = do_PUT

    def log_message(self, fmt, *args):
        if "/api/state" not in self.path:
            super().log_message(fmt, *args)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8765)
    a = ap.parse_args()
    server = http.server.ThreadingHTTPServer(("127.0.0.1", a.port), functools.partial(Handler, directory=str(SITE)))
    print(f"DSA Lab: http://localhost:{a.port}  (progress -> {STATE.relative_to(ROOT)}; Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
