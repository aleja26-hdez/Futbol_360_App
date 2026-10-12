import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login } from '../api';
import { colores } from '../theme';

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
    <KeyboardAvoidingView style={styles.fondo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.tarjeta}>
        <Text style={styles.logo}>⚽ Futbol 360</Text>
        <Text style={styles.sub}>Inicia sesión para continuar</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.boton} onPress={entrar} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Entrar</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.verdeOscuro, justifyContent: 'center', padding: 24 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  logo: { fontSize: 24, fontWeight: 'bold', color: colores.verdeOscuro, textAlign: 'center' },
  sub: { color: colores.gris, textAlign: 'center', marginBottom: 20, marginTop: 4 },
  input: { borderWidth: 1, borderColor: colores.borde, borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 16 },
  error: { color: '#c62828', marginBottom: 12 },
  boton: { backgroundColor: colores.verde, borderRadius: 10, padding: 14, alignItems: 'center' },
  botonTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});