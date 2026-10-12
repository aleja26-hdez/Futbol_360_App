import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { apiGet } from '../api';
import { colores, formatFecha, hhmm } from '../theme';

const lista = (d) => (Array.isArray(d) ? d : d.results || []);

function Fila({ etiqueta, valor }) {
  if (!valor) return null;
  return (
    <Text style={styles.fila}>
      <Text style={styles.etiqueta}>{etiqueta}: </Text>{valor}
    </Text>
  );
}

export default function EntrenamientosScreen() {
  const [entrenos, setEntrenos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      setError('');
      const [e, t] = await Promise.all([apiGet('/api/entrenamientos/'), apiGet('/api/torneos/')]);
      setEntrenos(lista(e));
      setTorneos(lista(t));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (cargando) return <ActivityIndicator size="large" style={{ marginTop: 40 }} color={colores.verde} />;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.titulo}>Entrenamientos de mi hijo</Text>
      {entrenos.length === 0 && !error ? <Text style={styles.vacio}>No hay entrenamientos programados.</Text> : null}
      {entrenos.map((e) => (
        <View key={e.id} style={styles.card}>
          <Fila etiqueta="Categoría" valor={e.categoria_nombre} />
          <Fila etiqueta="Fecha" valor={formatFecha(e.fecha)} />
          <Fila etiqueta="Hora" valor={`${hhmm(e.hora_inicio)} a ${hhmm(e.hora_fin)}`} />
          <Fila etiqueta="Lugar" valor={e.lugar} />
          <Fila etiqueta="Tema" valor={e.tema} />
          <Fila etiqueta="Entrenador" valor={e.entrenador_nombre} />
          <Fila etiqueta="Contacto" valor={e.entrenador_contacto} />
        </View>
      ))}

      <Text style={[styles.titulo, { marginTop: 20 }]}>Torneos y partidos</Text>
      {torneos.length === 0 && !error ? <Text style={styles.vacio}>No hay torneos registrados para la categoría de tu hijo.</Text> : null}
      {torneos.map((t) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.torneo}>{t.nombre}</Text>
          <Text style={styles.fila}>{formatFecha(t.fecha_inicio)} → {formatFecha(t.fecha_fin)}</Text>
          {(t.partidos || []).map((p) => (
            <View key={p.id} style={styles.partido}>
              <Text style={styles.etiqueta}>vs {p.rival}</Text>
              <Text style={styles.fila}>{formatFecha(p.fecha)} · {hhmm(p.hora)}{p.lugar ? ` · ${p.lugar}` : ''}</Text>
              <Text style={styles.marcador}>Marcador: {p.goles_favor} - {p.goles_contra}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: 'bold', color: colores.texto, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colores.borde },
  fila: { color: colores.texto, marginBottom: 3, fontSize: 15 },
  etiqueta: { fontWeight: 'bold', color: colores.texto },
  torneo: { fontSize: 17, fontWeight: 'bold', color: colores.verdeOscuro, marginBottom: 4 },
  partido: { borderTopWidth: 1, borderTopColor: colores.borde, marginTop: 8, paddingTop: 8 },
  marcador: { color: colores.gris },
  vacio: { color: colores.gris },
  error: { color: '#c62828', marginBottom: 10 },
});