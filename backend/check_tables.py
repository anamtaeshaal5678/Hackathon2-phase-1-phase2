import psycopg2
import sys

# Connection string provided by user
DATABASE_URL = "postgresql://neondb_owner:npg_lj1umwz5dhRk@ep-royal-bar-ai2m6vcw-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Check for tables
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
    """)
    tables = cur.fetchall()
    
    print("--- Database Tables ---")
    if not tables:
        print("NO TABLES FOUND! Migration needed.")
    else:
        for t in tables:
            print(f"- {t[0]}")
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
