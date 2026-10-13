import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { apiGet } from '../api';
import { colores, formatCOP } from '../theme';

const ESTADOS = {
  pendiente: { texto: 'Pendiente', color: '#c62828', fondo: '#fdecea' },
  abonado: { texto: 'Abonado', color: '#b26a00', fondo: '#fff4e0' },
  cancelado: { texto: 'Cancelado (pago total)', color: '#1b7a43', fondo: '#e6f4ea' },
};

export default function PagosScreen() {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      setError('');
      const data = await apiGet('/api/pagos/estados/');
      setPagos(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (cargando) return <ActivityIndicator size="large" style={{ marginTop: 40 }} color={colores.verde} />;

  const cuenta = (estado) => pagos.filter((p) => p.estado === estado).length;
  const deuda = pagos.reduce((suma, p) => suma + Number(p.saldo_pendiente || 0), 0);

  const Resumen = () => (
    <View style={styles.resumen}>
      <View style={styles.resumenItem}><Text style={[styles.resumenNum, { color: '#c62828' }]}>{cuenta('pendiente')}</Text><Text style={styles.resumenTxt}>Pendientes</Text></View>
      <View style={styles.resumenItem}><Text style={[styles.resumenNum, { color: '#b26a00' }]}>{cuenta('abonado')}</Text><Text style={styles.resumenTxt}>Abonados</Text></View>
      <View style={styles.resumenItem}><Text style={[styles.resumenNum, { color: '#1b7a43' }]}>{cuenta('cancelado')}</Text><Text style={styles.resumenTxt}>Cancelados</Text></View>
      <View style={styles.resumenItem}><Text style={styles.resumenNum}>{formatCOP(deuda)}</Text><Text style={styles.resumenTxt}>Por pagar</Text></View>
    </View>
  );

  return (
    <FlatList
      data={pagos}
      keyExtractor={(p) => String(p.id)}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
      ListHeaderComponent={
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Resumen />
        </>
      }
      ListEmptyComponent={!error && <Text style={styles.vacio}>No tienes pagos registrados todavía.</Text>}
      renderItem={({ item: p }) => {
        const e = ESTADOS[p.estado] || ESTADOS.pendiente;
        const abonos = p.abonos || [];
        return (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>{p.jugador_nombre || 'Jugador'}</Text>
                <Text style={styles.mes}>{p.mes}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: e.fondo }]}>
                <Text style={[styles.badgeTxt, { color: e.color }]}>{e.texto}</Text>
              </View>
            </View>

            <Text style={styles.linea}>Valor del mes: {formatCOP(p.valor_total)}</Text>
            <Text style={styles.linea}>Abonado: {formatCOP(p.valor_abonado)}</Text>
            {p.estado === 'cancelado' ? (
              <Text style={[styles.saldo, { color: '#1b7a43' }]}>Sin saldo pendiente</Text>
            ) : (
              <Text style={[styles.saldo, { color: e.color }]}>
                {p.estado === 'abonado' ? 'Te falta pagar ' : 'Debes '}{formatCOP(p.saldo_pendiente)}
              </Text>
            )}

            <Text style={styles.sub}>Historial de abonos</Text>
            {abonos.length === 0 ? (
              <Text style={styles.vacioChico}>Aún no hay abonos registrados</Text>
            ) : (
              abonos.map((a) => (
                <View key={a.id} style={styles.abono}>
                  <Text style={styles.abonoFecha}>{a.fecha}</Text>
                  <Text style={styles.abonoMetodo}>{a.metodo || '-'}</Text>
                  <Text style={styles.abonoValor}>{formatCOP(a.valor)}</Text>
                </View>
              ))
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  resumen: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colores.tarjeta, borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colores.borde },
  resumenItem: { alignItems: 'center', flex: 1 },
  resumenNum: { fontSize: 16, fontWeight: 'bold', color: colores.texto },
  resumenTxt: { fontSize: 11, color: colores.gris, marginTop: 2 },
  card: { backgroundColor: colores.tarjeta, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colores.borde },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  nombre: { fontWeight: 'bold', fontSize: 16, color: colores.texto },
  mes: { color: colores.gris },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTxt: { fontWeight: 'bold', fontSize: 12 },
  linea: { color: colores.texto, marginBottom: 2 },
  saldo: { fontWeight: 'bold', fontSize: 15, marginTop: 4, marginBottom: 8 },
  sub: { fontWeight: 'bold', color: colores.verdeOscuro, marginTop: 4, marginBottom: 6 },
  abono: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderTopWidth: 1, borderTopColor: colores.borde },
  abonoFecha: { flex: 1, color: colores.gris },
  abonoMetodo: { flex: 1, color: colores.gris },
  abonoValor: { fontWeight: 'bold', color: colores.texto },
  vacio: { textAlign: 'center', color: colores.gris, marginTop: 30 },
  vacioChico: { color: colores.gris },
  error: { color: '#c62828', marginBottom: 10 },
});