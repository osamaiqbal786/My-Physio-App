import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Session } from '../types';

export const scheduleSessionNotification = async (session: Session): Promise<string | null> => {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return null;
  }

  try {
    const sessionDate = new Date(`${session.date}T${session.time}`);
    
    // Schedule notification 1 hour before the session
    const notificationDate = new Date(sessionDate);
    notificationDate.setHours(notificationDate.getHours() - 1);
    
    // Don't schedule if the notification time is in the past
    if (notificationDate <= new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming Session Reminder',
        body: `You have a session with ${session.patientName} at ${session.time}`,
        data: { sessionId: session.id },
      },
      trigger: notificationDate,
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};