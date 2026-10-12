import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config';

let alCaducarSesion = null;
export const setAlCaducarSesion = (fn) => { alCaducarSesion = fn; };

export const getToken = () => SecureStore.getItemAsync('access');

export async function login(username, password) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Revisa el Wi-Fi y la IP en config.js');
  }
  if (!res.ok) throw new Error('Usuario o contraseña incorrectos');
  const data = await res.json();
  await SecureStore.setItemAsync('access', data.access);
  await SecureStore.setItemAsync('refresh', data.refresh);
}

export async function logout() {
  await SecureStore.deleteItemAsync('access');
  await SecureStore.deleteItemAsync('refresh');
}

// Pide un access nuevo con el refresh. Devuelve true si funcionó.
async function renovarToken() {
  const refresh = await SecureStore.getItemAsync('refresh');
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    await SecureStore.setItemAsync('access', data.access);
    if (data.refresh) await SecureStore.setItemAsync('refresh', data.refresh); // si rotas tokens
    return true;
  } catch (e) {
    return false;
  }
}

export async function apiGet(path) {
  const pedir = async () => {
    const token = await getToken();
    return fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  };

  let res;
  try {
    res = await pedir();
    if (res.status === 401 && (await renovarToken())) {
      res = await pedir(); // reintenta una vez con el token nuevo
    }
  } catch (e) {
    throw new Error('Sin conexión con el servidor');
  }

  if (res.status === 401) {
    await logout();
    if (alCaducarSesion) alCaducarSesion();
    throw new Error('Tu sesión expiró. Inicia sesión de nuevo');
  }
  if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
  return res.json();
}

export async function apiPost(path, body) {
  const token = await getToken();
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error('Sin conexión con el servidor');
  }
  if (res.status === 401) {
    await logout();
    if (alCaducarSesion) alCaducarSesion();
    throw new Error('Tu sesión expiró. Inicia sesión de nuevo');
  }
  if (!res.ok) {
    let mensaje = `Error del servidor (${res.status})`;
    try {
      const data = await res.json();
      if (data.detail) mensaje = data.detail;
    } catch (e) {}
    throw new Error(mensaje);
  }
  return res.json();
}