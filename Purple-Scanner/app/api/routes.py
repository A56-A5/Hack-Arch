from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Scan, Finding
from app.tasks import run_scan
from datetime import datetime
import re

api_bp = Blueprint('api', __name__)

def validate_target(target):
    """Basic validation: must start with http:// or https:// and contain a hostname."""
    if not target:
        return False
    pattern = re.compile(r'^https?://[a-zA-Z0-9.-]+(:[0-9]+)?(/.*)?$')
    return bool(pattern.match(target))

@api_bp.route('/scans', methods=['POST'])
def start_scan():
    data = request.json or {}
    target = data.get('target', '').strip()
    if not validate_target(target):
        return jsonify({'error': 'Invalid target. Must start with http:// or https:// and contain a valid hostname.'}), 400

    scan = Scan(target=target, started_at=datetime.utcnow(), status='running')
    db.session.add(scan)
    db.session.commit()

    # Enqueue Celery task
    run_scan.delay(scan.id, target)

    return jsonify({'scan_id': scan.id, 'status': 'started'}), 202

@api_bp.route('/scans', methods=['GET'])
def list_scans():
    scans = Scan.query.order_by(Scan.id.desc()).limit(20).all()
    return jsonify({'scans': [{'id': s.id, 'target': s.target, 'started_at': s.started_at.isoformat(),
                               'finished_at': s.finished_at.isoformat() if s.finished_at else None,
                               'status': s.status} for s in scans]})

@api_bp.route('/scans/<int:scan_id>', methods=['GET'])
def scan_status(scan_id):
    scan = Scan.query.get(scan_id)
    if not scan:
        return jsonify({'error': 'Scan not found'}), 404
    count = Finding.query.filter_by(scan_id=scan_id).count()
    return jsonify({'scan_id': scan.id, 'status': scan.status, 'finding_count': count})

@api_bp.route('/scans/<int:scan_id>/findings', methods=['GET'])
def scan_findings(scan_id):
    severity = request.args.get('severity', 'all')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)

    query = Finding.query.filter_by(scan_id=scan_id)
    if severity != 'all':
        query = query.filter_by(severity=severity)

    paginated = query.order_by(
        # custom order: critical, high, medium, low, info
        db.case(
            (Finding.severity == 'critical', 0),
            (Finding.severity == 'high', 1),
            (Finding.severity == 'medium', 2),
            (Finding.severity == 'low', 3),
            else_=4
        )
    ).paginate(page=page, per_page=per_page, error_out=False)

    findings = [{'tool': f.tool, 'severity': f.severity, 'title': f.title,
                 'description': f.description, 'evidence': f.evidence}
                for f in paginated.items]

    # Summary counts
    summary = {}
    for sev in ['critical', 'high', 'medium', 'low', 'info']:
        summary[sev] = Finding.query.filter_by(scan_id=scan_id, severity=sev).count()

    return jsonify({
        'findings': findings,
        'summary': summary,
        'page': page,
        'pages': paginated.pages,
        'total': paginated.total
    })
