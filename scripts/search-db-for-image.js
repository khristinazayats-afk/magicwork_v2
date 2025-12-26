import pkg from 'pg';
const { Client } = pkg;

async function checkDatabaseForImage() {
  const connectionString = 'postgres://postgres.tbfwvdcvohmykwdfgiqy:Hc3XQx7t5gVQjJyX@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';
  
  console.log('🔌 Connecting to Supabase to search for image reference...');
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected!');
    
    // Search in user_profiles
    console.log('🔍 Searching user_profiles...');
    // Get columns first to avoid "column does not exist"
    const columnsRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles'");
    const columns = columnsRes.rows.map(r => r.column_name);
    
    let query = "SELECT * FROM user_profiles WHERE ";
    const conditions = [];
    if (columns.includes('avatar_url')) conditions.push("avatar_url LIKE '%IMG_0894%'");
    if (columns.includes('display_name')) conditions.push("display_name LIKE '%IMG_0894%'");
    if (columns.includes('username')) conditions.push("username LIKE '%IMG_0894%'");
    
    if (conditions.length > 0) {
      const profiles = await client.query(query + conditions.join(" OR "));
      if (profiles.rows.length > 0) {
        console.log('Found in user_profiles:', profiles.rows);
      } else {
        console.log('No matches in user_profiles.');
      }
    }

    // Search in content_assets
    console.log('🔍 Searching content_assets...');
    const assets = await client.query("SELECT * FROM content_assets WHERE url LIKE '%IMG_0894%' OR name LIKE '%IMG_0894%' OR metadata::text LIKE '%IMG_0894%'");
    if (assets.rows.length > 0) {
      console.log('Found in content_assets:', assets.rows);
    } else {
      console.log('No matches in content_assets.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabaseForImage();
