"""執行：python3 -m server.app；僅供本機，不是公開行情服務。"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import BoundedSemaphore
from urllib.parse import unquote, urlsplit
import argparse
import json
from .market import collect

ROOT = Path(__file__).resolve().parents[1]
BUSY = BoundedSemaphore(1)

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()
    def send_json(self, data, code=200):
        body=json.dumps(data, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def do_GET(self):
        host=self.headers.get('Host','').split(':')[0]
        if host not in ('127.0.0.1', 'localhost'):
            return self.send_error(403)
        path=unquote(urlsplit(self.path).path)
        if path == '/api/market-quotes':
            if not BUSY.acquire(blocking=False):
                return self.send_json({'errorCode':'busy'},429)
            try:
                return self.send_json(collect())
            finally:
                BUSY.release()
        if path.startswith('/api/'):
            return self.send_json({'errorCode':'not_found'},404)
        if any(part.startswith('.') for part in Path(path).parts if part != '/') or path.startswith(('/server/','/tests/')):
            return self.send_error(404)
        if path.endswith('/') and path not in ('/', '/modules/processes/', '/modules/market-cost/'):
            return self.send_error(404)
        return super().do_GET()

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description='供應鏈作品集本機預覽與行情服務')
    parser.add_argument('--port',type=int,default=8766)
    args=parser.parse_args()
    with ThreadingHTTPServer(('127.0.0.1',args.port),Handler) as server:
        print(f'Local: http://127.0.0.1:{args.port}/',flush=True)
        server.serve_forever()
