import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PagosScreen from './PagosScreen';
import AsistenciaScreen from './AsistenciaScreen';
import EntrenamientosScreen from './EntrenamientosScreen';
import NotificacionesScreen from './NotificacionesScreen';
import EscuelaScreen from './EscuelaScreen';
import { colores } from '../theme';

const TABS = [
  { id: 'pagos', label: 'Estado de cuenta', Comp: PagosScreen },
  { id: 'asistencia', label: 'Asistencia de mi hijo', Comp: AsistenciaScreen },
  { id: 'entrenos', label: 'Entrenamientos y torneos', Comp: EntrenamientosScreen },
  { id: 'avisos', label: 'Notificaciones', Comp: NotificacionesScreen },
  { id: 'escuela', label: 'La escuela', Comp: EscuelaScreen },
];

export default function PadreHome({ user, onLogout }) {
  const [tab, setTab] = useState('pagos');
  const Actual = TABS.find((t) => t.id === tab).Comp;

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hola}>{user.first_name || user.username}</Text>
          <Text style={styles.rol}>Padre de familia</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.salirBtn}>
          <Text style={styles.salir}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {TABS.map((t) => (
            <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={[styles.tab, tab === t.id && styles.tabActiva]}>
              <Text style={[styles.tabTxt, tab === t.id && styles.tabTxtActiva]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{ flex: 1 }}><Actual key={tab} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#04100a', borderBottomWidth: 1, borderBottomColor: colores.borde, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hola: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  rol: { color: '#cfebdd' },
  salirBtn: { borderWidth: 1, borderColor: '#fff', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  salir: { color: '#fff', fontSize: 12 },
  tabsWrap: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colores.borde, backgroundColor: '#04100a' },
  tab: { borderWidth: 1, borderColor: colores.verde, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  tabActiva: { backgroundColor: colores.verde },
  tabTxt: { color: colores.verde },
  tabTxtActiva: { color: '#fff', fontWeight: 'bold' },
});