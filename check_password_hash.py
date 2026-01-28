import sqlite3

db_path = "todo.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Check account table for password hash
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='account'")
account_table_exists = cursor.fetchone()

if account_table_exists:
    print("--- Account Table (Password Hashes) ---")
    cursor.execute("SELECT * FROM account WHERE userId = (SELECT id FROM user WHERE email = 'mahwishkhan56789@gmail.com')")
    accounts = cursor.fetchall()
    
    if accounts:
        for account in accounts:
            print(dict(account))
    else:
        print("NO PASSWORD HASH FOUND for mahwishkhan56789@gmail.com")
        print("This is why sign-in is failing!")
else:
    print("Account table does not exist!")

conn.close()
