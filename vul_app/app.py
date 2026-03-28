from flask import Flask
from routes.auth import auth_bp
from routes.utils import utils_bp
from routes.admin import admin_bp
from db import init_db

app = Flask(__name__)

init_db()

app.register_blueprint(auth_bp)
app.register_blueprint(utils_bp)
app.register_blueprint(admin_bp)

@app.route("/")
def home():
    return "Vulnerable Multi-File App 🚨"

if __name__ == "__main__":
    app.run(debug=True, port=8080)