import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login } from '../api';
import { colores } from '../theme';

const MODULOS = [
  ['👥', 'Jugadores'], ['📅', 'Entrenamientos'], ['🏆', 'Torneos y partidos'],
  ['💳', 'Pagos'], ['✅', 'Asistencias'], ['🧑‍🏫', 'Entrenadores'], ['🔔', 'Notificaciones'],
];

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    if (!username.trim() || !password) {
      setError('Escribe tu usuario y contraseña');
      return;
    }
    setCargando(true);
    setError('');
    try {
      await login(username.trim(), password);
      await onLogin();
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colores.fondo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.cont} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>⚽ FÚTBOL<Text style={{ color: colores.neon }}>360</Text></Text>
        <Text style={styles.tag}>— PLATAFORMA DE GESTIÓN DEPORTIVA</Text>
        <Text style={styles.titulo}>Gestiona tu escuela.</Text>
        <Text style={styles.titulo}>Forma <Text style={{ color: colores.neon }}>campeones.</Text></Text>

        <View style={styles.formulario}>
          <TextInput style={styles.input} placeholder="Usuario" placeholderTextColor={colores.gris} autoCapitalize="none" autoCorrect={false} value={username} onChangeText={setUsername} />
          <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor={colores.gris} secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.boton} onPress={entrar} disabled={cargando}>
            {cargando ? <ActivityIndicator color="#04100a" /> : <Text style={styles.botonTexto}>Iniciar sesión</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.grilla}>
          {MODULOS.map(([ico, nombre]) => (
            <View key={nombre} style={styles.modulo}>
              <Text style={{ fontSize: 26 }}>{ico}</Text>
              <Text style={styles.moduloTxt}>{nombre}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  cont: { padding: 24, paddingTop: 60 },
  logo: { fontSize: 26, fontWeight: '800', fontStyle: 'italic', color: '#fff', marginBottom: 28 },
  tag: { color: colores.neon, fontSize: 11, letterSpacing: 2, fontWeight: '600', marginBottom: 10 },
  titulo: { color: '#fff', fontSize: 34, fontWeight: '800', lineHeight: 40 },
  formulario: { marginTop: 24, backgroundColor: colores.tarjeta, borderRadius: 14, borderWidth: 1, borderColor: colores.borde, padding: 18 },
  input: { borderWidth: 1, borderColor: colores.borde, backgroundColor: '#08170f', color: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 16 },
  error: { color: '#ff6b6b', marginBottom: 12 },
  boton: { backgroundColor: colores.neon, borderRadius: 10, padding: 14, alignItems: 'center' },
  botonTexto: { color: '#04100a', fontWeight: 'bold', fontSize: 16 },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 24 },
  modulo: { width: '48%', backgroundColor: colores.tarjeta, borderWidth: 1, borderColor: colores.borde, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  moduloTxt: { color: '#fff', fontWeight: '600', marginTop: 6, textAlign: 'center', fontSize: 13 },
});