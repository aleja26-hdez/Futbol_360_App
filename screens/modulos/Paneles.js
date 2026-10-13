import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCarga } from '../../hooks';
import { Fila, Gris, Nombre, Subtitulo, Tarjeta } from '../../components/ui';
import { colores } from '../../theme';

export function PanelEntrenador() {
  const escuela = useCarga('/api/app/escuela/');
  const categorias = useCarga('/api/categorias/');

  if (escuela.cargando || categorias.cargando) {
    return <ActivityIndicator size="large" color={colores.verde} style={{ marginTop: 40 }} />;
  }
  const e = escuela.datos;
  const lista = Array.isArray(categorias.datos) ? categorias.datos : [];
  const error = escuela.error || categorias.error;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {error ? <Text style={{ color: '#c62828', marginBottom: 10 }}>{error}</Text> : null}
      {e ? (
        <Tarjeta>
          <Nombre>🏫 {e.nombre}</Nombre>
          <Fila etiqueta="Dirección" valor={[e.direccion, e.ciudad].filter(Boolean).join(', ')} />
          <Fila etiqueta="Teléfono" valor={e.telefono} />
        </Tarjeta>
      ) : null}

      <Subtitulo>Mis categorías</Subtitulo>
      {lista.length === 0 ? (
        <Gris>No tienes categorías asignadas todavía</Gris>
      ) : (
        lista.map((c) => (
          <Tarjeta key={c.id}>
            <Nombre>{c.nombre}</Nombre>
            <Gris>{c.edad_minima} a {c.edad_maxima} años</Gris>
          </Tarjeta>
        ))
      )}
    </ScrollView>
  );
}

export function DashboardDirectivo() {
  const { datos, cargando, error, refrescando, refrescar } = useCarga('/api/app/dashboard/');
  if (cargando) return <ActivityIndicator size="large" color={colores.verde} style={{ marginTop: 40 }} />;

  const d = datos || {};
  const items = [
    { n: d.total_jugadores, t: 'Jugadores activos', c: colores.verde },
    { n: d.pendientes, t: 'Pagos pendientes', c: '#c62828' },
    { n: d.abonados, t: 'Pagos abonados', c: '#b26a00' },
    { n: d.cancelados, t: 'Pagos cancelados', c: '#1b7a43' },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}
    >
      <Subtitulo>Panel de indicadores</Subtitulo>
      {error ? <Text style={{ color: '#c62828', marginBottom: 10 }}>{error}</Text> : null}
      <View style={st.grilla}>
        {items.map((i) => (
          <View key={i.t} style={[st.cuadro, { borderColor: i.c }]}>
            <Text style={[st.numero, { color: i.c }]}>{i.n ?? 0}</Text>
            <Text style={st.texto}>{i.t}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  grilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cuadro: { width: '48%', backgroundColor: colores.tarjeta, borderWidth: 2, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  numero: { fontSize: 32, fontWeight: 'bold' },
  texto: { color: colores.gris, textAlign: 'center', marginTop: 4 },
});