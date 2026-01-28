import sqlite3

conn = sqlite3.connect('todo.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get all tables
print("=== ALL TABLES ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
for table in tables:
    print(f"  - {table}")

# Check for account table (better-auth stores passwords here)
print("\n=== ACCOUNT TABLE SCHEMA ===")
try:
    cursor.execute("PRAGMA table_info(account)")
    for row in cursor.fetchall():
        print(f"  {row[1]} ({row[2]})")
except:
    print("  No account table found")

# Check if mahwish has an account entry
print("\n=== CHECKING MAHWISH'S ACCOUNT ===")
try:
    cursor.execute("SELECT * FROM account WHERE userId IN (SELECT id FROM user WHERE email = 'mahwishkhan56789@gmail.com')")
    account = cursor.fetchone()
    if account:
        print("  Account found:")
        print(f"    userId: {account['userId']}")
        print(f"    accountId: {account['accountId']}")
        print(f"    providerId: {account['providerId']}")
        print(f"    password: {'***SET***' if account['password'] else 'NOT SET'}")
    else:
        print("  No account entry found - this is the problem!")
except Exception as e:
    print(f"  Error: {e}")

conn.close()
