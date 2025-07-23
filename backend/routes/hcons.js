const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const pool = require('')


async function fetchHourlyConsumption(startDateTime, endDateTime) {
  const query = `
  SELECT
  DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') AS hour,
  energy_meter_id,
  MAX(kWh) - MIN(kWh) AS kWh_difference
FROM modbus_data
WHERE timestamp BETWEEN ? AND ?
  AND energy_meter_id BETWEEN 1 AND 11
GROUP BY energy_meter_id, hour
ORDER BY hour ASC;
  `;

  try {
    const [rows] = await pool.promise().query(query, [startDateTime, endDateTime]);

    const hourlyConsumption = rows.reduce((acc, { hour, kWh_difference }) => {
      const roundedDifference = parseFloat(kWh_difference || 0).toFixed(1);
      acc[hour] = (acc[hour] || 0) + parseFloat(roundedDifference);
      return acc;
    }, {});

    return hourlyConsumption;
  } catch (error) {
    throw error;
  }
}

router.get('/hconsumption', async (req, res) => {
  const { startDateTime, endDateTime } = req.query;

  try {
    const consumptionData = await fetchHourlyConsumption(startDateTime, endDateTime);
    console.log('Consumption Data:', consumptionData);

    const roundedConsumptionData = Object.entries(consumptionData).reduce((acc, [hour, value]) => {
      acc[hour] = parseFloat(value).toFixed(1);
      return acc;
    }, {});

    res.status(200).json({ consumptionData: roundedConsumptionData }); 
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;