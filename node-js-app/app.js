// Application State
const state = {
  consumptionData: [],
  priceData: [],
  mergedData: [],
  startDate: null,
  endDate: null,
  minDate: null,
  maxDate: null,
  charts: {
    consumption: null,
    monthlyCost: null
  }
};

// Constants
const FIXED_FEE = 2.16;
const VARIABLE_FEE_PER_KWH = 0.018;

// Grid Fees Configuration (Netzentgelte Steiermark 2025)
const DEFAULT_GRID_BASE_FEE = 6.24; // €/month
const DEFAULT_GRID_WORK_FEE = 0.0911; // €/kWh

// Runtime configuration (in-memory state, no localStorage)
let gridConfig = {
  baseFee: DEFAULT_GRID_BASE_FEE,
  workFee: DEFAULT_GRID_WORK_FEE
};

// Sample Data (from JSON)
const SAMPLE_CONSUMPTION = [
  {"datum":"05.07.2025 00:00","timestamp":1751673600000000000,"verbrauch":"0,02"},
  {"datum":"05.07.2025 00:15","timestamp":1751674500000000000,"verbrauch":"0,025"},
  {"datum":"05.07.2025 00:30","timestamp":1751675400000000000,"verbrauch":"0,018"},
  {"datum":"05.07.2025 00:45","timestamp":1751676300000000000,"verbrauch":"0,025"},
  {"datum":"05.07.2025 01:00","timestamp":1751677200000000000,"verbrauch":"0,019"},
  {"datum":"05.07.2025 01:15","timestamp":1751678100000000000,"verbrauch":"0,024"},
  {"datum":"05.07.2025 01:30","timestamp":1751679000000000000,"verbrauch":"0,022"},
  {"datum":"05.07.2025 01:45","timestamp":1751679900000000000,"verbrauch":"0,018"},
  {"datum":"05.07.2025 02:00","timestamp":1751680800000000000,"verbrauch":"0,018"},
  {"datum":"05.07.2025 02:15","timestamp":1751681700000000000,"verbrauch":"0,018"},
  {"datum":"05.07.2025 02:30","timestamp":1751682600000000000,"verbrauch":"0,019"},
  {"datum":"05.07.2025 02:45","timestamp":1751683500000000000,"verbrauch":"0,017"},
  {"datum":"05.07.2025 03:00","timestamp":1751684400000000000,"verbrauch":"0,019"},
  {"datum":"05.07.2025 03:15","timestamp":1751685300000000000,"verbrauch":"0,018"},
  {"datum":"05.07.2025 03:30","timestamp":1751686200000000000,"verbrauch":"0,019"},
  {"datum":"05.07.2025 03:45","timestamp":1751687100000000000,"verbrauch":"0,018"},
  {"datum":"05.07.2025 04:00","timestamp":1751688000000000000,"verbrauch":"0,017"},
  {"datum":"05.07.2025 04:15","timestamp":1751688900000000000,"verbrauch":"0,018"},
  {"datum":"05.07.2025 04:30","timestamp":1751689800000000000,"verbrauch":"0,018"},
  {"datum":"05.07.2025 04:45","timestamp":1751690700000000000,"verbrauch":"0,017"},
  {"datum":"05.07.2025 05:00","timestamp":1751691600000000000,"verbrauch":"0,018"},
  {"datum":"05.07.2025 05:15","timestamp":1751692500000000000,"verbrauch":"0,019"},
  {"datum":"05.07.2025 05:30","timestamp":1751693400000000000,"verbrauch":"0,019"},
  {"datum":"05.07.2025 05:45","timestamp":1751694300000000000,"verbrauch":"0,018"},
  {"datum":"05.07.2025 06:00","timestamp":1751695200000000000,"verbrauch":"0,019"},
  {"datum":"05.07.2025 06:15","timestamp":1751696100000000000,"verbrauch":"0,047"},
  {"datum":"05.07.2025 06:30","timestamp":1751697000000000000,"verbrauch":"0,035"},
  {"datum":"05.07.2025 06:45","timestamp":1751697900000000000,"verbrauch":"0,058"},
  {"datum":"05.07.2025 07:00","timestamp":1751698800000000000,"verbrauch":"0,056"},
  {"datum":"05.07.2025 07:15","timestamp":1751699700000000000,"verbrauch":"0,054"},
  {"datum":"05.07.2025 07:30","timestamp":1751700600000000000,"verbrauch":"0,107"},
  {"datum":"05.07.2025 07:45","timestamp":1751701500000000000,"verbrauch":"0,043"},
  {"datum":"05.07.2025 08:00","timestamp":1751702400000000000,"verbrauch":"0,121"},
  {"datum":"05.07.2025 08:15","timestamp":1751703300000000000,"verbrauch":"0,052"},
  {"datum":"05.07.2025 08:30","timestamp":1751704200000000000,"verbrauch":"0,033"},
  {"datum":"05.07.2025 08:45","timestamp":1751705100000000000,"verbrauch":"0,032"},
  {"datum":"05.07.2025 09:00","timestamp":1751706000000000000,"verbrauch":"0,033"},
  {"datum":"05.07.2025 09:15","timestamp":1751706900000000000,"verbrauch":"0,043"},
  {"datum":"05.07.2025 09:30","timestamp":1751707800000000000,"verbrauch":"0,026"},
  {"datum":"05.07.2025 09:45","timestamp":1751708700000000000,"verbrauch":"0,024"},
  {"datum":"05.07.2025 10:00","timestamp":1751709600000000000,"verbrauch":"0,023"},
  {"datum":"05.07.2025 10:15","timestamp":1751710500000000000,"verbrauch":"0,023"},
  {"datum":"05.07.2025 10:30","timestamp":1751711400000000000,"verbrauch":"0,035"},
  {"datum":"05.07.2025 10:45","timestamp":1751712300000000000,"verbrauch":"0,024"},
  {"datum":"05.07.2025 11:00","timestamp":1751713200000000000,"verbrauch":"0,023"},
  {"datum":"05.07.2025 11:15","timestamp":1751714100000000000,"verbrauch":"0,024"},
  {"datum":"05.07.2025 11:30","timestamp":1751715000000000000,"verbrauch":"0,064"},
  {"datum":"05.07.2025 11:45","timestamp":1751715900000000000,"verbrauch":"0,067"},
  {"datum":"05.07.2025 12:00","timestamp":1751716800000000000,"verbrauch":"0,1"},
  {"datum":"05.07.2025 12:15","timestamp":1751717700000000000,"verbrauch":"0,048"}
];

const SAMPLE_PRICE = [
  {"preis":102.85,"zeit_von":"05.07.2025 00:00:00"},
  {"preis":102.85,"zeit_von":"05.07.2025 00:15:00"},
  {"preis":102.85,"zeit_von":"05.07.2025 00:30:00"},
  {"preis":102.85,"zeit_von":"05.07.2025 00:45:00"},
  {"preis":96.22,"zeit_von":"05.07.2025 01:00:00"},
  {"preis":96.22,"zeit_von":"05.07.2025 01:15:00"},
  {"preis":96.22,"zeit_von":"05.07.2025 01:30:00"},
  {"preis":96.22,"zeit_von":"05.07.2025 01:45:00"},
  {"preis":87.98,"zeit_von":"05.07.2025 02:00:00"},
  {"preis":87.98,"zeit_von":"05.07.2025 02:15:00"},
  {"preis":87.98,"zeit_von":"05.07.2025 02:30:00"},
  {"preis":87.98,"zeit_von":"05.07.2025 02:45:00"},
  {"preis":91.94,"zeit_von":"05.07.2025 03:00:00"},
  {"preis":91.94,"zeit_von":"05.07.2025 03:15:00"},
  {"preis":91.94,"zeit_von":"05.07.2025 03:30:00"},
  {"preis":91.94,"zeit_von":"05.07.2025 03:45:00"},
  {"preis":95.45,"zeit_von":"05.07.2025 04:00:00"},
  {"preis":95.45,"zeit_von":"05.07.2025 04:15:00"},
  {"preis":95.45,"zeit_von":"05.07.2025 04:30:00"},
  {"preis":95.45,"zeit_von":"05.07.2025 04:45:00"},
  {"preis":99.59,"zeit_von":"05.07.2025 05:00:00"},
  {"preis":99.59,"zeit_von":"05.07.2025 05:15:00"},
  {"preis":99.59,"zeit_von":"05.07.2025 05:30:00"},
  {"preis":99.59,"zeit_von":"05.07.2025 05:45:00"},
  {"preis":109.77,"zeit_von":"05.07.2025 06:00:00"},
  {"preis":109.77,"zeit_von":"05.07.2025 06:15:00"},
  {"preis":109.77,"zeit_von":"05.07.2025 06:30:00"},
  {"preis":109.77,"zeit_von":"05.07.2025 06:45:00"},
  {"preis":126.09,"zeit_von":"05.07.2025 07:00:00"},
  {"preis":126.09,"zeit_von":"05.07.2025 07:15:00"},
  {"preis":126.09,"zeit_von":"05.07.2025 07:30:00"},
  {"preis":126.09,"zeit_von":"05.07.2025 07:45:00"},
  {"preis":127.41,"zeit_von":"05.07.2025 08:00:00"},
  {"preis":127.41,"zeit_von":"05.07.2025 08:15:00"},
  {"preis":127.41,"zeit_von":"05.07.2025 08:30:00"},
  {"preis":127.41,"zeit_von":"05.07.2025 08:45:00"},
  {"preis":126.92,"zeit_von":"05.07.2025 09:00:00"},
  {"preis":126.92,"zeit_von":"05.07.2025 09:15:00"},
  {"preis":126.92,"zeit_von":"05.07.2025 09:30:00"},
  {"preis":126.92,"zeit_von":"05.07.2025 09:45:00"},
  {"preis":124.72,"zeit_von":"05.07.2025 10:00:00"},
  {"preis":124.72,"zeit_von":"05.07.2025 10:15:00"},
  {"preis":124.72,"zeit_von":"05.07.2025 10:30:00"},
  {"preis":124.72,"zeit_von":"05.07.2025 10:45:00"},
  {"preis":124.87,"zeit_von":"05.07.2025 11:00:00"},
  {"preis":124.87,"zeit_von":"05.07.2025 11:15:00"},
  {"preis":124.87,"zeit_von":"05.07.2025 11:30:00"},
  {"preis":124.87,"zeit_von":"05.07.2025 11:45:00"},
  {"preis":123.98,"zeit_von":"05.07.2025 12:00:00"},
  {"preis":123.98,"zeit_von":"05.07.2025 12:15:00"}
];

// Utility Functions

/**
 * Get timezone offset for Vienna (CET/CEST) for a given date
 * CET (winter): UTC+1
 * CEST (summer): UTC+2
 * DST transitions: Last Sunday of March (02:00 -> 03:00) and October (03:00 -> 02:00)
 */
function getViennaOffset(year, month, day, hour) {
  // Simplified DST rules for Central European Time
  // DST starts: last Sunday of March at 02:00
  // DST ends: last Sunday of October at 03:00

  // Find last Sunday of March
  const marchLastDay = new Date(year, 3, 0); // Day 0 of April = last day of March
  const marchLastSunday = marchLastDay.getDate() - marchLastDay.getDay();

  // Find last Sunday of October
  const octoberLastDay = new Date(year, 10, 0); // Day 0 of November = last day of October
  const octoberLastSunday = octoberLastDay.getDate() - octoberLastDay.getDay();

  let isDST = false;

  if (month > 3 && month < 10) {
    // April to September: always DST
    isDST = true;
  } else if (month === 3) {
    // March: check if after last Sunday 02:00
    if (day > marchLastSunday) {
      isDST = true;
    } else if (day === marchLastSunday && hour >= 2) {
      isDST = true;
    }
  } else if (month === 10) {
    // October: check if before last Sunday 03:00
    if (day < octoberLastSunday) {
      isDST = true;
    } else if (day === octoberLastSunday && hour < 3) {
      isDST = true;
    }
  }

  // Vienna offset: UTC+1 in winter (CET), UTC+2 in summer (CEST)
  return isDST ? 2 : 1; // hours
}

/**
 * Parse German datetime string in Vienna timezone (CET/CEST)
 * Format: "DD.MM.YYYY HH:MM:SS"
 * Returns: JavaScript Date object in UTC
 */
function parseGermanDateTime(dateStr) {
  // Format: "05.07.2025 00:00:00"
  const parts = dateStr.trim().split(' ');
  const dateParts = parts[0].split('.');
  const timeParts = parts[1].split(':');

  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
  const year = parseInt(dateParts[2]);
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);
  const second = parseInt(timeParts[2] || 0);

  // Get Vienna timezone offset for this specific date/time
  const viennaOffsetHours = getViennaOffset(year, month, day, hour);

  // Create date in Vienna time, then convert to UTC
  // Vienna time = UTC + offset
  // So UTC = Vienna time - offset
  const utcDate = new Date(Date.UTC(
    year,
    month,
    day,
    hour - viennaOffsetHours, // Subtract Vienna offset to get UTC
    minute,
    second
  ));

  console.log(`Parsed "${dateStr}" [CET/CEST]:`,
    `Vienna=${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')} ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`,
    `UTC=${utcDate.toISOString()}`,
    `Offset=UTC+${viennaOffsetHours}`
  );

  return utcDate;
}

function detectAndConvertTimestamp(timestamp) {
  // AUTO-DETECT TIMESTAMP FORMAT
  // If timestamp > 1e12, it's in nanoseconds or milliseconds
  // If timestamp < 1e12, it's in seconds
  let dateObj;
  if (timestamp > 1e12) {
    // Large number: could be nanoseconds (>1e15) or milliseconds (1e12-1e15)
    if (timestamp > 1e15) {
      // Nanoseconds - divide by 1e6 to get milliseconds
      dateObj = new Date(timestamp / 1e6);
    } else {
      // Milliseconds - use directly
      dateObj = new Date(timestamp);
    }
  } else {
    // Small number: seconds - multiply by 1000 to get milliseconds
    dateObj = new Date(timestamp * 1000);
  }
  return dateObj;
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function roundToNearestQuarter(date) {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  const newDate = new Date(date);
  newDate.setMinutes(roundedMinutes);
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  return newDate;
}

function setStatus(message, type = 'ready') {
  const indicator = document.getElementById('status-indicator');
  indicator.textContent = message;
  indicator.className = `status-indicator ${type}`;
}

// Data Processing Functions
function processConsumptionData(rawData) {
  console.log('=== PARSING CONSUMPTION FILE ===');

  const processed = rawData.map(row => {
    const timestamp = detectAndConvertTimestamp(row.timestamp);
    const consumption = parseFloat(row.verbrauch.replace(',', '.'));
    return {
      date: timestamp,
      consumption: consumption,
      timeStr: `${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}`,
      originalDatum: row.datum
    };
  });

  // Debug logging
  if (processed.length > 0) {
    console.log('Sample consumption records:');
    for (let i = 0; i < Math.min(3, processed.length); i++) {
      const tsSeconds = Math.floor(processed[i].date.getTime() / 1000);
      console.log(`  ${processed[i].originalDatum} (ts=${tsSeconds}) → ${processed[i].date.toISOString()}`);
    }
  }

  return processed;
}

function processPriceData(rawData) {
  console.log('=== PARSING PRICE FILE ===');

  const processed = rawData.map(row => {
    // Parse German datetime format as Vienna time, returns UTC Date object
    const timestamp = parseGermanDateTime(row.zeit_von);
    return {
      date: timestamp,
      price: row.preis,
      originalTimeString: row.zeit_von
    };
  });

  // Debug logging
  if (processed.length > 0) {
    console.log('Sample price records:');
    for (let i = 0; i < Math.min(3, processed.length); i++) {
      console.log(`  ${processed[i].originalTimeString} → ${processed[i].date.toISOString()}`);
    }
  }

  return processed;
}

function mergeData(consumption, prices) {
  const FIFTEEN_MINUTES = 15 * 60 * 1000; // 900000 ms

  if (!consumption || consumption.length === 0) {
    console.error('No consumption data to merge');
    return [];
  }

  if (!prices || prices.length === 0) {
    console.error('No price data to merge');
    return [];
  }

  // Timezone verification logging
  console.log('=== TIMEZONE VERIFICATION ===');
  if (consumption.length > 0 && prices.length > 0) {
    const c = consumption[0];
    const p = prices[0];
    console.log('First consumption:', c.date.toISOString(), `(${c.originalDatum})`);
    console.log('First price:', p.date.toISOString(), `(${p.originalTimeString})`);
    console.log('Time difference:', Math.abs(c.date.getTime() - p.date.getTime()) / 1000, 'seconds');
  }

  // Sort both datasets by timestamp
  const sortedConsumption = [...consumption].sort((a, b) => a.date.getTime() - b.date.getTime());
  const sortedPrices = [...prices].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Create a map of price data by rounded timestamp
  const priceMap = new Map();
  for (let price of sortedPrices) {
    const roundedTs = Math.round(price.date.getTime() / FIFTEEN_MINUTES) * FIFTEEN_MINUTES;
    priceMap.set(roundedTs, price.price);
  }

  // Get last known price for forward filling
  const lastKnownPrice = sortedPrices.length > 0
    ? sortedPrices[sortedPrices.length - 1].price
    : null;

  let exactMatches = 0;
  let forwardFilledCount = 0;
  let droppedCount = 0;

  // Process each consumption record
  const merged = [];
  for (let c of sortedConsumption) {
    const roundedTs = Math.round(c.date.getTime() / FIFTEEN_MINUTES) * FIFTEEN_MINUTES;
    let matchedPrice = priceMap.get(roundedTs);
    let priceSource = 'exact';

    // If no exact match, use last known price
    if (matchedPrice === undefined) {
      if (lastKnownPrice !== null) {
        matchedPrice = lastKnownPrice;
        priceSource = 'forward-filled';
        forwardFilledCount++;
      } else {
        // No price available at all - skip this record
        droppedCount++;
        continue;
      }
    } else {
      exactMatches++;
    }

    const marketCost = c.consumption * (matchedPrice / 1000);
    const variableFee = c.consumption * VARIABLE_FEE_PER_KWH;
    const totalCost = marketCost + variableFee;

    merged.push({
      date: c.date,
      timeStr: c.timeStr,
      consumption: c.consumption,
      price: matchedPrice,
      priceSource: priceSource,
      marketCost: marketCost,
      variableFee: variableFee,
      totalCost: totalCost
    });
  }

  console.log('=== MERGE STATISTICS ===');
  console.log('Consumption records:', sortedConsumption.length);
  console.log('Price records:', sortedPrices.length);
  console.log('Exact matches:', exactMatches);
  console.log('Forward-filled:', forwardFilledCount);
  console.log('Dropped (no price):', droppedCount);
  console.log('Total merged:', merged.length);

  // Log date ranges
  if (sortedConsumption.length > 0) {
    console.log('Consumption range:',
      sortedConsumption[0].date.toLocaleDateString(),
      'to',
      sortedConsumption[sortedConsumption.length - 1].date.toLocaleDateString()
    );
  }

  if (sortedPrices.length > 0) {
    console.log('Price range:',
      sortedPrices[0].date.toLocaleDateString(),
      'to',
      sortedPrices[sortedPrices.length - 1].date.toLocaleDateString()
    );
  }

  // Show warning if forward-filling occurred
  if (forwardFilledCount > 0 && lastKnownPrice !== null) {
    const warningMsg = `⚠️ Price Coverage Gap Detected\n\n` +
      `${forwardFilledCount} consumption records have no matching price data.\n` +
      `Using last known price (€${lastKnownPrice.toFixed(2)}/MWh) for cost estimation.\n\n` +
      `This typically happens when consumption data is more recent than price data.`;
    setTimeout(() => setStatus(warningMsg, 'warning'), 500);
  } else if (merged.length === 0) {
    setStatus('❌ No matching timestamps between consumption and price data.', 'error');
  } else {
    setTimeout(() => setStatus(`✅ Successfully processed ${merged.length} records (${exactMatches} exact, ${forwardFilledCount} estimated)`, 'success'), 500);
  }

  return merged;
}

function filterByDateRange(data, startDate, endDate) {
  return data.filter(row => row.date >= startDate && row.date <= endDate);
}

function groupByTime(data) {
  const grouped = {};

  data.forEach(row => {
    if (!grouped[row.timeStr]) {
      grouped[row.timeStr] = {
        consumption: 0,
        count: 0
      };
    }
    grouped[row.timeStr].consumption += row.consumption;
    grouped[row.timeStr].count++;
  });

  // Calculate averages
  Object.keys(grouped).forEach(time => {
    grouped[time].consumption = grouped[time].consumption / grouped[time].count;
  });

  return grouped;
}

function aggregateByMonth(mergedData) {
  console.log('=== MONTHLY AGGREGATION START ===');
  console.log('Processing', mergedData.length, 'records');
  console.log('Grid fees:', `Base=${gridConfig.baseFee} €/month, Work=${gridConfig.workFee} €/kWh`);

  if (!mergedData || mergedData.length === 0) {
    console.warn('No merged data to aggregate');
    return [];
  }

  const monthlyData = {};

  for (let record of mergedData) {
    // Create YYYY-MM key
    const year = record.date.getFullYear();
    const month = String(record.date.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        consumption: 0,
        marketCost: 0,
        variableFee: 0,
        gridWorkCost: 0,
        recordCount: 0,
        forwardFilledCount: 0
      };
    }

    // Calculate costs
    const marketCost = record.consumption * (record.price / 1000);
    const variableFee = record.consumption * VARIABLE_FEE_PER_KWH;
    const gridWorkCost = record.consumption * gridConfig.workFee;

    monthlyData[monthKey].consumption += record.consumption;
    monthlyData[monthKey].marketCost += marketCost;
    monthlyData[monthKey].variableFee += variableFee;
    monthlyData[monthKey].gridWorkCost += gridWorkCost;
    monthlyData[monthKey].recordCount += 1;

    if (record.priceSource === 'forward-filled') {
      monthlyData[monthKey].forwardFilledCount += 1;
    }
  }

  // Convert to sorted array
  const months = Object.keys(monthlyData).sort();
  const result = months.map(m => {
    const data = monthlyData[m];
    const gridBaseCost = gridConfig.baseFee;
    const totalCost = data.marketCost + data.variableFee + FIXED_FEE + gridBaseCost + data.gridWorkCost;
    const avgPrice = data.consumption > 0 ? (totalCost / data.consumption * 100) : 0;

    console.log(`Month ${m}:`, {
      consumption: data.consumption.toFixed(2),
      marketCost: data.marketCost.toFixed(2),
      variableFee: data.variableFee.toFixed(2),
      fixedFee: FIXED_FEE.toFixed(2),
      gridBaseCost: gridBaseCost.toFixed(2),
      gridWorkCost: data.gridWorkCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      records: data.recordCount,
      forwardFilled: data.forwardFilledCount
    });

    return {
      ...data,
      fixedFee: FIXED_FEE,
      gridBaseCost: gridBaseCost,
      totalCost: totalCost,
      avgPrice: avgPrice
    };
  });

  console.log('=== MONTHLY AGGREGATION COMPLETE ===');
  console.log('Months found:', months);

  return result;
}

function calculateStatistics(data) {
  if (!data || data.length === 0) {
    return {
      totalConsumption: 0,
      totalCost: 0,
      avgMonthlyConsumption: 0,
      avgMonthlyCost: 0,
      avgPrice: 0
    };
  }

  const totalConsumption = data.reduce((sum, row) => sum + row.consumption, 0);
  const totalMarketCost = data.reduce((sum, row) => sum + (row.consumption * (row.price / 1000)), 0);
  const totalVariableFee = totalConsumption * VARIABLE_FEE_PER_KWH;
  const totalGridWorkCost = totalConsumption * gridConfig.workFee;

  // Calculate number of months in the date range
  const dates = data.map(d => d.date);
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const months = Math.max(1, (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
                 (maxDate.getMonth() - minDate.getMonth()) + 1);

  // Add fixed fees and grid base fees for each month
  const totalFixedFees = months * FIXED_FEE;
  const totalGridBaseFees = months * gridConfig.baseFee;
  const totalCost = totalMarketCost + totalVariableFee + totalFixedFees + totalGridBaseFees + totalGridWorkCost;

  const avgMonthlyConsumption = totalConsumption / months;
  const avgMonthlyCost = totalCost / months;

  // Avoid division by zero
  const avgPrice = totalConsumption > 0 ? (totalCost / totalConsumption) * 100 : 0; // cents per kWh

  return {
    totalConsumption: totalConsumption.toFixed(2),
    totalCost: totalCost.toFixed(2),
    avgMonthlyConsumption: avgMonthlyConsumption.toFixed(2),
    avgMonthlyCost: avgMonthlyCost.toFixed(2),
    avgPrice: avgPrice.toFixed(3)
  };
}

// Chart Functions
function createConsumptionChart(filteredData, allData) {
  const ctx = document.getElementById('consumption-chart').getContext('2d');

  // Destroy existing chart
  if (state.charts.consumption) {
    state.charts.consumption.destroy();
  }

  // Group data by time
  const selectedGrouped = groupByTime(filteredData);
  const overallGrouped = groupByTime(allData);

  // Create labels (every 15 minutes from 00:00 to 23:45)
  const labels = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      labels.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  // Create data arrays
  const selectedData = labels.map(time => selectedGrouped[time]?.consumption || 0);
  const overallData = labels.map(time => overallGrouped[time]?.consumption || 0);

  // Calculate scaling factor to normalize overall to selected scale
  const selectedMax = Math.max(...selectedData);
  const overallMax = Math.max(...overallData);
  const scaleFactor = selectedMax > 0 ? selectedMax / overallMax : 1;
  const normalizedOverall = overallData.map(v => v * scaleFactor);

  // Filter labels to show every 2 hours
  const displayLabels = labels.map((label, index) => {
    const hour = parseInt(label.split(':')[0]);
    const minute = parseInt(label.split(':')[1]);
    return (hour % 2 === 0 && minute === 0) ? label : '';
  });

  state.charts.consumption = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: displayLabels,
      datasets: [
        {
          label: 'Selected Period',
          data: selectedData,
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 1
        },
        {
          label: 'Overall Pattern (normalized)',
          data: normalizedOverall,
          type: 'line',
          borderColor: 'rgba(231, 76, 60, 0.8)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          onClick: function(evt, legendItem, legend) {
            // by default
            Chart.defaults.plugins.legend.onClick.call(this, evt, legendItem, legend);
          },
          labels: {
            // Add info icon for Netzentgelte
            generateLabels: function(chart) {
              let labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              const idxWork = labels.findIndex(l => l.text === 'Netzentgelt (Arbeit)');
              const idxBase = labels.findIndex(l => l.text === 'Netzentgelt (fix)');
              if(idxWork > -1) labels[idxWork].text += ' ℹ️';
              if(idxBase > -1) labels[idxBase].text += ' ℹ️';
              return labels;
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time of Day'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Consumption (kWh)'
          }
        }
      }
    }
  });
}

function createMonthlyCostChart(data) {
  const ctx = document.getElementById('monthly-cost-chart').getContext('2d');

  // Destroy existing chart
  if (state.charts.monthlyCost) {
    state.charts.monthlyCost.destroy();
  }

  // Aggregate data by month - returns array of month objects
  const monthlyData = aggregateByMonth(data);

  if (monthlyData.length === 0) {
    console.warn('No monthly data to chart');
    return;
  }

  console.log('=== UPDATING MONTHLY CHART ===');
  console.log('Months to display:', monthlyData.map(m => m.month));

  // Extract data for chart
  const labels = monthlyData.map(m => m.month);
  const marketCosts = monthlyData.map(m => m.marketCost);
  const variableFees = monthlyData.map(m => m.variableFee);
  const gridWorkFees = monthlyData.map(m => m.gridWorkCost);
  const gridBaseFees = monthlyData.map(m => m.gridBaseCost);
  const fixedFees = monthlyData.map(m => m.fixedFee);
  const consumption = monthlyData.map(m => m.consumption);

  // Custom colors for grid fees (see provided palette)
  const palette = [
    '#1FB8CD', // Market
    '#FFC185', // Variable Fee
    '#B4413C', // Grid Fee (Arbeit)
    '#ECEBD5', // Grid Fee (fix)
    '#5D878F', // Fixed Fee (Alt)
  ];

  // Calculate average price per month for labels
  const avgPrices = monthlyData.map(m =>
    (m.totalCost / m.consumption * 100).toFixed(2) // cents/kWh
  );

  state.charts.monthlyCost = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Market Cost',
          data: marketCosts,
          backgroundColor: palette[0], // '#1FB8CD'
          borderColor: palette[0],
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Variable Fee',
          data: variableFees,
          backgroundColor: palette[1], // '#FFC185'
          borderColor: palette[1],
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Netzentgelt (Arbeit)',
          data: gridWorkFees,
          backgroundColor: palette[2], // '#B4413C'
          borderColor: palette[2],
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Netzentgelt (fix)',
          data: gridBaseFees,
          backgroundColor: palette[3], // '#ECEBD5'
          borderColor: palette[3],
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Fixed Fee (App)',
          data: fixedFees,
          backgroundColor: palette[4], // '#5D878F'
          borderColor: palette[4],
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Monthly Consumption',
          data: consumption,
          type: 'line',
          borderColor: '#13343B',
          backgroundColor: 'rgba(19,52,59,0.07)',
          borderWidth: 2,
          yAxisID: 'y1',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              // Custom tooltip for each segment
              const label = context.dataset.label || '';
              if (label === 'Netzentgelt (Arbeit)') return `${label}: €${context.parsed.y.toFixed(2)} (Netzarbeitspreis)`;
              if (label === 'Netzentgelt (fix)') return `${label}: €${context.parsed.y.toFixed(2)} (Grundpauschale)`;
              return `${label}: €${context.parsed.y.toFixed(2)}`;
            },
            footer: function(tooltipItems) {
              const index = tooltipItems[0].dataIndex;
              const total = monthlyData[index].totalCost;
              const avgPrice = avgPrices[index];
              return `Gesamtkosten: €${total.toFixed(2)} | Schnitt: ${avgPrice} ¢/kWh`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: 'Month'
          }
        },
        y: {
          stacked: true,
          position: 'left',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Cost (EUR)'
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Consumption (kWh)'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

function updateStatistics(data) {
  const stats = calculateStatistics(data);

  document.getElementById('stat-total-consumption').textContent = `${stats.totalConsumption} kWh`;
  document.getElementById('stat-total-cost').textContent = `€${stats.totalCost}`;
  document.getElementById('stat-avg-monthly-consumption').textContent = `${stats.avgMonthlyConsumption} kWh/month`;
  document.getElementById('stat-avg-monthly-cost').textContent = `€${stats.avgMonthlyCost}/month`;
  document.getElementById('stat-avg-price').textContent = `${stats.avgPrice} ¢/kWh`;
}

// Server-Side Persistence Functions

/**
 * Load saved files from server on page load
 */
async function loadSavedFiles() {
  try {
    console.log('Checking for saved files on server...');
    const response = await fetch('/api/files');
    const result = await response.json();

    if (result.success && result.consumption && result.price) {
      setStatus('Loading previously uploaded files...', 'processing');
      console.log('Found saved files:', result);

      // Load consumption file
      const consumptionResponse = await fetch('/api/download/consumption');
      const consumptionBlob = await consumptionResponse.blob();
      const consumptionFile = new File([consumptionBlob], result.consumption.filename, {
        type: consumptionBlob.type
      });

      // Load price file
      const priceResponse = await fetch('/api/download/price');
      const priceBlob = await priceResponse.blob();
      const priceFile = new File([priceBlob], result.price.filename, {
        type: priceBlob.type
      });

      // Update drop zones with file names
      displayFileName(
        document.getElementById('consumption-filename'),
        document.getElementById('consumption-drop-zone'),
        result.consumption.filename
      );
      displayFileName(
        document.getElementById('price-filename'),
        document.getElementById('price-drop-zone'),
        result.price.filename
      );

      // Process the files
      handleConsumptionFile(consumptionFile);
      handlePriceFile(priceFile);

      setStatus(`✅ Loaded saved files: ${result.consumption.filename} and ${result.price.filename}`, 'success');
      console.log('Successfully loaded saved files from server');
    } else {
      console.log('No saved files found on server');
    }
  } catch (error) {
    console.log('No saved files found or error loading:', error.message);
    // This is fine - just means no files saved yet or server not available
  }
}

/**
 * Save a file to the server
 */
async function saveFileToServer(file, type) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`/api/upload/${type}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to save file to server');
    }

    const result = await response.json();
    console.log(`${type} file saved to server:`, result);
    return true;
  } catch (error) {
    console.error(`Error saving ${type} file to server:`, error);
    return false;
  }
}

/**
 * Clear all saved files from server
 */
async function clearSavedFiles() {
  if (!confirm('Are you sure you want to delete the saved files from the server?')) {
    return;
  }

  try {
    setStatus('Clearing saved files...', 'processing');
    const response = await fetch('/api/clear', {
      method: 'POST'
    });

    const result = await response.json();

    if (result.success) {
      setStatus('✅ Saved files cleared from server', 'success');

      // Clear local state
      state.consumptionData = [];
      state.priceData = [];
      state.mergedData = [];
      state.startDate = null;
      state.endDate = null;
      state.minDate = null;
      state.maxDate = null;

      // Clear file inputs
      document.getElementById('consumption-file').value = '';
      document.getElementById('price-file').value = '';

      // Clear filename displays and drop zones
      const consumptionFilename = document.getElementById('consumption-filename');
      const priceFilename = document.getElementById('price-filename');
      const consumptionDropZone = document.getElementById('consumption-drop-zone');
      const priceDropZone = document.getElementById('price-drop-zone');

      consumptionFilename.textContent = '';
      consumptionFilename.classList.remove('visible');
      consumptionDropZone.classList.remove('has-file');

      priceFilename.textContent = '';
      priceFilename.classList.remove('visible');
      priceDropZone.classList.remove('has-file');

      // Clear date inputs
      document.getElementById('start-date').value = '';
      document.getElementById('end-date').value = '';

      // Clear charts
      if (state.charts.consumption) {
        state.charts.consumption.destroy();
        state.charts.consumption = null;
      }
      if (state.charts.monthlyCost) {
        state.charts.monthlyCost.destroy();
        state.charts.monthlyCost = null;
      }

      // Clear statistics
      document.getElementById('stat-total-consumption').textContent = '-';
      document.getElementById('stat-total-cost').textContent = '-';
      document.getElementById('stat-avg-monthly-consumption').textContent = '-';
      document.getElementById('stat-avg-monthly-cost').textContent = '-';
      document.getElementById('stat-avg-price').textContent = '-';

      console.log('All data cleared from client and server');
    } else {
      setStatus('❌ Error clearing files: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Error clearing files:', error);
    setStatus('⚠️ Could not clear files from server (server may not be available)', 'warning');
  }
}

// Drag & Drop Functions
function setupDropZone(dropZoneId, fileInputId, filenameDisplayId) {
  const dropZone = document.getElementById(dropZoneId);
  const fileInput = document.getElementById(fileInputId);
  const filenameDisplay = document.getElementById(filenameDisplayId);

  // Click to open file picker
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      displayFileName(filenameDisplay, dropZone, file.name);
    }
  });

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Highlight drop zone when dragging over
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove('drag-over');
    }, false);
  });

  // Handle dropped files
  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
      const file = files[0];
      // Set the file to the input
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;

      // Display filename
      displayFileName(filenameDisplay, dropZone, file.name);

      // Trigger change event
      fileInput.dispatchEvent(new Event('change'));
    }
  }, false);
}

function displayFileName(filenameDisplay, dropZone, filename) {
  filenameDisplay.textContent = `✓ ${filename}`;
  filenameDisplay.classList.add('visible');
  dropZone.classList.add('has-file');
}

// File System Access API Functions
let downloadsDirectoryHandle = null;
let monitoringInterval = null;
let lastCheckedFiles = new Map(); // Changed from Set to Map (filename -> {mtime, size})

// Check if File System Access API is supported
function isFileSystemAccessSupported() {
  const supported = 'showDirectoryPicker' in window;
  console.log('File System Access API supported:', supported);
  return supported;
}

// Enable downloads folder monitoring (UPDATED)
async function enableDownloadsMonitor() {
  console.log('Attempting to enable downloads monitoring...');

  if (!isFileSystemAccessSupported()) {
    setStatus('❌ File System Access API not supported in this browser. Use Chrome or Edge.', 'error');
    return;
  }

  try {
    // Request access to Downloads folder with READ-ONLY permission
    console.log('Requesting directory picker with read access...');
    downloadsDirectoryHandle = await window.showDirectoryPicker({
      mode: 'read', // Read-only access
      startIn: 'downloads'
    });

    console.log('Directory access granted:', downloadsDirectoryHandle.name);

    const statusEl = document.getElementById('downloads-monitor-status');
    if (statusEl) {
      statusEl.textContent = '✅ Monitoring folder for new files...';
      statusEl.style.display = 'block';
      statusEl.style.color = '#10b981';
    }

    // Initialize file list
    await updateFileList();
    console.log('Initial file list updated');

    // Start monitoring (check every 2 seconds)
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }
    monitoringInterval = setInterval(checkForNewFiles, 2000);

    setStatus('✅ Folder monitoring enabled', 'success');
    console.log('Monitoring started with read-only access');
  } catch (error) {
    console.error('Error accessing Downloads folder:', error);
    if (error.name === 'AbortError') {
      setStatus('ℹ️ Directory access cancelled', 'info');
    } else {
      setStatus('❌ Could not access Downloads folder: ' + error.message, 'error');
    }
  }
}

// Disable downloads folder monitoring
function disableDownloadsMonitor() {
  console.log('Disabling downloads monitoring...');
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }

  downloadsDirectoryHandle = null;
  lastCheckedFiles.clear();

  const statusEl = document.getElementById('downloads-monitor-status');
  if (statusEl) {
    statusEl.style.display = 'none';
  }

  setStatus('Auto-upload disabled', 'ready');
  console.log('Monitoring stopped');
}

// Update list of known files (UPDATED)
async function updateFileList() {
  if (!downloadsDirectoryHandle) {
    console.warn('No directory handle available');
    return;
  }

  lastCheckedFiles.clear();

  try {
    for await (const entry of downloadsDirectoryHandle.values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        lastCheckedFiles.set(entry.name, {
          mtime: file.lastModified,
          size: file.size
        });
      }
    }
    console.log('File list updated. Files found:', lastCheckedFiles.size);
  } catch (error) {
    console.error('Error updating file list:', error);
  }
}

// Check for new files (UPDATED)
async function checkForNewFiles() {
  if (!downloadsDirectoryHandle) {
    console.warn('No directory handle, stopping monitoring');
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
    return;
  }

  try {
    const currentFiles = new Map();

    for await (const entry of downloadsDirectoryHandle.values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        const metadata = {
          mtime: file.lastModified,
          size: file.size
        };

        currentFiles.set(entry.name, metadata);

        // Check if this is a new or modified file
        const lastMetadata = lastCheckedFiles.get(entry.name);

        if (!lastMetadata ||
            lastMetadata.mtime !== metadata.mtime ||
            lastMetadata.size !== metadata.size) {
          console.log('New/modified file detected:', entry.name,
                     'Last modified:', new Date(metadata.mtime));
          await handleNewDownloadedFile(entry);
        }
      }
    }

    lastCheckedFiles = currentFiles;
  } catch (error) {
    console.error('Error checking for new files:', error);
    // Don't stop monitoring on error, might be temporary
  }
}

// Handle newly downloaded file (UPDATED)
async function handleNewDownloadedFile(fileHandle) {
  const fileName = fileHandle.name.toLowerCase();

  console.log('Processing new file:', fileHandle.name);

  // Check if it's a consumption file
  const isConsumptionFile = fileName.includes('verbrauch') ||
                           fileName.includes('consumption') ||
                           fileName.includes('anlage');

  // Check if it's a price file
  const isPriceFile = fileName.includes('preis') ||
                     fileName.includes('price') ||
                     fileName.includes('exaa') ||
                     fileName.includes('day-ahead') ||
                     fileName.includes('apg');

  if (isConsumptionFile || isPriceFile) {
    try {
      console.log('File matches pattern:', isConsumptionFile ? 'consumption' : 'price');
      const file = await fileHandle.getFile();

      // Show notification
      const fileType = isConsumptionFile ? 'consumption' : 'price';
      setStatus(`📥 Auto-detected ${fileType} file: ${file.name}`, 'info');

      // Load the file
      if (isConsumptionFile) {
        const fileInput = document.getElementById('consumption-file');
        if (fileInput) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;

          const filenameDisplay = document.getElementById('consumption-filename');
          const dropZone = document.getElementById('consumption-drop-zone');
          if (filenameDisplay && dropZone) {
            displayFileName(filenameDisplay, dropZone, file.name);
          }

          handleConsumptionFile(file);
          console.log('Consumption file loaded successfully');
          showStatus(`✅ ${fileType} file uploaded successfully`, 'success');
        }
      } else if (isPriceFile) {
        const fileInput = document.getElementById('price-file');
        if (fileInput) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;

          const filenameDisplay = document.getElementById('price-filename');
          const dropZone = document.getElementById('price-drop-zone');
          if (filenameDisplay && dropZone) {
            displayFileName(filenameDisplay, dropZone, file.name);
          }

          handlePriceFile(file);
          console.log('Price file loaded successfully');
          showStatus(`✅ ${fileType} file uploaded successfully`, 'success');
        }
      }

      // NO DELETION CODE - Files remain in Downloads folder

    } catch (error) {
      console.error('Error loading downloaded file:', error);
      setStatus('❌ Error auto-loading file: ' + error.message, 'error');
    }
  } else {
    console.log('File does not match any pattern, ignoring:', fileName);
  }
}

// Helper function to show status (alias for setStatus)
function showStatus(message, type) {
  setStatus(message, type);
}

// File Upload Handlers
function handleConsumptionFile(file) {
  const reader = new FileReader();
  const filename = file.name;
  const extension = filename.split('.').pop().toLowerCase();

  reader.onload = async function(e) {
    try {
      let data;

      if (extension === 'csv') {
        // Parse CSV with semicolon separator
        const text = e.target.result;
        const parsed = Papa.parse(text, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true
        });
        data = parsed.data;
      } else if (extension === 'xlsx' || extension === 'xls') {
        // Parse Excel
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(firstSheet);
      }

      // Process the data
      const processedData = data.map(row => ({
        datum: row.Datum || row.datum,
        timestamp: parseInt(row.Timestamp || row.timestamp),
        verbrauch: row.Verbrauch || row.verbrauch
      }));

      state.consumptionData = processConsumptionData(processedData);
      displayFileName(
        document.getElementById('consumption-filename'),
        document.getElementById('consumption-drop-zone'),
        filename
      );

      // Save to server (non-blocking)
      saveFileToServer(file, 'consumption').then(saved => {
        if (saved) {
          console.log('Consumption file saved to server');
        } else {
          console.warn('Could not save consumption file to server, but processing locally');
        }
      });

      // Try to merge if both files are loaded
      tryMergeAndUpdate();
    } catch (error) {
      setStatus(`Error parsing consumption file: ${error.message}`, 'error');
    }
  };

  if (extension === 'csv') {
    reader.readAsText(file);
  } else {
    reader.readAsBinaryString(file);
  }
}

function handlePriceFile(file) {
  const reader = new FileReader();
  const filename = file.name;

  reader.onload = async function(e) {
    try {
      const text = e.target.result;
      const parsed = Papa.parse(text, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
        dynamicTyping: true
      });

      // Process the data
      const processedData = parsed.data.map(row => ({
        zeit_von: row['Zeit von [CET/CEST]'] || row.zeit_von,
        preis: parseFloat(String(row['Preis MC Auktion [EUR/MWh]'] || row.preis).replace(',', '.'))
      }));

      state.priceData = processPriceData(processedData);
      displayFileName(
        document.getElementById('price-filename'),
        document.getElementById('price-drop-zone'),
        filename
      );

      // Save to server (non-blocking)
      saveFileToServer(file, 'price').then(saved => {
        if (saved) {
          console.log('Price file saved to server');
        } else {
          console.warn('Could not save price file to server, but processing locally');
        }
      });

      // Try to merge if both files are loaded
      tryMergeAndUpdate();
    } catch (error) {
      setStatus(`Error parsing price file: ${error.message}`, 'error');
    }
  };

  reader.readAsText(file);
}

function tryMergeAndUpdate() {
  if (state.consumptionData.length > 0 && state.priceData.length > 0) {
    setStatus('Processing data...', 'processing');

    console.log('=== STARTING DATA MERGE ===');

    // Merge the data
    state.mergedData = mergeData(state.consumptionData, state.priceData);

    if (state.mergedData.length === 0) {
      const msg = `No matching timestamps found.\n\n` +
        `Consumption: ${state.consumptionData.length} records\n` +
        `First timestamp: ${state.consumptionData[0].date.toLocaleString()}\n\n` +
        `Price: ${state.priceData.length} records\n` +
        `First timestamp: ${state.priceData[0].date.toLocaleString()}\n\n` +
        `Please ensure both files cover the same time period.`;
      setStatus(msg, 'error');
      console.error(msg);
      return;
    }

    console.log('=== MERGE COMPLETED ===');
    console.log('Merged records:', state.mergedData.length);

    // Calculate date range
    const dates = state.mergedData.map(d => d.date);
    state.minDate = new Date(Math.min(...dates));
    state.maxDate = new Date(Math.max(...dates));

    // Set default date range (start of month to end of data)
    const firstOfMonth = new Date(state.maxDate.getFullYear(), state.maxDate.getMonth(), 1);
    state.startDate = firstOfMonth > state.minDate ? firstOfMonth : state.minDate;
    state.endDate = state.maxDate;

    // Update date inputs
    document.getElementById('start-date').min = formatDateForInput(state.minDate);
    document.getElementById('start-date').max = formatDateForInput(state.maxDate);
    document.getElementById('start-date').value = formatDateForInput(state.startDate);

    document.getElementById('end-date').min = formatDateForInput(state.minDate);
    document.getElementById('end-date').max = formatDateForInput(state.maxDate);
    document.getElementById('end-date').value = formatDateForInput(state.endDate);

    // Log processing summary
    console.log('=== PROCESSING SUMMARY ===');
    const tempMonthly = aggregateByMonth(state.mergedData);
    tempMonthly.forEach(month => {
      console.log(`${month.month}:`,
        `Consumption=${month.consumption.toFixed(1)}kWh`,
        `MarketCost=€${month.marketCost.toFixed(2)}`,
        `VarFee=€${month.variableFee.toFixed(2)}`,
        `FixedFee=€${month.fixedFee.toFixed(2)}`,
        `Total=€${month.totalCost.toFixed(2)}`
      );
    });

    // Update visualizations
    updateAnalysis();
  }
}

function updateAnalysis() {
  if (state.mergedData.length === 0) {
    setStatus('No data available', 'error');
    return;
  }

  setStatus('Updating analysis...', 'processing');

  // Filter data by selected date range
  const filteredData = filterByDateRange(state.mergedData, state.startDate, state.endDate);

  if (filteredData.length === 0) {
    setStatus('No data in selected date range', 'error');
    return;
  }

  // Update charts
  createConsumptionChart(filteredData, state.mergedData);
  createMonthlyCostChart(state.mergedData); // Always use all data for monthly costs

  // Update statistics
  updateStatistics(filteredData);

  setStatus('Analysis updated', 'success');
}



// Event Listeners
// Modal UI logic for Netzentgelte config
function setupGridConfigPanel() {
  const openBtn = document.getElementById('open-grid-config');
  const modal = document.getElementById('grid-config-modal');
  const closeBtn = document.getElementById('close-grid-config');
  const saveBtn = document.getElementById('save-grid-fees');
  const resetBtn = document.getElementById('reset-grid-fees');
  const inputBaseFee = document.getElementById('grid-base-fee');
  const inputWorkFee = document.getElementById('grid-work-fee');

  function showModal() {
    inputBaseFee.value = gridConfig.baseFee;
    inputWorkFee.value = gridConfig.workFee;
    modal.style.display = 'flex';
  }

  function hideModal() {
    modal.style.display = 'none';
  }

  openBtn.addEventListener('click', showModal);
  closeBtn.addEventListener('click', hideModal);

  saveBtn.addEventListener('click', function() {
    let base = parseFloat(inputBaseFee.value);
    let work = parseFloat(inputWorkFee.value);
    if (isNaN(base) || base < 0) base = DEFAULT_GRID_BASE_FEE;
    if (isNaN(work) || work < 0) work = DEFAULT_GRID_WORK_FEE;
    gridConfig.baseFee = base;
    gridConfig.workFee = work;
    hideModal();
    updateAnalysis();
    setStatus('Netzentgelte aktualisiert', 'success');
  });

  resetBtn.addEventListener('click', function() {
    gridConfig.baseFee = DEFAULT_GRID_BASE_FEE;
    gridConfig.workFee = DEFAULT_GRID_WORK_FEE;
    inputBaseFee.value = gridConfig.baseFee;
    inputWorkFee.value = gridConfig.workFee;
    updateAnalysis();
    setStatus('Netzentgelte auf Standardwerte zurückgesetzt', 'success');
  });

  // Allow modal close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('=== INITIALIZING APPLICATION ===');

  // Try to load saved files from server
  loadSavedFiles();

  // Setup Netzentgelte config modal
  setupGridConfigPanel();

  // Setup drag & drop zones
  setupDropZone('consumption-drop-zone', 'consumption-file', 'consumption-filename');
  setupDropZone('price-drop-zone', 'price-file', 'price-filename');

  // File upload listeners
  const consumptionFileInput = document.getElementById('consumption-file');
  const priceFileInput = document.getElementById('price-file');

  if (consumptionFileInput) {
    consumptionFileInput.addEventListener('change', function(e) {
      console.log('Consumption file input changed');
      if (e.target.files.length > 0) {
        handleConsumptionFile(e.target.files[0]);
      }
    });
  }

  if (priceFileInput) {
    priceFileInput.addEventListener('change', function(e) {
      console.log('Price file input changed');
      if (e.target.files.length > 0) {
        handlePriceFile(e.target.files[0]);
      }
    });
  }

  // Downloads monitoring button
  const enableMonitorBtn = document.getElementById('enable-downloads-monitor');
  if (enableMonitorBtn) {
    if (isFileSystemAccessSupported()) {
      enableMonitorBtn.addEventListener('click', enableDownloadsMonitor);
      console.log('Downloads monitor button initialized');
    } else {
      // Hide the section if not supported
      const monitorSection = enableMonitorBtn.closest('.downloads-monitor-section');
      if (monitorSection) {
        monitorSection.style.display = 'none';
      }
      console.log('File System Access API not supported');
    }
  } else {
    console.error('Enable downloads monitor button not found');
  }

  // Clear saved files button
  const clearSavedBtn = document.getElementById('clear-saved-btn');
  if (clearSavedBtn) {
    clearSavedBtn.addEventListener('click', clearSavedFiles);
    console.log('Clear saved button listener registered');
  }

  // Date change listeners
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');

  if (startDateInput) {
    startDateInput.addEventListener('change', function(e) {
      console.log('Start date changed to:', e.target.value);
      const newDate = new Date(e.target.value);
      if (!isNaN(newDate.getTime())) {
        state.startDate = newDate;
        console.log('State updated - startDate:', state.startDate);
      }
    });
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', function(e) {
      console.log('End date changed to:', e.target.value);
      const newDate = new Date(e.target.value);
      if (!isNaN(newDate.getTime())) {
        // Set to end of day
        newDate.setHours(23, 59, 59, 999);
        state.endDate = newDate;
        console.log('State updated - endDate:', state.endDate);
      }
    });
  }

  // Quick action buttons
  const startOfMonthBtn = document.getElementById('start-of-month-btn');
  const fullRangeBtn = document.getElementById('full-range-btn');
  const updateBtn = document.getElementById('update-btn');

  if (startOfMonthBtn) {
    startOfMonthBtn.addEventListener('click', function() {
      console.log('Start of Month button clicked');
      if (!state.maxDate) {
        setStatus('❌ Please upload data files first', 'error');
        return;
      }

      const firstOfMonth = new Date(state.maxDate.getFullYear(), state.maxDate.getMonth(), 1);
      state.startDate = firstOfMonth > state.minDate ? firstOfMonth : state.minDate;
      state.endDate = state.maxDate;

      document.getElementById('start-date').value = formatDateForInput(state.startDate);
      document.getElementById('end-date').value = formatDateForInput(state.endDate);

      console.log('Set to start of month:', state.startDate, 'to', state.endDate);
      updateAnalysis();
    });
    console.log('Start of Month button listener registered');
  }

  if (fullRangeBtn) {
    fullRangeBtn.addEventListener('click', function() {
      console.log('Full Range button clicked');
      if (!state.minDate || !state.maxDate) {
        setStatus('❌ Please upload data files first', 'error');
        return;
      }

      state.startDate = state.minDate;
      state.endDate = state.maxDate;

      document.getElementById('start-date').value = formatDateForInput(state.startDate);
      document.getElementById('end-date').value = formatDateForInput(state.endDate);

      console.log('Set to full range:', state.startDate, 'to', state.endDate);
      updateAnalysis();
    });
    console.log('Full Range button listener registered');
  }

  if (updateBtn) {
    updateBtn.addEventListener('click', function() {
      console.log('Update button clicked');
      if (state.mergedData.length > 0) {
        updateAnalysis();
      } else {
        setStatus('❌ Please upload data files first', 'error');
      }
    });
    console.log('Update button listener registered');
  }

  // Initialize status
  setStatus('Ready - Please upload data files', 'ready');
  console.log('=== APPLICATION INITIALIZED ===');
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    console.log('Monitoring stopped on page unload');
  }
});
