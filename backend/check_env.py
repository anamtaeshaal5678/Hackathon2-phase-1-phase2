import os
from dotenv import load_dotenv

# Simulate what backend/database.py does
# It assumes CWD is backend/
# So we must run this from backend/ dir

print(f"CWD: {os.getcwd()}")
load_dotenv()
print(f"DATABASE_URL: {os.environ.get('DATABASE_URL')}")
