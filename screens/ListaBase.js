import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { apiGet } from '../api';
import { colores } from '../theme';

export default function ListaBase({ path, renderItem, vacio }) {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      setError('');
      const data = await apiGet(path);
      setDatos(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [path]);

  useEffect(() => { cargar(); }, [cargar]);

  if (cargando) return <ActivityIndicator size="large" style={{ marginTop: 40 }} color={colores.verde} />;

  return (
    <FlatList
      data={datos}
      keyExtractor={(i) => String(i.id)}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
      ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
      ListEmptyComponent={!error && <Text style={styles.vacio}>{vacio}</Text>}
      renderItem={({ item }) => renderItem(item)}
    />
  );
}

const styles = StyleSheet.create({
  error: { color: '#c62828', marginBottom: 10 },
  vacio: { textAlign: 'center', color: colores.gris, marginTop: 30 },
});