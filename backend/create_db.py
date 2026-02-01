import psycopg2

# Connect to default postgres database
conn = psycopg2.connect(
    host="localhost",
    user="postgres",
    password="1234",
    database="postgres"
)
conn.autocommit = True
cursor = conn.cursor()

try:
    cursor.execute("CREATE DATABASE visionsafe;")
    print("✅ Database 'visionsafe' created successfully")
except psycopg2.Error as e:
    if "already exists" in str(e):
        print("✅ Database 'visionsafe' already exists")
    else:
        print(f"❌ Error: {e}")
finally:
    cursor.close()
    conn.close()
