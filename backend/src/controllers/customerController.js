const db = require('../config/db');

exports.getAllCustomers = async (req, res, next) => {
  try {
    const { search, status, salesperson_id } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let query = `
      SELECT c.*, u.full_name as assigned_salesperson_name
      FROM customers c
      LEFT JOIN users u ON c.assigned_salesperson_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based visibility
    if (!isAdmin) {
      query += ' AND (c.assigned_salesperson_id = ? OR c.assigned_salesperson_id IS NULL)';
      params.push(userId);
    } else if (salesperson_id) {
      query += ' AND c.assigned_salesperson_id = ?';
      params.push(salesperson_id);
    }

    if (status && status !== 'all') {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (search) {
      const term = `%${search.trim()}%`;
      query += ' AND (c.shop_name LIKE ? OR c.owner_name LIKE ? OR c.phone LIKE ? OR c.city LIKE ?)';
      params.push(term, term, term, term);
    }

    query += ' ORDER BY c.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT c.*, u.full_name as assigned_salesperson_name
       FROM customers c
       LEFT JOIN users u ON c.assigned_salesperson_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const {
      shop_name,
      owner_name,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      assigned_salesperson_id,
      status,
      notes,
      follow_up_date,
    } = req.body;

    if (!shop_name || !owner_name || !phone || !address || !city) {
      return res.status(400).json({
        message: 'Shop name, owner name, phone, address, and city are required fields.',
      });
    }

    // Default assigned rep to current user if not specified or not admin
    const repId = req.user.role === 'admin' ? (assigned_salesperson_id || req.user.id) : req.user.id;

    const [result] = await db.query(
      `INSERT INTO customers (
         shop_name, owner_name, phone, email, address, city, state, pincode,
         assigned_salesperson_id, status, notes, follow_up_date
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shop_name.trim(),
        owner_name.trim(),
        phone.trim(),
        email ? email.trim() : null,
        address.trim(),
        city.trim(),
        state ? state.trim() : 'Gujarat',
        pincode ? pincode.trim() : null,
        repId,
        status || 'lead',
        notes || null,
        follow_up_date || null,
      ]
    );

    res.status(201).json({
      message: 'Customer registered successfully',
      id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      shop_name,
      owner_name,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      assigned_salesperson_id,
      status,
      notes,
      follow_up_date,
    } = req.body;

    const [result] = await db.query(
      `UPDATE customers SET 
         shop_name = COALESCE(?, shop_name),
         owner_name = COALESCE(?, owner_name),
         phone = COALESCE(?, phone),
         email = ?,
         address = COALESCE(?, address),
         city = COALESCE(?, city),
         state = COALESCE(?, state),
         pincode = ?,
         assigned_salesperson_id = COALESCE(?, assigned_salesperson_id),
         status = COALESCE(?, status),
         notes = ?,
         follow_up_date = ?
       WHERE id = ?`,
      [
        shop_name ? shop_name.trim() : null,
        owner_name ? owner_name.trim() : null,
        phone ? phone.trim() : null,
        email ? email.trim() : null,
        address ? address.trim() : null,
        city ? city.trim() : null,
        state ? state.trim() : null,
        pincode ? pincode.trim() : null,
        assigned_salesperson_id || null,
        status || null,
        notes || null,
        follow_up_date || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerDemos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT d.*, u.full_name as salesperson_name
       FROM demos d
       JOIN users u ON d.salesperson_id = u.id
       WHERE d.customer_id = ?
       ORDER BY d.demo_date DESC`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.getCustomerSubscriptions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT s.*, 
        COALESCE(p.paid, 0) as amount_paid,
        (s.total_amount - COALESCE(p.paid, 0)) as outstanding_balance
       FROM subscriptions s
       LEFT JOIN (
         SELECT subscription_id, SUM(amount_paid) as paid 
         FROM payments 
         WHERE status = 'verified' 
         GROUP BY subscription_id
       ) p ON s.id = p.subscription_id
       WHERE s.customer_id = ?
       ORDER BY s.created_at DESC`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.getCustomerPayments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT p.*, u.full_name as recorded_by_name
       FROM payments p
       JOIN users u ON p.recorded_by_user_id = u.id
       WHERE p.customer_id = ?
       ORDER BY p.payment_date DESC`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
