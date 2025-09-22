#!/usr/bin/env python3

import os
import sys
import subprocess

def run_server():
    try:
        print("Starting Sign Recognition API server...")
        print("Server will be available at: http://localhost:8000")
        print("API documentation at: http://localhost:8000/docs")
        print("\nPress Ctrl+C to stop the server")
        
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    run_server()