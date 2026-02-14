import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// API de notificación
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationManager {
  static async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  static async scheduleProgressAlerts(title: string, createdAt: string, deadline: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚔️ ¡No te rindas!",
        body: `¿Ya avanzaste con: ${title}? El tiempo corre.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60,
        repeats: false,
      },
    });
  }
}