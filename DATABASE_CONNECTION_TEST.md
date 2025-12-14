# 🔌 Database Connection Testing

## ✅ Recommended: Use Node.js Script (No Installation Needed)

**You don't need to install `psql`!** Use the built-in Node.js test script:

```bash
npm run test-db
```

This will:
- ✅ Test your database connection
- ✅ Check if `content_assets` table exists
- ✅ Show statistics about your assets
- ✅ Display recent assets

**This is the easiest method and works on all systems!**

---

## Option 1: Install PostgreSQL Client (psql) - Optional

### On macOS (using Homebrew)

```bash
# Install PostgreSQL (includes psql client)
brew install postgresql@15

# Or install just the client
brew install libpq
brew link --force libpq

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Verify Installation

```bash
psql --version
```

### Test Connection

```bash
psql $POSTGRES_URL_NON_POOLING -c "SELECT 1;"
```

---

## Option 2: Test Connection Using Node.js Script (Already Created!)

The script is already created at `scripts/test-db-connection.js`. Just run:

```bash
npm run test-db
```

Or manually:

Create a simple test script:

```bash
# Create test script
cat > test-db-connection.js << 'EOF'
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_URL?.includes('sslmode=require') ? {
    rejectUnauthorized: false
  } : false
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    console.log('Result:', result.rows[0]);
    
    // Test content_assets table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'content_assets'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ content_assets table exists');
      
      // Count rows
      const count = await pool.query('SELECT COUNT(*) FROM content_assets');
      console.log(`📊 Total assets in database: ${count.rows[0].count}`);
    } else {
      console.log('⚠️  content_assets table does not exist');
      console.log('   Run: database/schema/content_assets.sql in Supabase SQL Editor');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
EOF

# Run the test
node test-db-connection.js
```

---

## Option 3: Test via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/ejhafhggndirnxmwrtgm
2. Click **SQL Editor** in the left sidebar
3. Run this query:

```sql
SELECT 1 as test;
```

4. Check if `content_assets` table exists:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'content_assets'
);
```

5. If table doesn't exist, run the schema:

```sql
-- Copy and paste the entire content from:
-- database/schema/content_assets.sql
```

---

## Option 4: Test via API Endpoint

If your app is deployed, test the database connection via API:

```bash
# Test content assets API
curl "https://your-app.vercel.app/api/content-assets"

# Should return JSON array (empty if no assets, or list of assets)
```

---

## Quick Test Script

Save this as `test-db.js`:

```javascript
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT 1')
  .then(() => console.log('✅ Connected!'))
  .catch(err => console.error('❌ Error:', err.message))
  .finally(() => pool.end());
```

Run:
```bash
node test-db.js
```

---

## Recommended: Use Node.js Script

Since you already have Node.js installed, **Option 2** is the easiest way to test your database connection without installing additional tools.

