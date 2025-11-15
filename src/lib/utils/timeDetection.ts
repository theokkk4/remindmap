// Detect time mentions in text and extract dates
export function detectTimeInText(text: string): Date | null {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  const now = new Date();
  
  // Today
  if (lowerText.includes('today')) {
    return now;
  }
  
  // Tomorrow
  if (lowerText.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  // This week/next week
  if (lowerText.includes('this week')) {
    const thisWeek = new Date(now);
    thisWeek.setDate(thisWeek.getDate() + 3);
    return thisWeek;
  }
  
  if (lowerText.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }
  
  // Specific days
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayIndex = days.findIndex(day => lowerText.includes(day));
  if (dayIndex !== -1) {
    const targetDay = new Date(now);
    const currentDay = now.getDay();
    const daysUntilTarget = (dayIndex + 1 - currentDay + 7) % 7 || 7;
    targetDay.setDate(targetDay.getDate() + daysUntilTarget);
    return targetDay;
  }
  
  // Time patterns (e.g., "at 3pm", "by 5:30")
  const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm)/i;
  const match = text.match(timePattern);
  if (match) {
    const date = new Date(now);
    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const period = match[3].toLowerCase();
    
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  return null;
}
