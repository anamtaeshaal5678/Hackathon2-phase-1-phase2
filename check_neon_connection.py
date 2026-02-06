import psycopg2
import sys

# Connection string provided by user
DATABASE_URL = "postgresql://neondb_owner:npg_lj1umwz5dhRk@ep-royal-bar-ai2m6vcw-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("SUCCESS: Connected to Neon PostgreSQL!")
    
    # Create tables if they don't exist (using SQLAlchemy/SQLModel logic via main backend later, 
    # but let's just check we can query)
    cur = conn.cursor()
    cur.execute("SELECT version();")
    version = cur.fetchone()
    print(f"Database Version: {version[0]}")
    
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"FAILURE: Could not connect. Error: {e}")
    sys.exit(1)
