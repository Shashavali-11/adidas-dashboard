function round(value, decimals = 2) {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number(Number(value).toFixed(decimals));
}

function percentChange(current, previous) {
  if (!previous) {
    return null;
  }
  return round(((current - previous) / previous) * 100, 1);
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

module.exports = { round, percentChange, escapeRegex, toDateString };
