"""
Database Migration Script for VisionSafe
Executes database_schema.sql to create/update tables
"""
import psycopg2
import os
from pathlib import Path

# Get database connection details from environment or use defaults
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:1234@localhost:5432/visionsafe"
)

def parse_database_url(url):
    """Parse PostgreSQL connection string to extract components"""
    # Format: postgresql://user:password@host:port/database
    try:
        url = url.replace("postgresql://", "")
        credentials, rest = url.split("@")
        user, password = credentials.split(":")
        host, db_and_port = rest.split("/")
        
        if ":" in host:
            host, port = host.split(":")
            port = int(port)
        else:
            port = 5432
        
        database = db_and_port
        
        return {
            "host": host,
            "user": user,
            "password": password,
            "database": database,
            "port": port
        }
    except Exception as e:
        print(f"Error parsing DATABASE_URL: {e}")
        raise

def run_migration():
    """Execute database migration"""
    try:
        # Parse database URL
        db_config = parse_database_url(DATABASE_URL)
        print(f"Connecting to database: {db_config['database']} on {db_config['host']}:{db_config['port']}")
        
        # Read migration SQL file
        schema_file = Path(__file__).parent / "database_schema.sql"
        
        if not schema_file.exists():
            print(f"Error: {schema_file} not found")
            return False
        
        with open(schema_file, 'r') as f:
            migration_sql = f.read()
        
        print(f"Read migration script from {schema_file}")
        
        # Connect to database
        conn = psycopg2.connect(
            host=db_config["host"],
            user=db_config["user"],
            password=db_config["password"],
            database=db_config["database"],
            port=db_config["port"]
        )
        conn.autocommit = False
        cursor = conn.cursor()
        
        print("Connected to database")
        
        try:
            # Execute migration SQL
            cursor.execute(migration_sql)
            conn.commit()
            print("Migration completed successfully!")
            
            # Verify users table exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name='users'
                )
            """)
            users_table_exists = cursor.fetchone()[0]
            
            if users_table_exists:
                print("'users' table verified")
                
                # Check table structure
                cursor.execute("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = 'users'
                    ORDER BY ordinal_position
                """)
                columns = cursor.fetchall()
                print("\n'users' table structure:")
                for col_name, col_type, nullable in columns:
                    nullable_str = "NULL" if nullable == "YES" else "NOT NULL"
                    print(f"  - {col_name}: {col_type} ({nullable_str})")
            else:
                print("WARNING: 'users' table not found after migration")
                return False
            
            # Verify other critical tables
            for table in ["videos", "detections"]:
                cursor.execute(f"""
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables 
                        WHERE table_name='{table}'
                    )
                """)
                if cursor.fetchone()[0]:
                    print(f"'{table}' table verified")
                else:
                    print(f"WARNING: '{table}' table not found")
            
            print("\nMigration completed successfully!")
            print("All tables and indexes have been created/updated")
            return True
            
        except Exception as e:
            conn.rollback()
            print(f"Migration failed: {e}")
            return False
        
        finally:
            cursor.close()
            conn.close()
    
    except Exception as e:
        print(f"Connection error: {e}")
        return False

if __name__ == "__main__":
    print("Starting VisionSafe Database Migration\n")
    success = run_migration()
    print()
    exit(0 if success else 1)
