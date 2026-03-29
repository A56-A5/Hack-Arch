from flask import Blueprint, request, jsonify

admin_bp = Blueprint("admin", __name__)

# ❌ Debug leak
@admin_bp.route("/debug")
def debug():
    return "Debug information is not available."

# ❌ Weak auth
@admin_bp.route("/admin")
def admin():
    token = request.args.get("token")

    if token == "1234":
        return "Welcome admin"
    return "Unauthorized", 403