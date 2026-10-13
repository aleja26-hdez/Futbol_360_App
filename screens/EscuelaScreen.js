import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { apiGet } from '../api';
import { colores } from '../theme';

function Fila({ etiqueta, valor, enlace }) {
  if (!valor) return null;
  return (
    <Text style={styles.fila}>
      <Text style={styles.etiqueta}>{etiqueta}: </Text>
      {enlace ? <Text style={styles.link} onPress={() => Linking.openURL(valor)}>{valor}</Text> : valor}
    </Text>
  );
}

export default function EscuelaScreen() {
  const [s, setS] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      setError('');
      const d = await apiGet('/api/escuela/');
      setS(d && d.id ? d : null);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (cargando) return <ActivityIndicator size="large" style={{ marginTop: 40 }} color={colores.verde} />;

  const imagenes = [];
  if (s?.logo) imagenes.push({ id: 'logo', uri: s.logo, pie: 'Logo' });
  (s?.fotos || []).forEach((f) => imagenes.push({ id: f.id, uri: f.imagen, pie: f.descripcion }));

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!s && !error ? <Text style={{ color: colores.gris }}>Aún no hay información de la escuela.</Text> : null}

      {s ? (
        <View style={styles.card}>
          <Text style={styles.nombre}>{s.nombre}</Text>
          <Fila etiqueta="Ubicación" valor={[s.direccion, s.ciudad].filter(Boolean).join(', ')} />
          <Fila etiqueta="Edades" valor={`${s.edad_minima} a ${s.edad_maxima} años`} />
          <Fila etiqueta="Teléfono" valor={s.telefono} />
          <Fila etiqueta="Instagram" valor={s.instagram} enlace />
          <Fila etiqueta="Facebook" valor={s.facebook} enlace />
        </View>
      ) : null}

      {imagenes.length > 0 ? <Text style={styles.titulo}>Nuestras instalaciones</Text> : null}
      {imagenes.map((f) => (
        <View key={String(f.id)} style={styles.foto}>
          <Image source={{ uri: f.uri }} style={styles.img} resizeMode="cover" />
          {f.pie ? <Text style={styles.pie}>{f.pie}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colores.tarjeta, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: colores.borde, marginBottom: 16 },
  nombre: { fontSize: 28, fontWeight: 'bold', color: colores.texto, marginBottom: 10 },
  fila: { color: colores.texto, marginBottom: 6, fontSize: 15 },
  etiqueta: { fontWeight: 'bold' },
  link: { color: '#0d6efd', textDecorationLine: 'underline' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: colores.texto, marginBottom: 10 },
  foto: { backgroundColor: colores.tarjeta, borderRadius: 10, borderWidth: 1, borderColor: colores.borde, marginBottom: 14, overflow: 'hidden' },
  img: { width: '100%', height: 200 },
  pie: { padding: 12, color: colores.texto },
  error: { color: '#c62828', marginBottom: 10 },
});