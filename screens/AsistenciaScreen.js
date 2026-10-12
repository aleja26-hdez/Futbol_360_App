import { StyleSheet, Text, View } from 'react-native';
import ListaBase from './ListaBase';
import { colores } from '../theme';

export default function AsistenciaScreen() {
  return (
    <ListaBase
      path="/api/asistencia/"
      vacio="Aún no hay asistencias registradas."
      renderItem={(a) => (
        <View style={styles.fila}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.texto}>{a.entrenamiento_texto}</Text>
            {a.observacion ? <Text style={styles.obs}>{a.observacion}</Text> : null}
          </View>
          <Text style={{ fontSize: 22 }}>{a.presente ? '✅' : '❌'}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colores.borde },
  texto: { color: colores.texto },
  obs: { color: colores.gris, fontSize: 12, marginTop: 2 },
});