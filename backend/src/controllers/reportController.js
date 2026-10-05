const db = require('../config/db');

exports.getSummary = async (req, res, next) => {
  try {
    const { range } = req.query; // 'today', 'week', 'month', 'year'

    let dateCondition = '1=1';
    if (range === 'today') {
      dateCondition = 'DATE(created_at) = CURDATE()';
    } else if (range === 'week') {
      dateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (range === 'month') {
      dateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    } else if (range === 'year') {
      dateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
    }

    // 1. Total Collected amount (Payments verified in range)
    let paymentDateCond = '1=1';
    if (range === 'today') {
      paymentDateCond = 'payment_date = CURDATE()';
    } else if (range === 'week') {
      paymentDateCond = 'payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (range === 'month') {
      paymentDateCond = 'payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    } else if (range === 'year') {
      paymentDateCond = 'payment_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
    }

    const [collectedRows] = await db.query(
      `SELECT COALESCE(SUM(amount_paid), 0) as total, COUNT(*) as count 
       FROM payments 
       WHERE ${paymentDateCond} AND status = 'verified'`
    );
    const collected_amount = parseFloat(collectedRows[0].total) || 0;
    const total_payments_count = collectedRows[0].count;

    // 2. Booked Sales (Total subscription plan amounts created in range)
    const [bookedRows] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM subscriptions 
       WHERE ${dateCondition}`
    );
    const booked_sales = parseFloat(bookedRows[0].total) || 0;

    // 3. Outstanding balance total across all active plans
    const [outstandingRows] = await db.query(
      `SELECT 
         COALESCE(SUM(s.total_amount), 0) - COALESCE(SUM(p.paid), 0) AS total_outstanding
       FROM subscriptions s
       LEFT JOIN (
         SELECT subscription_id, SUM(amount_paid) as paid 
         FROM payments 
         WHERE status = 'verified' 
         GROUP BY subscription_id
       ) p ON s.id = p.subscription_id
       WHERE s.status IN ('active', 'expiring_soon')`
    );
    const outstanding_amount = Math.max(0, parseFloat(outstandingRows[0].total_outstanding) || 0);

    // 4. New Customers added in range
    const [newCustRows] = await db.query(
      `SELECT COUNT(*) as count FROM customers WHERE ${dateCondition}`
    );
    const new_customers = newCustRows[0].count;

    // 5. Demos Completed in range
    let demoDateCond = 'status = "completed"';
    if (range === 'today') {
      demoDateCond += ' AND demo_date = CURDATE()';
    } else if (range === 'week') {
      demoDateCond += ' AND demo_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (range === 'month') {
      demoDateCond += ' AND demo_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    } else if (range === 'year') {
      demoDateCond += ' AND demo_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
    }
    const [demoRows] = await db.query(
      `SELECT COUNT(*) as count FROM demos WHERE ${demoDateCond}`
    );
    const demos_completed = demoRows[0].count;

    // 6. Expiring soon subscriptions
    const [expRows] = await db.query(
      `SELECT COUNT(*) as count FROM subscriptions 
       WHERE status = 'expiring_soon' OR (status = 'active' AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))`
    );
    const expiring_soon_count = expRows[0].count;

    // 7. Sales Team Leaderboard
    const [teamRows] = await db.query(
      `SELECT 
         u.id, 
         u.full_name, 
         u.email,
         (SELECT COUNT(*) FROM demos WHERE salesperson_id = u.id AND status = 'completed') as demos_count,
         (SELECT COUNT(*) FROM customers WHERE assigned_salesperson_id = u.id) as customers_count,
         COALESCE((SELECT SUM(amount_paid) FROM payments WHERE recorded_by_user_id = u.id AND status = 'verified'), 0) as total_collected
       FROM users u
       WHERE u.role = 'salesperson' AND u.status = 'active'
       ORDER BY total_collected DESC, demos_count DESC`
    );

    res.json({
      range,
      collected_amount,
      booked_sales,
      outstanding_amount,
      new_customers,
      demos_completed,
      total_payments_count,
      expiring_soon_count,
      team_performance: teamRows,
    });
  } catch (error) {
    next(error);
  }
};
