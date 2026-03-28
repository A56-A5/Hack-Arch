from app import db
from datetime import datetime

class Scan(db.Model):
    __tablename__ = 'scans'
    id = db.Column(db.Integer, primary_key=True)
    target = db.Column(db.String(500), nullable=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    finished_at = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='running')
    findings = db.relationship('Finding', backref='scan', lazy=True)

class Finding(db.Model):
    __tablename__ = 'findings'
    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey('scans.id'), nullable=False)
    tool = db.Column(db.String(100))
    severity = db.Column(db.String(20))  # critical, high, medium, low, info
    title = db.Column(db.String(500))
    description = db.Column(db.Text)
    evidence = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
