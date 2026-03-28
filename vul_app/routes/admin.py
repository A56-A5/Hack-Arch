from flask import Blueprint, request, jsonify

admin_bp = Blueprint("admin", __name__)

# ❌ Debug leak
@admin_bp.route("/debug")
def debug():
    return "Debug information is not available."

# Fixed Weak auth by using a more secure token mechanism
@admin_bp.route("/admin")
def admin():
    token = request.args.get("token")

    # Use a more secure token check (e.g., environment variable or hashed token)
    if token == os.getenv('ADMIN_TOKEN'):
        return "Welcome admin"
    return "Unauthorized", 403