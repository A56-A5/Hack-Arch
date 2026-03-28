from app import celery, db
from app.models import Scan, Finding
from app.tools.nmap import NmapTool
from app.tools.nikto import NiktoTool
from app.tools.nuclei import NucleiTool
from app.tools.sslyze import SSLyzeTool
from app.tools.retirejs import RetireJSTool
from app.tools.whatweb import WhatWebTool
from app.tools.zap import ZapTool
from app.tools.headers import HeadersTool
from datetime import datetime

def save_finding(scan_id, tool, severity, title, description='', evidence=''):
    with db.session.begin():
        finding = Finding(
            scan_id=scan_id,
            tool=tool,
            severity=severity,
            title=title,
            description=description,
            evidence=evidence,
        )
        db.session.add(finding)
    db.session.commit()

@celery.task(bind=True)
def run_scan(self, scan_id, target):
    # Update scan status
    scan = Scan.query.get(scan_id)
    if scan:
        scan.status = 'running'
        db.session.commit()

    # List of tools to run (order might matter for dependencies)
    tools = [
        NmapTool(scan_id, target, save_finding),
        NiktoTool(scan_id, target, save_finding),
        NucleiTool(scan_id, target, save_finding),
        SSLyzeTool(scan_id, target, save_finding),
        RetireJSTool(scan_id, target, save_finding),
        WhatWebTool(scan_id, target, save_finding),
        HeadersTool(scan_id, target, save_finding),
        ZapTool(scan_id, target, save_finding),
    ]

    for tool in tools:
        try:
            tool.run()
        except Exception as e:
            save_finding(scan_id, tool.__class__.__name__, 'info',
                         f'Tool error: {str(e)}', str(e))

    # Mark scan as complete
    if scan:
        scan.status = 'complete'
        scan.finished_at = datetime.utcnow()
        db.session.commit()

    # Emit a WebSocket event if we have socketio
    from app import socketio
    socketio.emit('scan_complete', {'scan_id': scan_id, 'status': 'complete'})
