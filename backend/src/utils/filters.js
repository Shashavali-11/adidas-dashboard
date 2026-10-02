const ApiError = require('./ApiError');

const PERIODS = ['day', 'week', 'month', 'quarter', 'year'];

function parseDateParam(value, name, endOfDay) {
  if (!value) {
    return null;
  }
  const time = endOfDay ? '23:59:59.999' : '00:00:00.000';
  const date = new Date(`${value}T${time}Z`);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${name} date. Use YYYY-MM-DD.`);
  }
  return date;
}

// builds the $match object from the query params (from, to, region, retailer, category, gender, method)
function buildMatch(query = {}, overrideRange) {
  let from = parseDateParam(query.from, 'from', false);
  let to = parseDateParam(query.to, 'to', true);
  if (overrideRange) {
    from = overrideRange.from;
    to = overrideRange.to;
  }
  if (from && to && from > to) {
    throw new ApiError(400, '"from" must be before "to".');
  }

  const match = {};
  if (from || to) {
    match.invoiceDate = {};
    if (from) {
      match.invoiceDate.$gte = from;
    }
    if (to) {
      match.invoiceDate.$lte = to;
    }
  }
  if (query.region) {
    match.region = { $in: String(query.region).split(',') };
  }
  if (query.retailer) {
    match.retailer = { $in: String(query.retailer).split(',') };
  }
  if (query.category) {
    match.category = query.category;
  }
  if (query.gender) {
    match.gender = query.gender;
  }
  if (query.method) {
    match.salesMethod = query.method;
  }
  return { match, from, to };
}

function periodKey(period = 'month') {
  if (!PERIODS.includes(period)) {
    throw new ApiError(400, `period must be one of: ${PERIODS.join(', ')}`);
  }
  const date = '$invoiceDate';

  if (period === 'day') {
    return { $dateToString: { format: '%Y-%m-%d', date } };
  }
  if (period === 'week') {
    return { $dateToString: { format: '%G-W%V', date } };
  }
  if (period === 'year') {
    return { $dateToString: { format: '%Y', date } };
  }
  if (period === 'quarter') {
    const quarter = { $ceil: { $divide: [{ $month: date }, 3] } };
    return { $concat: [{ $toString: { $year: date } }, '-Q', { $toString: quarter }] };
  }
  return { $dateToString: { format: '%Y-%m', date } };
}

module.exports = { buildMatch, periodKey, parseDateParam };
