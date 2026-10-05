require('dotenv').config({ path: __dirname + '/../.env' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function setup() {
  console.log('Connecting to MySQL host:', process.env.DB_HOST);
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  try {
    console.log('Running 001_init.sql migration...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/001_init.sql'), 'utf-8');
    await connection.query(sql);
    console.log('Database and tables initialized successfully.');

    // Switch to database
    await connection.changeUser({ database: process.env.DB_NAME || 'keyprime_sales_db' });

    // Check if users already exist
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      console.log('Seeding initial KeyPrime users and demo data...');

      const adminPassHash = await bcrypt.hash('Admin@123', 10);
      const salesPassHash = await bcrypt.hash('Sales@123', 10);

      // Insert Admin and Sales Rep
      const [adminResult] = await connection.query(
        `INSERT INTO users (full_name, email, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['KeyPrime Admin', 'admin@keyprime.com', adminPassHash, 'admin', '9898012345', 'active']
      );
      const adminId = adminResult.insertId;

      const [salesResult] = await connection.query(
        `INSERT INTO users (full_name, email, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Rahul Mehta', 'sales@keyprime.com', salesPassHash, 'salesperson', '9898054321', 'active']
      );
      const salesId = salesResult.insertId;

      // Insert initial customers
      const [c1] = await connection.query(
        `INSERT INTO customers (shop_name, owner_name, phone, email, address, city, state, pincode, assigned_salesperson_id, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Apex Digital Mart',
          'Rajesh Patel',
          '9825112233',
          'rajesh@apexdigital.com',
          '101 Commercial Hub, Ashram Road',
          'Ahmedabad',
          'Gujarat',
          '380009',
          salesId,
          'active',
          'Requested multi-branch inventory tracking',
        ]
      );

      const [c2] = await connection.query(
        `INSERT INTO customers (shop_name, owner_name, phone, email, address, city, state, pincode, assigned_salesperson_id, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Shreeji Fashion Retail',
          'Mahesh Shah',
          '9879001122',
          'mahesh@shreejifashion.in',
          'Shop 14, Ring Road Market',
          'Surat',
          'Gujarat',
          '395002',
          salesId,
          'demo_scheduled',
          'Wants POS barcode scanning demonstration',
        ]
      );

      const [c3] = await connection.query(
        `INSERT INTO customers (shop_name, owner_name, phone, email, address, city, state, pincode, assigned_salesperson_id, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Kailash Supermarket',
          'Prakash Bhai',
          '9724123456',
          'prakash@kailashmarket.com',
          'Opposite Railway Station, Alkapuri',
          'Vadodara',
          'Gujarat',
          '390007',
          salesId,
          'active',
          'Subscribed to KeyPrime Enterprise ERP',
        ]
      );

      // Insert Subscriptions
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);

      const [sub1] = await connection.query(
        `INSERT INTO subscriptions (customer_id, plan_name, duration_months, start_date, expiry_date, total_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          c1.insertId,
          'KeyPrime Retail Pro',
          12,
          today.toISOString().split('T')[0],
          nextYear.toISOString().split('T')[0],
          25000.0,
          'active',
        ]
      );

      const expiringDate = new Date();
      expiringDate.setDate(today.getDate() + 15);
      const [sub3] = await connection.query(
        `INSERT INTO subscriptions (customer_id, plan_name, duration_months, start_date, expiry_date, total_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          c3.insertId,
          'KeyPrime Enterprise ERP',
          12,
          '2025-10-15',
          expiringDate.toISOString().split('T')[0],
          45000.0,
          'expiring_soon',
        ]
      );

      // Insert Payments
      await connection.query(
        `INSERT INTO payments (customer_id, subscription_id, recorded_by_user_id, amount_paid, payment_date, payment_method, reference_number, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c1.insertId,
          sub1.insertId,
          salesId,
          25000.0,
          today.toISOString().split('T')[0],
          'upi',
          'UPI/KP/827364',
          'Full annual payment received',
        ]
      );

      await connection.query(
        `INSERT INTO payments (customer_id, subscription_id, recorded_by_user_id, amount_paid, payment_date, payment_method, reference_number, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c3.insertId,
          sub3.insertId,
          salesId,
          30000.0,
          '2025-10-15',
          'bank_transfer',
          'NEFT-HDFC-9912',
          'Advance payment. Balance remaining: 15000',
        ]
      );

      // Insert Demos
      await connection.query(
        `INSERT INTO demos (customer_id, salesperson_id, demo_date, demo_time, location, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          c2.insertId,
          salesId,
          today.toISOString().split('T')[0],
          '02:30 PM',
          'Shop 14, Ring Road Market, Surat',
          'scheduled',
          'Show barcode hardware compatibility',
        ]
      );

      await connection.query(
        `INSERT INTO demos (customer_id, salesperson_id, demo_date, demo_time, location, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          c1.insertId,
          salesId,
          '2026-10-01',
          '11:00 AM',
          '101 Commercial Hub, Ashram Road, Ahmedabad',
          'completed',
          'Client successfully onboarded to Retail Pro plan',
        ]
      );

      console.log('Sample data seeded successfully.');
    } else {
      console.log('Database already has users. Skipping seed.');
    }

    console.log('Setup finished successfully.');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setup();
