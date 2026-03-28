from flask import Blueprint, request, render_template_string
import os

utils_bp = Blueprint("utils", __name__)

# ❌ XSS
@utils_bp.route("/search")
def search():
    q = request.args.get("q", "")
    return render_template_string(f"<h2>Search: {q}</h2>")


# ❌ Command Injection
@utils_bp.route("/ping")
def ping():
    ip = request.args.get("ip", "127.0.0.1")
    output = os.popen(f"ping -c 1 {ip}").read()
    return f"<pre>{output}</pre>"


# ❌ Path Traversal
@utils_bp.route("/read")
def read():
    file = request.args.get("file", "users.db")

    try:
        with open(file, "r") as f:
            return f.read()
    except Exception as e:
        return str(e)