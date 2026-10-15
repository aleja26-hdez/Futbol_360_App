import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { apiEnviar } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registrarPush() {
  const pasos = [];
  try {
    pasos.push(`1. Sistema: ${Platform.OS}, celular real: ${Device.isDevice}`);
    if (Platform.OS !== 'android' || !Device.isDevice) {
      Alert.alert('Diagnóstico push', pasos.join('\n'));
      return;
    }

    await Notifications.setNotificationChannelAsync('avisos', {
      name: 'Avisos de la escuela',
      importance: Notifications.AndroidImportance.HIGH,
    });
    pasos.push('2. Canal de notificaciones creado');

    let { status } = await Notifications.getPermissionsAsync();
    pasos.push(`3. Permiso actual: ${status}`);
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
      pasos.push(`4. Permiso tras preguntar: ${status}`);
    }
    if (status !== 'granted') {
      Alert.alert('Diagnóstico push', pasos.join('\n'));
      return;
    }

    const { data } = await Notifications.getDevicePushTokenAsync();
    pasos.push(`5. Token obtenido: ${String(data).slice(0, 12)}...`);

    await apiEnviar('/api/app/dispositivos/', 'POST', { token: data, plataforma: 'android' });
    pasos.push('6. Registrado en Django');
  } catch (e) {
    pasos.push(`ERROR: ${e.message}`);
  }
  Alert.alert('Diagnóstico push', pasos.join('\n'));
}

export async function quitarPush() {
  try {
    if (Platform.OS !== 'android' || !Device.isDevice) return;
    const { data } = await Notifications.getDevicePushTokenAsync();
    await apiEnviar('/api/app/dispositivos/', 'DELETE', { token: data });
  } catch (e) {}
}