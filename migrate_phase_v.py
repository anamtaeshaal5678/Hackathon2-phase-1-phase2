import sqlite3
import os

db_path = 'todo.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

new_columns = [
    ("recurrence", "TEXT DEFAULT 'none'"),
    ("tags", "TEXT DEFAULT ''"),
    ("reminder_time", "DATETIME")
]

for col_name, col_def in new_columns:
    try:
        cursor.execute(f"ALTER TABLE todo ADD COLUMN {col_name} {col_def}")
        print(f"Added column: {col_name}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"Column {col_name} already exists.")
        else:
            print(f"Error adding {col_name}: {e}")

conn.commit()
conn.close()
print("Migration complete.")
