import pkg from 'pg';
const { Client } = pkg;

async function testConnection() {
  const connectionString = 'postgres://postgres.tbfwvdcvohmykwdfgiqy:Hc3XQx7t5gVQjJyX@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';
  
  console.log('🔌 Testing direct PostgreSQL connection to Supabase via pg...');
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false // Supabase often uses self-signed certs
    }
  });

  try {
    await client.connect();
    console.log('✅ Connection successful!');
    
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables found:', res.rows.map(r => r.table_name).join(', '));
    
    // Check user profiles count
    try {
      const userRes = await client.query('SELECT count(*) FROM user_profiles');
      console.log('Total user profiles:', userRes.rows[0].count);
    } catch (e) {
      console.log('⚠️ Could not query user_profiles (table might not exist yet)');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
  } finally {
    await client.end();
  }
}

testConnection();
