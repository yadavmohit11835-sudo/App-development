const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT id, full_name, email, role, phone, status, created_at 
       FROM users 
       ORDER BY role ASC, full_name ASC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [
      email.trim().toLowerCase(),
    ]);

    if (existing.length > 0) {
      return res.status(409).json({ message: 'A user with this email address already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'admin' ? 'admin' : 'salesperson';

    const [result] = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [
        full_name.trim(),
        email.trim().toLowerCase(),
        password_hash,
        assignedRole,
        phone ? phone.trim() : null,
      ]
    );

    res.status(201).json({
      message: 'User account created successfully',
      id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};
