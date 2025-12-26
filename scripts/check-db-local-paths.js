import pkg from 'pg';
const { Client } = pkg;

async function checkProfiles() {
  const connectionString = 'postgres://postgres.tbfwvdcvohmykwdfgiqy:Hc3XQx7t5gVQjJyX@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Checking user_profiles for local paths...');
    
    const res = await client.query("SELECT * FROM user_profiles WHERE avatar_url LIKE '%leightonbingham%' OR bio LIKE '%leightonbingham%'");
    
    if (res.rows.length > 0) {
      console.log('Found profiles with local paths:');
      console.log(JSON.stringify(res.rows, null, 2));
    } else {
      console.log('No local paths found in user_profiles.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkProfiles();

