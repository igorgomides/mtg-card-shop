#!/usr/bin/env node

/**
 * Create Admin Users Script
 * Creates admin users Igor Gomides and Rodrigo T in the database
 * Run with: node server/create-admin-users.mjs
 */

import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Admin users data
const adminUsers = [
  {
    openId: 'admin-igor-gomides',
    name: 'Igor Gomides',
    email: 'igor.gomides@mtgcardshop.com',
    loginMethod: 'admin',
    role: 'admin'
  },
  {
    openId: 'admin-rodrigo-t',
    name: 'Rodrigo T',
    email: 'rodrigo.t@mtgcardshop.com',
    loginMethod: 'admin',
    role: 'admin'
  }
];

async function createAdminUsers() {
  console.log('Creating admin users...');

  // Parse DATABASE_URL to get connection details
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable not set');
    process.exit(1);
  }

  // Extract connection details from mysql://user:password@host:port/database
  const match = dbUrl.match(/mysql:\/\/([^:]+)(?::([^@]+))?@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    console.error('Invalid DATABASE_URL format');
    process.exit(1);
  }

  const [, user, password = '', host, port, database] = match;

  const connection = await createConnection({
    host,
    port: parseInt(port),
    user,
    password,
    database,
  });

  try {
    for (const admin of adminUsers) {
      const query = `
        INSERT INTO users (
          openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          email = VALUES(email),
          role = VALUES(role),
          updatedAt = NOW()
      `;

      await connection.execute(query, [
        admin.openId,
        admin.name,
        admin.email,
        admin.loginMethod,
        admin.role,
      ]);

      console.log(`✓ Created admin user: ${admin.name}`);
    }

    console.log(`\n✅ Successfully created ${adminUsers.length} admin users!`);
    console.log('Admin users created:');
    adminUsers.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email}) - Role: ${admin.role}`);
    });
    
  } catch (error) {
    console.error('Error creating admin users:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the script
createAdminUsers().catch(console.error);