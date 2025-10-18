/**
 * Calculate the date for a specific week and day
 * @param {string} startDate - The start date in YYYY-MM-DD format
 * @param {number} weekNum - The week number
 * @param {number} dayNum - The day number
 * @returns {string} - Formatted date string
 */
export const calculateDate = (startDate, weekNum, dayNum) => {
  if (!startDate) return 'Not Scheduled';

  const start = new Date(startDate);
  // Calculate days offset: (week - 1) * 7 + (day - 1)
  const offsetDays = (weekNum - 1) * 7 + (dayNum - 1);
  const targetDate = new Date(start);
  targetDate.setDate(start.getDate() + offsetDays);

  return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Get statistics from the learning data
 * @param {Object} data - The learning data
 * @returns {Object} - Statistics object with total, completed, and percent
 */
export const getStats = (data) => {
  const total = data.weeks.reduce((sum, w) => sum + w.days.length, 0);
  const completed = data.weeks.reduce((sum, w) => sum + w.days.filter(d => d.completed).length, 0);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percent };
};

/**
 * Get focus-specific statistics
 * @param {Object} data - The learning data
 * @returns {Object} - Focus statistics object
 */
export const getFocusStats = (data) => {
  const stats = {};
  data.weeks.forEach(week => {
    week.days.forEach(day => {
      if (!stats[day.focus]) stats[day.focus] = { total: 0, completed: 0 };
      stats[day.focus].total++;
      if (day.completed) stats[day.focus].completed++;
    });
  });
  return stats;
};

/**
 * Get the next incomplete task
 * @param {Object} data - The learning data
 * @returns {Object|null} - Next task object or null
 */
export const getNextTask = (data) => {
  for (let week of data.weeks) {
    for (let day of week.days) {
      if (!day.completed) {
        return { week: week.week, day };
      }
    }
  }
  return null;
};
