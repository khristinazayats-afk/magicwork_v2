/**
 * Google Apps Script for Magicwork Content Inventory Spreadsheet
 * 
 * Features:
 * - Generate CDN URLs automatically
 * - Validate data entries
 * - Generate S3 upload commands
 * - Sync status with database (optional)
 * 
 * Setup:
 * 1. Open your Google Spreadsheet
 * 2. Go to Extensions → Apps Script
 * 3. Paste this code
 * 4. Save and authorize
 */

// Configuration
const CONFIG = {
  S3_BUCKET: 'magicwork-canva-assets',
  CDN_BASE: 'https://cdn.magicwork.app',
  SPACES: [
    'Slow Morning',
    'Gentle De-Stress',
    'Take a Walk',
    'Draw Your Feels',
    'Move and Cool',
    'Tap to Ground',
    'Breathe to Relax',
    'Get in the Flow State',
    'Drift into Sleep'
  ]
};

/**
 * Generate CDN URL from S3 Key
 * Called when S3 Key column is updated
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const row = range.getRow();
  const col = range.getColumn();
  
  // If S3 Key column (column J) was edited
  if (col === 10 && row > 1) { // Column J = 10
    const s3Key = sheet.getRange(row, 10).getValue(); // Column J
    if (s3Key) {
      const cdnUrl = CONFIG.CDN_BASE + '/' + s3Key;
      sheet.getRange(row, 12).setValue(cdnUrl); // Column L = CDN URL
    }
  }
  
  // If Status column (column O) was edited, validate
  if (col === 15 && row > 1) { // Column O = 15
    validateRow(sheet, row);
  }
}

/**
 * Generate CDN URLs for all rows
 */
function generateAllCDNUrls() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data rows found');
    return;
  }
  
  for (let row = 2; row <= lastRow; row++) {
    const s3Key = sheet.getRange(row, 10).getValue(); // Column J
    if (s3Key && !sheet.getRange(row, 12).getValue()) { // Column L empty
      const cdnUrl = CONFIG.CDN_BASE + '/' + s3Key;
      sheet.getRange(row, 12).setValue(cdnUrl); // Column L
    }
  }
  
  SpreadsheetApp.getUi().alert('CDN URLs generated for all rows');
}

/**
 * Generate AWS CLI upload commands for selected rows
 */
function generateUploadCommands() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  
  if (!range) {
    SpreadsheetApp.getUi().alert('Please select rows to generate commands');
    return;
  }
  
  const startRow = range.getRow();
  const endRow = range.getLastRow();
  const commands = [];
  
  for (let row = startRow; row <= endRow; row++) {
    const localPath = sheet.getRange(row, 5).getValue(); // Column E
    const s3Key = sheet.getRange(row, 10).getValue(); // Column J
    const status = sheet.getRange(row, 15).getValue(); // Column O
    
    if (status === 'downloaded' && localPath && s3Key) {
      const command = `aws s3 cp "${localPath}" s3://${CONFIG.S3_BUCKET}/${s3Key}`;
      commands.push(command);
    }
  }
  
  if (commands.length === 0) {
    SpreadsheetApp.getUi().alert('No rows with status "downloaded" found in selection');
    return;
  }
  
  // Create new sheet with commands
  const outputSheet = sheet.getParent().getSheetByName('Upload Commands') || 
                      sheet.getParent().insertSheet('Upload Commands');
  outputSheet.clear();
  outputSheet.getRange(1, 1).setValue('AWS CLI Upload Commands');
  outputSheet.getRange(1, 1).setFontWeight('bold');
  
  commands.forEach((cmd, index) => {
    outputSheet.getRange(index + 2, 1).setValue(cmd);
  });
  
  SpreadsheetApp.getUi().alert(`Generated ${commands.length} upload commands in "Upload Commands" sheet`);
}

/**
 * Validate a row's data
 */
function validateRow(sheet, row) {
  const errors = [];
  
  // Check required fields
  const assetId = sheet.getRange(row, 1).getValue(); // Column A
  const assetName = sheet.getRange(row, 2).getValue(); // Column B
  const fileType = sheet.getRange(row, 7).getValue(); // Column G
  const format = sheet.getRange(row, 8).getValue(); // Column H
  const allocatedSpace = sheet.getRange(row, 13).getValue(); // Column M
  const status = sheet.getRange(row, 15).getValue(); // Column O
  
  if (!assetId) errors.push('Asset ID is required');
  if (!assetName) errors.push('Asset Name is required');
  if (!['audio', 'video'].includes(fileType)) {
    errors.push('File Type must be "audio" or "video"');
  }
  if (!['mp3', 'wav', 'mp4', 'png', 'jpg'].includes(format)) {
    errors.push('Format must be mp3, wav, mp4, png, or jpg');
  }
  if (allocatedSpace && !CONFIG.SPACES.includes(allocatedSpace)) {
    errors.push(`Allocated Space must be one of: ${CONFIG.SPACES.join(', ')}`);
  }
  if (!['downloaded', 'uploaded', 'registered', 'live'].includes(status)) {
    errors.push('Status must be: downloaded, uploaded, registered, or live');
  }
  
  // If status is "uploaded" or later, check S3 Key and CDN URL
  if (['uploaded', 'registered', 'live'].includes(status)) {
    const s3Key = sheet.getRange(row, 10).getValue(); // Column J
    const cdnUrl = sheet.getRange(row, 12).getValue(); // Column L
    
    if (!s3Key) errors.push('S3 Key required for status "' + status + '"');
    if (!cdnUrl) errors.push('CDN URL required for status "' + status + '"');
  }
  
  // Highlight row if errors
  if (errors.length > 0) {
    sheet.getRange(row, 1, 1, 19).setBackground('#ffcccc');
    Logger.log(`Row ${row} errors: ${errors.join(', ')}`);
  } else {
    sheet.getRange(row, 1, 1, 19).setBackground('#ffffff');
  }
  
  return errors;
}

/**
 * Validate all rows
 */
function validateAllRows() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data rows found');
    return;
  }
  
  let errorCount = 0;
  for (let row = 2; row <= lastRow; row++) {
    const errors = validateRow(sheet, row);
    if (errors.length > 0) errorCount++;
  }
  
  SpreadsheetApp.getUi().alert(`Validation complete. ${errorCount} rows with errors.`);
}

/**
 * Generate database insert SQL for selected rows
 */
function generateDatabaseSQL() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  
  if (!range) {
    SpreadsheetApp.getUi().alert('Please select rows to generate SQL');
    return;
  }
  
  const startRow = range.getRow();
  const endRow = range.getLastRow();
  const sqlStatements = [];
  
  for (let row = startRow; row <= endRow; row++) {
    const assetId = sheet.getRange(row, 1).getValue();
    const assetName = sheet.getRange(row, 2).getValue();
    const s3Key = sheet.getRange(row, 10).getValue();
    const cdnUrl = sheet.getRange(row, 12).getValue();
    const allocatedSpace = sheet.getRange(row, 13).getValue();
    const fileType = sheet.getRange(row, 7).getValue();
    const format = sheet.getRange(row, 8).getValue();
    const notes = sheet.getRange(row, 17).getValue();
    const status = sheet.getRange(row, 15).getValue();
    
    if (status === 'uploaded' && assetId && s3Key && cdnUrl) {
      const sql = `INSERT INTO content_assets (
  id,
  name,
  s3_key,
  cdn_url,
  type,
  format,
  allocated_space,
  status,
  notes,
  created_at,
  updated_at,
  published_at
) VALUES (
  '${assetId}',
  '${assetName.replace(/'/g, "''")}',
  '${s3Key}',
  '${cdnUrl}',
  '${fileType}',
  '${format}',
  ${allocatedSpace ? `'${allocatedSpace}'` : 'NULL'},
  'live',
  ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  s3_key = EXCLUDED.s3_key,
  cdn_url = EXCLUDED.cdn_url,
  type = EXCLUDED.type,
  format = EXCLUDED.format,
  allocated_space = EXCLUDED.allocated_space,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  updated_at = NOW();`;
      
      sqlStatements.push(sql);
    }
  }
  
  if (sqlStatements.length === 0) {
    SpreadsheetApp.getUi().alert('No rows with status "uploaded" found in selection');
    return;
  }
  
  // Create new sheet with SQL
  const outputSheet = sheet.getParent().getSheetByName('Database SQL') || 
                      sheet.getParent().insertSheet('Database SQL');
  outputSheet.clear();
  outputSheet.getRange(1, 1).setValue('SQL Statements for Database');
  outputSheet.getRange(1, 1).setFontWeight('bold');
  
  sqlStatements.forEach((sql, index) => {
    outputSheet.getRange(index + 2, 1).setValue(sql);
  });
  
  SpreadsheetApp.getUi().alert(`Generated ${sqlStatements.length} SQL statements in "Database SQL" sheet`);
}

/**
 * Create custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Magicwork Content')
    .addItem('Generate All CDN URLs', 'generateAllCDNUrls')
    .addItem('Generate Upload Commands', 'generateUploadCommands')
    .addItem('Generate Database SQL', 'generateDatabaseSQL')
    .addItem('Validate All Rows', 'validateAllRows')
    .addToUi();
}

