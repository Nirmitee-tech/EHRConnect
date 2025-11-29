#!/usr/bin/env node

/**
 * Script to convert SQL migration files to Sequelize format
 * Usage: node convert-sql-migrations.js
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.resolve(__dirname, '../database/migrations');

// Get all SQL files
const sqlFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
    .sort();

console.log(`Found ${sqlFiles.length} SQL migration files to convert\n`);

sqlFiles.forEach((sqlFile, index) => {
    const sqlPath = path.join(migrationsDir, sqlFile);
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Extract migration number from filename
    const match = sqlFile.match(/^(\d+)_(.+)\.sql$/);
    if (!match) {
        console.log(`⏭️  Skipping ${sqlFile} (doesn't match pattern)`);
        return;
    }

    const [, number, name] = match;

    // Create timestamp-based filename (incrementing from initial schema)
    // Start from 20240101000001 (one after initial schema which is 20240101000000)
    const timestamp = `202401010000${String(parseInt(number)).padStart(2, '0')}`;
    const jsFilename = `${timestamp}-${name}.js`;
    const jsPath = path.join(migrationsDir, jsFilename);

    // Check if JS version already exists
    if (fs.existsSync(jsPath)) {
        console.log(`⏭️  ${sqlFile} -> ${jsFilename} (already exists)`);
        return;
    }

    // Create Sequelize migration wrapper
    const jsContent = `const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sqlPath = path.resolve(__dirname, '${sqlFile}');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Create a new pg pool using the same config as Sequelize
    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });
    
    try {
      console.log('🔄 Executing ${sqlFile}...');
      await pool.query(sql);
      console.log('✅ ${sqlFile} completed');
    } catch (error) {
      console.error('❌ ${sqlFile} failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check if rollback file exists
    const rollbackPath = path.resolve(__dirname, '${sqlFile.replace('.sql', '_rollback.sql')}');
    
    if (!fs.existsSync(rollbackPath)) {
      console.log('⚠️  No rollback file found for ${sqlFile}');
      return;
    }
    
    const sql = fs.readFileSync(rollbackPath, 'utf8');
    
    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });
    
    try {
      console.log('🔄 Rolling back ${sqlFile}...');
      await pool.query(sql);
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  }
};
`;

    fs.writeFileSync(jsPath, jsContent);
    console.log(`✅ ${sqlFile} -> ${jsFilename}`);
});

console.log(`\n✨ Conversion complete!`);
