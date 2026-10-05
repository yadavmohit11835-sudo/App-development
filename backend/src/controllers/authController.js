const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [users] = await db.query(
      'SELECT id, full_name, email, password_hash, role, phone, status FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is deactivated. Contact KeyPrime Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Don't send back password_hash
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT id, full_name, email, role, phone, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const [users] = await db.query('SELECT id, email FROM users WHERE email = ?', [
      email.trim().toLowerCase(),
    ]);

    if (users.length === 0) {
      // Security best practice: don't reveal if email exists or not
      return res.json({
        message: 'If the email exists in our records, password reset instructions have been dispatched.',
      });
    }

    // In production without an active SMTP server configured:
    res.json({
      message:
        'Password reset request received. SMTP email delivery gateway is pending configuration; please contact your KeyPrime System Administrator for immediate reset assistance.',
    });
  } catch (error) {
    next(error);
  }
};
