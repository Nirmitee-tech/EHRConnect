#!/usr/bin/env node

/**
 * Embed SQL files directly into JS migration files
 * This eliminates the need for separate SQL files
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'migrations');

// Get all JS migration files (except initial-schema which uses schema.sql)
const jsFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.js') && f.startsWith('202') && !f.includes('initial-schema'))
  .sort();

console.log(`\n🔄 Embedding SQL into ${jsFiles.length} migration files...\n`);

let successCount = 0;
let skipCount = 0;

for (const jsFile of jsFiles) {
  const jsPath = path.join(migrationsDir, jsFile);

  // Read the JS file
  let jsContent = fs.readFileSync(jsPath, 'utf8');

  // Extract the SQL filename from the JS file
  const sqlPathMatch = jsContent.match(/sqlPath.*?'(\d+_.*?\.sql)'/);

  if (!sqlPathMatch) {
    console.log(`⏭️  Skipping ${jsFile} - no SQL reference found`);
    skipCount++;
    continue;
  }

  const sqlFile = sqlPathMatch[1];
  const sqlPath = path.join(migrationsDir, sqlFile);

  // Check if SQL file exists
  if (!fs.existsSync(sqlPath)) {
    console.log(`⚠️  ${jsFile} references ${sqlFile} but file not found`);
    skipCount++;
    continue;
  }

  // Read SQL content
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Escape backticks in SQL
  const escapedSql = sqlContent.replace(/`/g, '\\`').replace(/\${/g, '\\${');

  // Create new JS content with embedded SQL
  const newJsContent = `const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = \`${escapedSql}\`;

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('🔄 Executing ${jsFile.replace('.js', '')}...');
      await pool.query(sql);
      console.log('✅ ${jsFile.replace('.js', '')} completed');
    } catch (error) {
      console.error('❌ ${jsFile.replace('.js', '')} failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for ${jsFile}');
  }
};
`;

  // Write the new JS file
  fs.writeFileSync(jsPath, newJsContent);
  console.log(`✅ ${jsFile} ← embedded ${sqlFile}`);
  successCount++;
}

console.log(`\n📊 Summary:`);
console.log(`   ✅ ${successCount} files updated`);
console.log(`   ⏭️  ${skipCount} files skipped`);
console.log(`\n✅ Done! SQL is now embedded in JS files.`);
console.log(`\n🗑️  You can now delete the SQL files:`);
console.log(`   cd src/database/migrations && rm *.sql\n`);
