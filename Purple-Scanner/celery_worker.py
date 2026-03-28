import os
from dotenv import load_dotenv
from app import create_app
from app.tasks import celery

load_dotenv()
app = create_app()
app.app_context().push()
