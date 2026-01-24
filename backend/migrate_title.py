import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "../todo.db")

def migrate():
    print(f"Connecting to database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if title column exists
        cursor.execute("PRAGMA table_info(todo)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "title" not in columns:
            print("Adding 'title' column to 'todo' table...")
            # We'll set the current description as the title for existing rows
            cursor.execute("ALTER TABLE todo ADD COLUMN title VARCHAR(200)")
            cursor.execute("UPDATE todo SET title = description")
            conn.commit()
            print("Successfully added 'title' column.")
        else:
            print("'title' column already exists.")
            
        # Also check for conversation and message tables (Phase 3)
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='conversation'")
        if not cursor.fetchone():
            print("Warning: 'conversation' table missing. Backend lifespan should create it, but ensure DATABASE_URL is correct.")
        else:
            print("'conversation' table exists.")

    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
