import { ActivityIndicator, FlatList, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colores } from '../theme';
import { useCarga } from '../hooks';

export const ESTADOS_PAGO = {
  pendiente: { texto: 'Pendiente', color: '#c62828', fondo: '#fdecea' },
  abonado: { texto: 'Abonado', color: '#b26a00', fondo: '#fff4e0' },
  cancelado: { texto: 'Cancelado (pago total)', color: '#1b7a43', fondo: '#e6f4ea' },
};

export const hora = (t) => (t ? String(t).slice(0, 5) : '');
export const llamar = (tel) => { if (tel) Linking.openURL(`tel:${tel}`); };
export const abrir = (url) => { if (url) Linking.openURL(url); };

export function fechaHora(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export const Tarjeta = ({ children }) => <View style={s.tarjeta}>{children}</View>;
export const Nombre = ({ children }) => <Text style={s.nombre}>{children}</Text>;
export const Subtitulo = ({ children }) => <Text style={s.subtitulo}>{children}</Text>;
export const Gris = ({ children }) => <Text style={s.gris}>{children}</Text>;

export function Fila({ etiqueta, valor }) {
  if (valor === undefined || valor === null || valor === '') return null;
  return (
    <View style={s.fila}>
      <Text style={s.etiqueta}>{etiqueta}</Text>
      <Text style={s.valor}>{String(valor)}</Text>
    </View>
  );
}

export function Insignia({ texto, color, fondo }) {
  return (
    <View style={[s.insignia, { backgroundColor: fondo }]}>
      <Text style={[s.insigniaTxt, { color }]}>{texto}</Text>
    </View>
  );
}

export function Boton({ texto, onPress, tipo = 'primario', deshabilitado, cargando }) {
  const primario = tipo === 'primario';
  return (
    <TouchableOpacity
      style={[s.boton, primario ? s.botonPrim : s.botonSec, deshabilitado && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={deshabilitado}
    >
      {cargando
        ? <ActivityIndicator color={primario ? '#fff' : colores.verde} />
        : <Text style={[s.botonTxt, { color: primario ? '#fff' : colores.verde }]}>{texto}</Text>}
    </TouchableOpacity>
  );
}

export function Segmentos({ opciones, valor, onCambio }) {
  return (
    <View style={s.segmentos}>
      {opciones.map((o) => (
        <TouchableOpacity
          key={o.clave}
          style={[s.segmento, valor === o.clave && s.segmentoActivo]}
          onPress={() => onCambio(o.clave)}
        >
          <Text style={[s.segmentoTxt, valor === o.clave && { color: '#fff' }]}>{o.titulo}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function Pantalla({ ruta, renderItem, vacio = 'No hay registros todavía.', encabezado }) {
  const { datos, cargando, refrescando, error, refrescar } = useCarga(ruta);
  if (cargando) return <ActivityIndicator size="large" color={colores.verde} style={{ marginTop: 40 }} />;
  return (
    <FlatList
      data={Array.isArray(datos) ? datos : []}
      keyExtractor={(item, i) => String(item.id ?? i)}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}
      ListHeaderComponent={
        <>
          {error ? <Text style={s.error}>{error}</Text> : null}
          {encabezado ? encabezado(datos) : null}
        </>
      }
      ListEmptyComponent={!error ? <Text style={s.vacio}>{vacio}</Text> : null}
      renderItem={({ item }) => renderItem(item)}
    />
  );
}

const s = StyleSheet.create({
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colores.borde },
  nombre: { fontWeight: 'bold', fontSize: 16, color: colores.texto, marginBottom: 4 },
  subtitulo: { fontWeight: 'bold', fontSize: 15, color: colores.verdeOscuro, marginVertical: 8 },
  gris: { color: colores.gris },
  fila: { flexDirection: 'row', marginBottom: 3 },
  etiqueta: { color: colores.gris, width: 125 },
  valor: { flex: 1, color: colores.texto },
  insignia: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  insigniaTxt: { fontWeight: 'bold', fontSize: 12 },
  boton: { borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8 },
  botonPrim: { backgroundColor: colores.verde },
  botonSec: { borderWidth: 1, borderColor: colores.verde },
  botonTxt: { fontWeight: 'bold', fontSize: 15 },
  segmentos: { flexDirection: 'row', margin: 12, borderRadius: 10, borderWidth: 1, borderColor: colores.verde, overflow: 'hidden' },
  segmento: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: colores.tarjeta },
  segmentoActivo: { backgroundColor: colores.verde },
  segmentoTxt: { fontWeight: 'bold', color: colores.verde },
  vacio: { textAlign: 'center', color: colores.gris, marginTop: 30 },
  error: { color: '#c62828', marginBottom: 10 },
});