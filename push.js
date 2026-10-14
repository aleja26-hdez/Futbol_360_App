import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiEnviar } from './api';

// Cómo se muestra un aviso si llega con la app abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registrarPush() {
  try {
    if (Platform.OS !== 'android' || !Device.isDevice) return;

    // El canal se crea antes de pedir el permiso (Android 13 o superior lo exige)
    await Notifications.setNotificationChannelAsync('avisos', {
      name: 'Avisos de la escuela',
      importance: Notifications.AndroidImportance.HIGH,
    });

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return;

    const { data } = await Notifications.getDevicePushTokenAsync();
    await apiEnviar('/api/app/dispositivos/', 'POST', { token: data, plataforma: 'android' });
  } catch (e) {
    // El push es un extra: si algo falla, la app sigue funcionando
  }
}

export async function quitarPush() {
  try {
    if (Platform.OS !== 'android' || !Device.isDevice) return;
    const { data } = await Notifications.getDevicePushTokenAsync();
    await apiEnviar('/api/app/dispositivos/', 'DELETE', { token: data });
  } catch (e) {}
}