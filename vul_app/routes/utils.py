from flask import Blueprint, request, render_template_string
import os

utils_bp = Blueprint("utils", __name__)

# ❌ XSS
@utils_bp.route("/search")
def search():
    q = request.args.get("q", "")
    return render_template_string(f"<h2>Search: {q}</h2>")


# Fixed Command Injection vulnerability by using subprocess
@utils_bp.route("/ping")
def ping():
    ip = request.args.get("ip", "127.0.0.1")
    output = subprocess.check_output(["ping", "-c", "1", ip]).decode()
    return f"<pre>{output}</pre>"


# Fixed Path Traversal vulnerability by validating file input
@utils_bp.route("/read")
def read():
    file = request.args.get("file", "users.db")
    safe_path = os.path.join(os.getcwd(), "users.db")  # Restrict to users.db

    if file != "users.db":
        return "Unauthorized access", 403

    try:
        with open(safe_path, "r") as f:
            return f.read()
    except Exception as e:
        return str(e)