import sqlite3
import bcrypt

# Connect to database
conn = sqlite3.connect('todo.db')
cursor = conn.cursor()

# Get user ID
cursor.execute("SELECT id FROM user WHERE email = 'mahwishkhan56789@gmail.com'")
user = cursor.fetchone()

if not user:
    print("User not found!")
else:
    user_id = user[0]
    print(f"Found user ID: {user_id}")
    
    # Hash the password "13octuber92"
    password = "13octuber92"
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    print(f"New password hash: {hashed[:50]}...")
    
    # Update the account table
    cursor.execute("""
        UPDATE account 
        SET password = ? 
        WHERE userId = ? AND providerId = 'credential'
    """, (hashed, user_id))
    
    conn.commit()
    
    if cursor.rowcount > 0:
        print(f"✅ Password updated successfully for mahwishkhan56789@gmail.com")
        print(f"   You can now sign in with password: {password}")
    else:
        print("❌ No account entry found to update")

conn.close()
