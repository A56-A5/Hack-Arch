from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO
from celery import Celery
import os

db = SQLAlchemy()
migrate = Migrate()
socketio = SocketIO()
celery = Celery(__name__, broker=os.environ.get('REDIS_URL', 'redis://localhost:6379/0'))

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///vuln.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app, cors_allowed_origins="*")

    # Configure Celery
    celery.conf.update(
        broker_url=os.environ.get('REDIS_URL', 'redis://localhost:6379/0'),
        result_backend=os.environ.get('REDIS_URL', 'redis://localhost:6379/0'),
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
    )

    # Register blueprints
    from app.api.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    from flask import render_template
    @app.route('/')
    def index():
        return render_template('index.html')

    return app
