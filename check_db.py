import sqlite3
import os

db_path = "todo.db"
if not os.path.exists(db_path):
    print(f"Database {db_path} not found in current directory.")
else:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("--- User Table ---")
    cursor.execute("SELECT * FROM user LIMIT 5")
    for row in cursor.fetchall():
        print(dict(row))
        
    print("\n--- Session Table ---")
    cursor.execute("SELECT * FROM session LIMIT 5")
    for row in cursor.fetchall():
        print(dict(row))
        
    print("\n--- Todo Table ---")
    cursor.execute("SELECT * FROM todo LIMIT 5")
    for row in cursor.fetchall():
        print(dict(row))
    
    conn.close()
