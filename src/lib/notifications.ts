import type { Item } from './types';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendNotification(title: string, body: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/logo.svg',
      badge: '/logo.svg',
      ...options,
    });
  }
}

export function checkReminders(items: Item[]): void {
  const now = new Date();

  items.forEach(item => {
    if (!item.reminderEnabled || !item.reminderTime) return;

    const [hours, minutes] = item.reminderTime.split(':').map(Number);
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    // Check if it's time for the reminder
    const timeDiff = now.getTime() - reminderDate.getTime();
    const isWithinMinute = timeDiff >= 0 && timeDiff < 60000; // Within 1 minute

    if (!isWithinMinute) return;

    // Check if already notified today
    const lastNotified = item.lastNotified ? new Date(item.lastNotified) : null;
    if (lastNotified) {
      const hoursSinceLastNotification = (now.getTime() - lastNotified.getTime()) / (1000 * 60 * 60);

      // Don't notify again if we already notified within the recurrence period
      if (item.reminderRecurrence === 'daily' && hoursSinceLastNotification < 23) return;
      if (item.reminderRecurrence === 'weekly' && hoursSinceLastNotification < 167) return;
      if (item.reminderRecurrence === 'monthly' && hoursSinceLastNotification < 719) return;
      if (item.reminderRecurrence === 'none' && hoursSinceLastNotification < 1) return;
    }

    // Send notification
    const recurrenceText = item.reminderRecurrence !== 'none' ? ` (${item.reminderRecurrence})` : '';
    sendNotification(
      `Reminder: ${item.title}`,
      `${item.description || 'Time to check this task'}${recurrenceText}`,
      {
        tag: item.id, // Prevent duplicate notifications
        requireInteraction: false,
      }
    );
  });
}

export function scheduleReminderCheck(items: Item[], callback: (id: string) => void): NodeJS.Timeout {
  // Check reminders every minute
  return setInterval(() => {
    checkReminders(items);
  }, 60000); // Check every minute
}
