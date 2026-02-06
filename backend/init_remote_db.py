from sqlmodel import SQLModel, create_engine
# Import models to register them with SQLModel
from models import User, Session, Todo, Conversation, Message, TodoStats, PodStatus, SystemStatus

# Connection string to Neon
DATABASE_URL = "postgresql://neondb_owner:npg_lj1umwz5dhRk@ep-royal-bar-ai2m6vcw-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

def init_db():
    print(f"Connecting to remote DB to create tables...")
    engine = create_engine(DATABASE_URL)
    
    # This creates all tables defined in the imported models
    SQLModel.metadata.create_all(engine)
    print("SUCCESS: Tables created successfully!")

if __name__ == "__main__":
    init_db()
