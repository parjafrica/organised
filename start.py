#!/usr/bin/env python3
"""
Granada OS FastAPI Services Launcher
Starts all Python FastAPI services for 90% Python architecture
"""

import subprocess
import time
import signal
import sys
import asyncio
import httpx
from multiprocessing import Process
import os

sys.stdout.reconfigure(encoding='utf-8')

# Service configurations
SERVICES = {
    "main_api": {
        "file": "server/core/main.py",
        "port": 8000,
        "name": "Main API - Core Functionality"
    },
    "bot_service": {
        "file": "server/bots/bot_service.py",
        "port": 8001,
        "name": "Bot Service - Web Scraping & Automation"
    },
    "academic_engine": {
        "file": "server/engines/academic/academic_engine.py",
        "port": 8004,
        "name": "Academic Engine - Literature Review & Research"
    }
}

processes = []

def start_service(service_name, config):
    """Start individual FastAPI service"""
    print(f"🚀 Starting {config['name']} on port {config['port']}")
    
    cmd = [
        "python", "-m", "uvicorn",
        f"{config['file'].replace('/', '.').replace('.py', '')}:app",
        "--host", "0.0.0.0",
        "--port", str(config['port'])
    ]
    
    try:
        process = subprocess.Popen(
            cmd,
            text=True,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        processes.append((service_name, process, config))
        return process
    except Exception as e:
        print(f"❌ Failed to start {service_name}: {e}")
        return None

def signal_handler(sig, frame):
    """Handle shutdown signals"""
    print("\n🛑 Shutting down all FastAPI services...")
    for service_name, process, config in processes:
        try:
            process.terminate()
            process.wait(timeout=5)
            print(f"✅ Stopped {service_name}")
        except subprocess.TimeoutExpired:
            process.kill()
            print(f"🔥 Force killed {service_name}")
        except Exception as e:
            print(f"⚠️ Error stopping {service_name}: {e}")
    sys.exit(0)

async def health_check():
    """Check health of all services"""
    print("\n🔍 Performing health checks...")
    
    async with httpx.AsyncClient() as client:
        for service_name, _, config in processes:
            try:
                response = await client.get(
                    f"http://localhost:{config['port']}/", 
                    timeout=5.0
                )
                if response.status_code == 200:
                    print(f"✅ {service_name} - Healthy")
                else:
                    print(f"⚠️ {service_name} - Status {response.status_code}")
            except Exception as e:
                print(f"❌ {service_name} - Unreachable: {e}")

def print_banner():
    """Print startup banner"""
    print("""
██████╗ ██████╗  █████╗ ███╗   ██╗ █████╗ ██████╗  █████╗     ██████╗ ███████╗
██╔════╝ ██╔══██╗██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔══██╗   ██╔═══██╗██╔════╝
██║  ███╗██████╔╝███████║██╔██╗ ██║███████║██║  ██║███████║   ██║   ██║███████╗
██║   ██║██╔══██╗██╔══██║██║╚██╗██║██╔══██║██║  ██║██╔══██║   ██║   ██║╚════██║
╚██████╔╝██║  ██║██║  ██║██║ ╚████║██║  ██║██████╔╝██║  ██║   ╚██████╔╝███████║
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚══════╝
    
    🚀 GRANADA OS - 90% PYTHON FASTAPI ARCHITECTURE 🚀
    ===================================================
    """)

def print_service_urls():
    """Print service access URLs"""
    print("\n📡 SERVICE ACCESS URLS:")
    print("=" * 50)
    for service_name, _, config in processes:
        print(f"🔗 {config['name']}")
        print(f"   └─ http://localhost:{config['port']}/")
        print(f"   └─ http://localhost:{config['port']}/docs (OpenAPI)")
    print("\n🌐 Main Frontend: http://localhost:5000")
    print("=" * 50)

def main():
    """Main execution"""
    print_banner()
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start all services
    print("🚀 Starting all FastAPI services...")
    for service_name, config in SERVICES.items():
        start_service(service_name, config)
        time.sleep(2)  # Stagger startup
    
    print(f"\n✅ Started {len(processes)} FastAPI services")
    print_service_urls()
    
    # Wait for services to be ready
    time.sleep(5)
    
    # Run health check
    try:
        asyncio.run(health_check())
    except Exception as e:
        print(f"⚠️ Health check failed: {e}")
    
    print("\n🎯 GRANADA OS PYTHON SERVICES RUNNING")
    print("💡 Press Ctrl+C to stop all services")
    
    # Keep running
    try:
        while True:
            time.sleep(60)
            # Periodic health check
            try:
                asyncio.run(health_check())
            except:
                pass
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

if __name__ == "__main__":
    main()