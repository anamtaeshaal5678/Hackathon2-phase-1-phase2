import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    db_path = "todo.db"  # Default name if not in env
    
    # Try to find from env
    db_url = os.environ.get("DATABASE_URL", "")
    if db_url.startswith("sqlite:///"):
        db_path = db_url.replace("sqlite:///", "")
    
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found. Skipping manual migration as create_all will handle it.")
        return

    print(f"Migrating database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Add priority column
        cursor.execute("ALTER TABLE todo ADD COLUMN priority TEXT DEFAULT 'medium'")
        print("✅ Added 'priority' column to 'todo' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("ℹ️ 'priority' column already exists.")
        else:
            print(f"❌ Error adding 'priority': {e}")

    try:
        # Add due_date column
        cursor.execute("ALTER TABLE todo ADD COLUMN due_date DATETIME")
        print("✅ Added 'due_date' column to 'todo' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("ℹ️ 'due_date' column already exists.")
        else:
            print(f"❌ Error adding 'due_date': {e}")

    conn.commit()
    conn.close()
    print("Migration finished!")

if __name__ == "__main__":
    migrate()
