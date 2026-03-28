from flask import Blueprint, request, render_template_string
import os

utils_bp = Blueprint("utils", __name__)

# ❌ XSS
@utils_bp.route("/search")
def search():
    q = request.args.get("q", "")
    return render_template_string(f"<h2>Search: {q}</h2>")


# ✅ Fixed Command Injection by removing shell usage
@utils_bp.route("/ping")
def ping():
    ip = request.args.get("ip", "127.0.0.1")
    output = f"Ping to {ip} not executed due to security restrictions."
    return f"<pre>{{output}}</pre>"


# ✅ Fixed Path Traversal by restricting file access
@utils_bp.route("/read")
def read():
    file = request.args.get("file", "users.db")
    safe_files = ["users.db"]  # List of allowed files

    if file not in safe_files:
        return "Unauthorized access to file.", 403

    try:
        with open(file, "r") as f:
            return f.read()
    except Exception as e:
        return str(e)
