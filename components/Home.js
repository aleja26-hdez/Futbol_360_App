import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colores } from '../theme';

export default function Home({ user, rolTexto, secciones, onLogout }) {
  const [actual, setActual] = useState(secciones[0].clave);
  const Seccion = secciones.find((x) => x.clave === actual).componente;

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <View style={s.header}>
        <View>
          <Text style={s.hola}>Hola, {user.first_name || user.username}</Text>
          <Text style={s.rol}>{rolTexto}</Text>
        </View>
        <TouchableOpacity onPress={onLogout}><Text style={s.salir}>Salir</Text></TouchableOpacity>
      </View>

      <View style={s.barra}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {secciones.map((x) => (
            <TouchableOpacity
              key={x.clave}
              onPress={() => setActual(x.clave)}
              style={[s.pestana, actual === x.clave && s.pestanaActiva]}
            >
              <Text style={[s.pestanaTxt, actual === x.clave && s.pestanaTxtActiva]}>{x.titulo}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{ flex: 1 }}>
        <Seccion key={actual} user={user} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: colores.verde, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hola: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  rol: { color: '#cfebdd' },
  salir: { color: '#fff', fontWeight: 'bold' },
  barra: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colores.borde },
  pestana: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  pestanaActiva: { borderBottomColor: colores.verde },
  pestanaTxt: { color: colores.gris, fontWeight: '600' },
  pestanaTxtActiva: { color: colores.verde },
});