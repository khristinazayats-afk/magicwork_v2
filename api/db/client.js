// Database client for Supabase/Postgres
import pg from 'pg';
const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!pool && process.env.POSTGRES_URL) {
    // Use the connection string as-is (keep pooler for now)
    const connectionString = process.env.POSTGRES_URL;
    
    // Parse connection string to extract components for better SSL handling
    let sslConfig = undefined;
    if (connectionString.includes('supabase') || connectionString.includes('sslmode=require')) {
      // For Supabase, we need SSL but may have certificate issues
      // Try different SSL configurations
      sslConfig = {
        rejectUnauthorized: false, // Allow self-signed certificates
      };
    }
    
    try {
      pool = new Pool({
        connectionString,
        ssl: sslConfig,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased timeout for serverless
        allowExitOnIdle: true,
      });

      // Handle pool errors
      pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });
    } catch (error) {
      console.error('Error creating database pool:', error);
      throw error;
    }
  }
  return pool;
}

// SQL helper that works like @vercel/postgres sql template tag
export function sql(strings, ...values) {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database not configured. POSTGRES_URL is missing.');
  }

  // Build query and params
  let query = strings[0];
  const params = [];
  
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    params.push(value);
    query += `$${params.length}` + strings[i + 1];
  }

  // Return a Promise-like object that resolves to { rows: [...] }
  const promise = pool.query(query, params).then(result => ({ rows: result.rows }));
  
  // Make it awaitable and have .rows property
  return Object.assign(promise, {
    rows: promise.then(r => r.rows),
  });
}

// Execute query directly (for compatibility)
export async function query(text, params) {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database not configured. POSTGRES_URL is missing.');
  }
  const result = await pool.query(text, params);
  return result.rows;
}
