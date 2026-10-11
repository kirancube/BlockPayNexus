"""
SentinelAI X Dashboard & API Launcher
Starts the Tactical Operations Center interface and Central Cloud Command API.
"""

import sys
import os
import argparse

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sentinel.api.server import HAS_FASTAPI, create_fastapi_app, run_standalone_server


def main():
    parser = argparse.ArgumentParser(description="SentinelAI X Tactical Operations Launcher")
    parser.add_argument("--host", default="127.0.0.1", help="Host interface to bind")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on")
    args = parser.parse_args()

    print("=" * 70)
    print("  SENTINELAI X // AUTONOMOUS PUBLIC SAFETY INTELLIGENCE PLATFORM")
    print(f"  Tactical Operations Command Dashboard: http://{args.host}:{args.port}")
    print("=" * 70)

    if HAS_FASTAPI:
        try:
            import uvicorn
            app = create_fastapi_app()
            uvicorn.run(app, host=args.host, port=args.port)
            return
        except Exception as e:
            print(f"[!] Uvicorn launch encountered notice ({e}). Falling back to standalone server.")

    run_standalone_server(port=args.port, host=args.host)


if __name__ == "__main__":
    main()
