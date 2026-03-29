import os
import json
import asyncio
import threading
import sys
import io
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sse_starlette.sse import EventSourceResponse

# Import agents as modules
import red_agent
import blue_agent

app = FastAPI(title="RedBlue Integration API")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
class SystemState:
    def __init__(self):
        self.status = "idle"  # idle, scanning, scan_done, patching, secured
        self.logs = []
        self.log_queue = asyncio.Queue()
        self.findings_count = 0
        self.high_severity_count = 0
        self.endpoints_hit = 0
        self.last_run_time = None

state = SystemState()

# Log capturing helper
class LogCapture(io.StringIO):
    def __init__(self, step_name, loop):
        super().__init__()
        self.step_name = step_name
        self.loop = loop

    def write(self, s):
        if s.strip():
            log_entry = {
                "time": datetime.now().strftime("%H:%M:%S"),
                "step": self.step_name,
                "message": s.strip()
            }
            state.logs.append(log_entry)
            # Push to SSE queue
            self.loop.call_soon_threadsafe(state.log_queue.put_nowait, log_entry)
        return super().write(s)

def run_agent_in_thread(agent_module, step_name, next_status, loop):
    original_stdout = sys.stdout
    capture = LogCapture(step_name, loop)
    sys.stdout = capture
    
    try:
        print(f"[{step_name}] initializing autonomous process...")
        agent_module.run()
        state.status = next_status
        print(f"[{step_name}] process complete. status: {next_status}")
        
        # Update stats if it was a scan
        if step_name == "attack":
            try:
                with open("vul_report.json", "r") as f:
                    report = json.load(f)
                    findings = report.get("findings", [])
                    state.findings_count = len(findings)
                    state.high_severity_count = len([f for f in findings if f.get("severity") in ["HIGH", "CRITICAL"]])
                    state.endpoints_hit = len(set([f.get("endpoint") for f in findings]))
            except:
                pass
    except Exception as e:
        print(f"Error running {step_name}: {str(e)}")
        state.status = "error"
    finally:
        sys.stdout = original_stdout

# Endpoints
@app.post("/api/scan")
async def start_scan(background_tasks: BackgroundTasks):
    if state.status == "scanning":
        raise HTTPException(status_code=400, detail="Scan already in progress")
    
    state.status = "scanning"
    state.logs = [] # Clear logs for new run
    # Re-create queue for fresh SSE stream
    state.log_queue = asyncio.Queue()
    
    loop = asyncio.get_running_loop()
    background_tasks.add_task(run_agent_in_thread, red_agent, "attack", "scan_done", loop)
    return {"message": "Scan started"}

@app.post("/api/patch")
async def start_patch(background_tasks: BackgroundTasks):
    if state.status == "patching":
        raise HTTPException(status_code=400, detail="Patch already in progress")
    
    state.status = "patching"
    loop = asyncio.get_running_loop()
    background_tasks.add_task(run_agent_in_thread, blue_agent, "blue", "secured", loop)
    return {"message": "Patching started"}

@app.get("/api/status")
async def get_status():
    return {
        "status": state.status,
        "stats": {
            "vulnerabilities": state.findings_count,
            "high_severity": state.high_severity_count,
            "endpoints": state.endpoints_hit
        }
    }

@app.get("/api/report/red")
async def get_red_report():
    report_path = "vul_report.json"
    if not os.path.exists(report_path):
        return {"findings": []}
    with open(report_path, "r") as f:
        return json.load(f)

@app.get("/api/logs/stream")
async def stream_logs():
    async def log_generator():
        # First send historical logs
        for log in state.logs:
            yield {"data": json.dumps(log)}
        
        # Then stream new logs
        while True:
            log = await state.log_queue.get()
            yield {"data": json.dumps(log)}

    return EventSourceResponse(log_generator())

@app.get("/api/report/patch/pdf")
async def get_patch_pdf():
    pdf_path = "patch_report.pdf"
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Patch report not found")
    return FileResponse(pdf_path, media_type="application/pdf", filename="patch_report.pdf")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
