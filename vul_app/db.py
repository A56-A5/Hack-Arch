import sqlite3

DB = "users.db"

def init_db():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT,
            password TEXT
        )
    """)

    cur.execute("DELETE FROM users")
    cur.execute("INSERT INTO users (username, password) VALUES ('admin', 'admin123')")

    conn.commit()
    conn.close()