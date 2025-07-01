const pool = require("../db");

async function checkPriceTracking() {
  const [rows] = await pool.query(`
    SELECT pt.*, p.name, p.sale_price
    FROM price_tracking pt
    JOIN products p ON pt.product_id = p.id
  `);

  for (const row of rows) {
    if (row.sale_price >= row.min_price && row.sale_price <= row.max_price) {
      const message = `💸 ${row.name} is now between $${row.min_price} - $${row.max_price}! Just like you wished, queen! Go snatch that deal.`;

      const [existing] = await pool.query(`
        SELECT id FROM notifications
        WHERE user_id = ? AND product_id = ? AND message = ?
      `, [row.user_id, row.product_id, message]);

      if (existing.length === 0) {
        await pool.query(`
          INSERT INTO notifications (user_id, product_id, message)
          VALUES (?, ?, ?)
        `, [row.user_id, row.product_id, message]);
      }
    }
  }
}

async function checkStockTracking() {
  const [rows] = await pool.query(`
    SELECT st.*, p.name, p.availability 
    FROM stock_tracking st
    JOIN products p ON st.product_id = p.id
  `);

  for (const row of rows) {
    if (row.availability !== row.last_known_stock) {
      let message = "";

      if (row.availability === "in_stock") {
        message = `📦 ${row.name} is in stock! Go get it before it disappears!`;
      } else if (row.availability === "out_of_stock") {
        message = `📦 ${row.name} is sold out, honey. But don’t worry, I’m tracking it for you. Just keep checking your notifications!`;
      } else  {
        message = `📦 ${row.name} is running low. Better hurry up, queen!`;
      } 

      const [existing] = await pool.query(`
        SELECT id FROM notifications
        WHERE user_id = ? AND product_id = ? AND message = ?
      `, [row.user_id, row.product_id, message]);

      if (existing.length === 0) {
        await pool.query(`
          INSERT INTO notifications (user_id, product_id, message)
          VALUES (?, ?, ?)
        `, [row.user_id, row.product_id, message]);
      }

      await pool.query(`
        UPDATE stock_tracking
        SET last_known_stock = ?
        WHERE id = ?
      `, [row.availability, row.id]);
    }
  }
}

async function runAllTrackingChecks() {
  await checkPriceTracking();
  await checkStockTracking();
  console.log("🔁 All tracking checks complete.");
}

module.exports = runAllTrackingChecks;
