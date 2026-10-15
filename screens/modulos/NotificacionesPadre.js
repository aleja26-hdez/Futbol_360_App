import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiGet, apiPost } from '../../api';
import { Boton, Gris, Insignia, Nombre, Tarjeta, fechaHora } from '../../components/ui';
import { colores } from '../../theme';

export default function NotificacionesPadre() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      setError('');
      const data = await apiGet('/api/notificaciones/');
      setLista(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const marcar = async (n) => {
    if (n.leida) return;
    setLista((l) => l.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
    try {
      await apiPost(`/api/app/notificaciones/${n.id}/leer/`, {});
    } catch (e) {
      setLista((l) => l.map((x) => (x.id === n.id ? { ...x, leida: false } : x)));
      setError(e.message);
    }
  };

  const marcarTodas = async () => {
    try {
      await apiPost('/api/app/notificaciones/leer-todas/', {});
      setLista((l) => l.map((x) => ({ ...x, leida: true })));
    } catch (e) {
      setError(e.message);
    }
  };

  if (cargando) return <ActivityIndicator size="large" color={colores.verde} style={{ marginTop: 40 }} />;
  const sinLeer = lista.filter((n) => !n.leida).length;

  return (
    <FlatList
      data={lista}
      keyExtractor={(n) => String(n.id)}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
      ListHeaderComponent={
        <>
          {error ? <Text style={st.error}>{error}</Text> : null}
          {sinLeer > 0 ? (
            <Boton tipo="secundario" texto={`Marcar todas como leídas (${sinLeer})`} onPress={marcarTodas} />
          ) : null}
        </>
      }
      ListEmptyComponent={!error ? <Text style={st.vacio}>No tienes notificaciones todavía</Text> : null}
      renderItem={({ item: n }) => (
        <TouchableOpacity onPress={() => marcar(n)} activeOpacity={0.8}>
          <View style={[st.tarjeta, !n.leida && st.nueva]}>
            <View style={st.fila}>
              <View style={{ flex: 1 }}>
                <Nombre>{n.titulo}</Nombre>
                <Gris>{fechaHora(n.fecha_envio)}</Gris>
              </View>
              {!n.leida ? <Insignia texto="Nueva" color="#fff" fondo={colores.verde} /> : null}
            </View>
            <Text style={st.mensaje}>{n.mensaje}</Text>
            {!n.leida ? <Text style={st.ayuda}>Toca para marcar como leída</Text> : null}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const st = StyleSheet.create({
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: colores.borde },
  nueva: { borderColor: colores.verde, borderWidth: 2 },
  fila: { flexDirection: 'row', alignItems: 'center' },
  mensaje: { color: colores.texto, marginTop: 8 },
  ayuda: { color: colores.gris, fontSize: 12, marginTop: 6 },
  vacio: { textAlign: 'center', color: colores.gris, marginTop: 30 },
  error: { color: '#c62828', marginBottom: 10 },
});