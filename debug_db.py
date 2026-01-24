import sqlite3
import os

db_path = "todo.db"

def check_data():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("PRAGMA table_info(todo)")
        columns = cursor.fetchall()
        print("Columns in 'todo' table:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
            
        cursor.execute("SELECT COUNT(*) FROM todo")
        total = cursor.fetchone()[0]
        print(f"Total rows: {total}")
        
        cursor.execute("SELECT COUNT(*) FROM todo WHERE title IS NULL")
        null_titles = cursor.fetchone()[0]
        print(f"Rows with NULL title: {null_titles}")
        
        if null_titles > 0:
            print("Row IDs with NULL title:")
            cursor.execute("SELECT id FROM todo WHERE title IS NULL LIMIT 5")
            for row in cursor.fetchall():
                print(f"  {row[0]}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_data()
