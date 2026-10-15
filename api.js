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
    if (data.refresh) await SecureStore.setItemAsync('refresh', data.refresh);
    return true;
  } catch (e) {
    return false;
  }
}

const ETIQUETAS = {
  username: 'Usuario', password: 'Contraseña', first_name: 'Nombre', last_name: 'Apellido',
  email: 'Email', rol: 'Rol', escuela: 'Escuela', nombre: 'Nombre', ciudad: 'Ciudad',
  direccion: 'Dirección', edad_minima: 'Edad mínima', edad_maxima: 'Edad máxima',
  telefono: 'Teléfono', instagram: 'Instagram', facebook: 'Facebook', logo: 'Logo',
  imagen: 'Foto', descripcion: 'Descripción',
};

function mensajeDeError(data, estado) {
  if (data && data.detail) return data.detail;
  if (data && typeof data === 'object') {
    const partes = Object.entries(data).map(([campo, msgs]) => {
      const texto = [].concat(msgs).join(' ');
      const etiqueta = ETIQUETAS[campo];
      return etiqueta ? `${etiqueta}: ${texto}` : texto;
    });
    if (partes.length) return partes.join('\n');
  }
  return `Error del servidor (${estado})`;
}

async function pedir(path, { method = 'GET', body } = {}) {
  const enviar = async () => {
    const token = await getToken();
    const headers = { Authorization: `Bearer ${token}` };
    let cuerpo;
    if (body instanceof FormData) {
      cuerpo = body; // con archivos, React Native pone el Content-Type solo
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      cuerpo = JSON.stringify(body);
    }
    return fetch(`${API_URL}${path}`, { method, headers, body: cuerpo });
  };

  let res;
  try {
    res = await enviar();
    if (res.status === 401 && (await renovarToken())) {
      res = await enviar(); // reintenta una vez con el token nuevo
    }
  } catch (e) {
    throw new Error('Sin conexión con el servidor');
  }

  if (res.status === 401) {
    await logout();
    if (alCaducarSesion) alCaducarSesion();
    throw new Error('Tu sesión expiró. Inicia sesión de nuevo');
  }

  const texto = await res.text();
  let data = null;
  try { data = texto ? JSON.parse(texto) : null; } catch (e) {}
  if (!res.ok) throw new Error(mensajeDeError(data, res.status));
  return data;
}

export const apiGet = (path) => pedir(path);
export const apiPost = (path, body) => pedir(path, { method: 'POST', body });
export const apiEnviar = (path, metodo, body) => pedir(path, { method: metodo, body });