const db = require('../config/db');

exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT s.*, c.shop_name as customer_shop_name, c.owner_name as customer_owner_name, c.phone as customer_phone,
        COALESCE(p.paid, 0) as amount_paid,
        (s.total_amount - COALESCE(p.paid, 0)) as outstanding_balance
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      LEFT JOIN (
        SELECT subscription_id, SUM(amount_paid) as paid 
        FROM payments 
        WHERE status = 'verified' 
        GROUP BY subscription_id
      ) p ON s.id = p.subscription_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.expiry_date ASC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.createSubscription = async (req, res, next) => {
  try {
    const {
      customer_id,
      plan_name,
      duration_months,
      start_date,
      expiry_date,
      total_amount,
      notes,
    } = req.body;

    if (!customer_id || !plan_name || !start_date || !expiry_date || total_amount == null) {
      return res.status(400).json({
        message: 'Customer, plan name, start date, expiry date, and total amount are required.',
      });
    }

    const [result] = await db.query(
      `INSERT INTO subscriptions (customer_id, plan_name, duration_months, start_date, expiry_date, total_amount, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
      [
        customer_id,
        plan_name.trim(),
        duration_months || 12,
        start_date,
        expiry_date,
        parseFloat(total_amount),
        notes || null,
      ]
    );

    // Update customer status to active
    await db.query(`UPDATE customers SET status = 'active' WHERE id = ?`, [customer_id]);

    res.status(201).json({
      message: 'Subscription created successfully',
      id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};

exports.sendReminder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [subRows] = await db.query(
      `SELECT s.*, c.shop_name, c.owner_name, c.phone 
       FROM subscriptions s 
       JOIN customers c ON s.customer_id = c.id 
       WHERE s.id = ?`,
      [id]
    );

    if (subRows.length === 0) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    const sub = subRows[0];

    // Mark reminder as sent
    await db.query(`UPDATE subscriptions SET reminder_sent = TRUE WHERE id = ?`, [id]);

    // Log notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, ?, ?, 'renewal_reminder')`,
      [
        req.user.id,
        `Renewal Outreach: ${sub.shop_name}`,
        `Reminder flagged for ${sub.plan_name} expiring on ${sub.expiry_date}. Contact: ${sub.owner_name} (${sub.phone})`,
      ]
    );

    res.json({ message: 'Reminder recorded and flagged for outreach' });
  } catch (error) {
    next(error);
  }
};
