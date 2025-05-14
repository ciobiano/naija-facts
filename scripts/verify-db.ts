import pg from "pg";

const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_4G9ObzdPkhcN@ep-dry-wildflower-a4w8s7a3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
const pool = new pg.Pool({ connectionString: NEON_DATABASE_URL });

async function verifyTable() {
  try {
    // Create table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        source TEXT NOT NULL,
        embedding TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_content_source UNIQUE (source, content)
      );
    `);
    console.log('Ensured documents table exists');
    
    // Verify table exists
    const res = await pool.query(`
      SELECT * FROM documents LIMIT 1;
    `);
    console.log('Table verified with', res.rowCount, 'rows');
  } catch (err) {
    console.error('Database verification error:', err);
  } finally {
    await pool.end();
  }
}

verifyTable();