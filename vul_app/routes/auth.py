from flask import Blueprint, request, jsonify
import sqlite3

auth_bp = Blueprint("auth", __name__)
DB = "users.db"

@auth_bp.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")

    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    # Fixed SQL Injection vulnerability using parameterized query
    query = "SELECT * FROM users WHERE username=? AND password=?"
    result = cur.execute(query, (username, password)).fetchone()

    conn.close()

    if result:
        return jsonify({"status": "logged in"})
    return jsonify({"status": "fail"}), 401