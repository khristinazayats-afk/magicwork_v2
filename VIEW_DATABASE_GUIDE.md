# 👀 How to View Your Database

## Option 1: Supabase Dashboard (Easiest - No Installation)

**Best option for viewing and managing your database!**

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/ejhafhggndirnxmwrtgm

2. **Click "Table Editor"** in the left sidebar
   - View all tables
   - See all rows
   - Edit data directly
   - Add/delete rows

3. **Or use "SQL Editor"** for queries:
   - Write custom SQL queries
   - View results
   - Run scripts

### Quick Queries to Try:

**View all assets:**
```sql
SELECT * FROM content_assets ORDER BY created_at DESC;
```

**View assets by space:**
```sql
SELECT * FROM content_assets 
WHERE allocated_space = 'Drift into Sleep' 
AND status = 'live';
```

**Count assets by type:**
```sql
SELECT type, COUNT(*) as count 
FROM content_assets 
WHERE status = 'live'
GROUP BY type;
```

**View assets with CDN URLs:**
```sql
SELECT id, name, type, allocated_space, cdn_url, status 
FROM content_assets 
WHERE status = 'live'
ORDER BY allocated_space, type;
```

---

## Option 2: Use Node.js Script (Command Line)

**View database info from terminal:**

```bash
npm run test-db
```

This shows:
- Connection status
- Table existence
- Statistics
- Recent assets

**Create a custom view script:**

Create `scripts/view-database.js`:

```javascript
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: { rejectUnauthorized: false }
});

async function viewDatabase() {
  try {
    // View all assets
    const assets = await pool.query(`
      SELECT 
        id,
        name,
        type,
        format,
        allocated_space,
        s3_key,
        cdn_url,
        status,
        created_at
      FROM content_assets
      ORDER BY created_at DESC;
    `);
    
    console.log('\n📦 All Assets in Database:\n');
    console.table(assets.rows);
    
    // Group by space
    const bySpace = await pool.query(`
      SELECT 
        allocated_space,
        type,
        COUNT(*) as count
      FROM content_assets
      WHERE status = 'live'
      GROUP BY allocated_space, type
      ORDER BY allocated_space, type;
    `);
    
    console.log('\n📊 Assets by Space and Type:\n');
    console.table(bySpace.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

viewDatabase();
```

Run:
```bash
node scripts/view-database.js
```

---

## Option 3: Database GUI Tools (Desktop Apps)

### TablePlus (macOS - Recommended)
- Download: https://tableplus.com/
- Free version available
- Beautiful UI
- Easy to use

**Setup:**
1. Download and install TablePlus
2. Click "Create a new connection"
3. Select "PostgreSQL"
4. Enter connection details:
   - **Host:** `aws-1-eu-central-1.pooler.supabase.com`
   - **Port:** `5432`
   - **User:** `postgres.ejhafhggndirnxmwrtgm`
   - **Password:** `<SUPABASE_DB_PASSWORD>`
   - **Database:** `postgres`
   - **SSL:** Enable (required)

### DBeaver (Cross-platform - Free)
- Download: https://dbeaver.io/
- Free and open source
- Works on all platforms

**Setup:**
1. Download and install DBeaver
2. Create new connection → PostgreSQL
3. Enter same connection details as above

### pgAdmin (Official PostgreSQL Tool)
- Download: https://www.pgadmin.org/
- Free and open source
- More complex but powerful

---

## Option 4: VS Code Extension

If you use VS Code:

1. Install extension: **"PostgreSQL"** by Chris Kolkman
2. Add connection:
   - Right-click in sidebar → "Add Connection"
   - Enter Supabase connection details
3. Browse tables and run queries directly in VS Code

---

## Recommended: Supabase Dashboard

**For quick viewing and management, use the Supabase Dashboard:**

1. Go to: https://supabase.com/dashboard/project/ejhafhggndirnxmwrtgm
2. Click **"Table Editor"** → **"content_assets"**
3. View, edit, and manage your data visually

**Benefits:**
- ✅ No installation needed
- ✅ Web-based (works anywhere)
- ✅ Visual interface
- ✅ Easy to edit data
- ✅ Built-in SQL editor
- ✅ Free

---

## Quick Access Links

- **Table Editor:** https://supabase.com/dashboard/project/ejhafhggndirnxmwrtgm/editor
- **SQL Editor:** https://supabase.com/dashboard/project/ejhafhggndirnxmwrtgm/sql
- **Database Settings:** https://supabase.com/dashboard/project/ejhafhggndirnxmwrtgm/settings/database

---

## Useful SQL Queries

**View all live assets:**
```sql
SELECT * FROM content_assets WHERE status = 'live';
```

**View assets for a specific space:**
```sql
SELECT * FROM content_assets 
WHERE allocated_space = 'Drift into Sleep' 
AND status = 'live';
```

**View only videos:**
```sql
SELECT * FROM content_assets 
WHERE type = 'video' 
AND status = 'live';
```

**View only audio:**
```sql
SELECT * FROM content_assets 
WHERE type = 'audio' 
AND status = 'live';
```

**Count assets by space:**
```sql
SELECT allocated_space, COUNT(*) as count
FROM content_assets
WHERE status = 'live'
GROUP BY allocated_space
ORDER BY allocated_space;
```

**View assets with missing CDN URLs:**
```sql
SELECT id, name, s3_key, cdn_url
FROM content_assets
WHERE cdn_url IS NULL OR cdn_url = '';
```

---

**Easiest way: Just use the Supabase Dashboard!** 🎯





