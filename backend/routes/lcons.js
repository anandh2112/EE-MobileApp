const express = require("express");
const router = express.Router();

const pool = require("../db.js");

async function getTotalConsumptionkWh(startDateTime, endDateTime) {
  const query = `
  SELECT 
  SUM(kWh_difference) AS consumption
FROM (
  SELECT 
    energy_meter_id,
    DATE(timestamp) AS day,
    ROUND((MAX(kWh) - MIN(kWh)),1) AS kWh_difference
  FROM 
    modbus_data
  WHERE 
    energy_meter_id BETWEEN 1 AND 11
    AND timestamp BETWEEN ? AND ?
  GROUP BY 
    energy_meter_id
) AS subquery;
  `;

  const [rows] = await pool.query(query, [startDateTime, endDateTime]);
  return rows[0]?.consumption || 0;
}

async function getTotalConsumptionkVAh(startDateTime, endDateTime) {
  const query = `
  SELECT 
  SUM(kVAh_difference) AS consumption
FROM (
  SELECT 
    energy_meter_id,
    DATE(timestamp) AS day,
    ROUND((MAX(kVAh) - MIN(kVAh)),1) AS kVAh_difference
  FROM 
    modbus_data
  WHERE 
    energy_meter_id BETWEEN 1 AND 11
    AND timestamp BETWEEN ? AND ?
  GROUP BY 
    energy_meter_id
) AS subquery;
  `;

  const [rows] = await pool.query(query, [startDateTime, endDateTime]);
  return rows[0]?.consumption || 0;
}

router.get("/lconskWh", async (req, res) => {
  try {
    const { startDateTime, endDateTime } = req.query;

    const consumptionkWh = await getTotalConsumptionkWh(startDateTime, endDateTime);

    res.status(200).json({
      consumptionkWh,
    });
  } catch (err) {
    console.error("Consumption calculation error:", err);
    res.status(500).json({
      error: "Failed to calculate consumption",
      details: err.message,
    });
  }
});

router.get("/lconskVAh", async (req, res) => {
  try {
    const { startDateTime, endDateTime } = req.query;

    const consumptionkVAh = await getTotalConsumptionkVAh(startDateTime, endDateTime);

    res.status(200).json({
      consumptionkVAh,
    });
  } catch (err) {
    console.error("Consumption calculation error:", err);
    res.status(500).json({
      error: "Failed to calculate consumption",
      details: err.message,
    });
  }
});


module.exports = router;
