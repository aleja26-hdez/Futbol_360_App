import { StyleSheet, Text, View } from 'react-native';
import ListaBase from './ListaBase';
import { colores, formatFecha } from '../theme';

export default function NotificacionesScreen() {
  return (
    <ListaBase
      path="/api/notificaciones/"
      vacio="No tienes notificaciones."
      renderItem={(n) => (
        <View style={[styles.card, !n.leida && styles.nueva]}>
          <Text style={styles.titulo}>{n.titulo}</Text>
          <Text style={styles.msg}>{n.mensaje}</Text>
          <Text style={styles.fecha}>{formatFecha(n.fecha_envio)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colores.tarjeta, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colores.borde },
  nueva: { borderLeftWidth: 4, borderLeftColor: colores.verde },
  titulo: { fontWeight: 'bold', color: colores.texto },
  msg: { color: colores.texto, marginTop: 4 },
  fecha: { color: colores.gris, fontSize: 12, marginTop: 6 },
});