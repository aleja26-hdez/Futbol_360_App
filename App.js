import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './screens/LoginScreen';
import PadreHome from './screens/PadreHome';
import EntrenadorHome from './screens/EntrenadorHome';
import DirectivoHome from './screens/DirectivoHome';
import { apiGet, getToken, logout, setAlCaducarSesion } from './api';
import { colores } from './theme';

export default function App() {
  const [user, setUser] = useState(null);
  const [iniciando, setIniciando] = useState(true);

  const cargarUsuario = async () => {
    setUser(await apiGet('/api/usuarios/me/'));
  };

  const cerrarSesion = async () => {
    await logout();
    setUser(null);
  };

  useEffect(() => {
    setAlCaducarSesion(() => setUser(null));
    (async () => {
      try {
        if (await getToken()) await cargarUsuario();
      } catch (e) {
        // no hay sesión válida: se muestra el login
      } finally {
        setIniciando(false);
      }
    })();
  }, []);

  let pantalla;
  if (iniciando) {
    pantalla = <View style={styles.centro}><ActivityIndicator size="large" color={colores.verde} /></View>;
  } else if (!user) {
    pantalla = <LoginScreen onLogin={cargarUsuario} />;
  } else if (user.rol === 'padre') {
    pantalla = <PadreHome user={user} onLogout={cerrarSesion} />;
  } else if (user.rol === 'entrenador') {
    pantalla = <EntrenadorHome user={user} onLogout={cerrarSesion} />;
  } else if (user.rol === 'directivo') {
    pantalla = <DirectivoHome user={user} onLogout={cerrarSesion} />;
  } else {
    pantalla = (
      <View style={styles.centro}>
        <Text style={styles.titulo}>Hola, {user.first_name || user.username}</Text>
        <Text style={styles.texto}>La pantalla para el rol "{user.rol}" no está disponible.</Text>
        <TouchableOpacity onPress={cerrarSesion}><Text style={styles.link}>Cerrar sesión</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      {pantalla}
    </>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colores.fondo },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  texto: { textAlign: 'center', color: colores.gris, marginBottom: 16 },
  link: { color: colores.verde, fontWeight: 'bold' },
});