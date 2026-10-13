import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { apiGet, apiPost } from '../../api';
import { Boton, Fila, Gris, Nombre, Pantalla, Segmentos, Tarjeta, hora } from '../../components/ui';
import { colores } from '../../theme';

export default function Asistencia() {
  const [modo, setModo] = useState('pasar');
  return (
    <View style={{ flex: 1 }}>
      <Segmentos
        opciones={[{ clave: 'pasar', titulo: 'Pasar asistencia' }, { clave: 'historial', titulo: 'Historial' }]}
        valor={modo}
        onCambio={setModo}
      />
      {modo === 'pasar' ? <Pasar /> : <Historial />}
    </View>
  );
}

function Historial() {
  return (
    <Pantalla
      ruta="/api/asistencia/"
      vacio="Sin registros de asistencia todavía"
      renderItem={(a) => (
        <Tarjeta>
          <View style={st.fila}>
            <View style={{ flex: 1 }}>
              <Nombre>{a.jugador_nombre}</Nombre>
              <Gris>{a.entrenamiento_texto}</Gris>
            </View>
            <Text style={{ fontSize: 22 }}>{a.presente ? '✅' : '❌'}</Text>
          </View>
        </Tarjeta>
      )}
    />
  );
}

function Pasar() {
  const [seleccionado, setSeleccionado] = useState(null);

  if (!seleccionado) {
    return (
      <Pantalla
        ruta="/api/entrenamientos/"
        vacio="No tienes entrenamientos registrados"
        encabezado={() => <Gris>Elige el entrenamiento para pasar lista:</Gris>}
        renderItem={(e) => (
          <TouchableOpacity onPress={() => setSeleccionado(e)}>
            <Tarjeta>
              <Nombre>{e.categoria_nombre}</Nombre>
              <Fila etiqueta="Fecha" valor={e.fecha} />
              <Fila etiqueta="Horario" valor={`${hora(e.hora_inicio)} a ${hora(e.hora_fin)}`} />
              <Fila etiqueta="Lugar" valor={e.lugar} />
              <Text style={{ color: colores.verde, fontWeight: 'bold', marginTop: 6 }}>Toca para pasar asistencia →</Text>
            </Tarjeta>
          </TouchableOpacity>
        )}
      />
    );
  }
  return <Planilla entrenamiento={seleccionado} onVolver={() => setSeleccionado(null)} />;
}

function Planilla({ entrenamiento, onVolver }) {
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet(`/api/app/planilla/${entrenamiento.id}/`);
        setJugadores(data.jugadores);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    })();
  }, [entrenamiento.id]);

  const cambiar = (id, valor) =>
    setJugadores((lista) => lista.map((j) => (j.id === id ? { ...j, presente: valor } : j)));

  const guardar = async () => {
    setGuardando(true);
    setError('');
    try {
      await apiPost(`/api/app/planilla/${entrenamiento.id}/`, {
        presentes: jugadores.filter((j) => j.presente).map((j) => j.id),
      });
      Alert.alert('Listo', 'Asistencia guardada correctamente.');
      onVolver();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <ActivityIndicator size="large" color={colores.verde} style={{ marginTop: 40 }} />;
  const presentes = jugadores.filter((j) => j.presente).length;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={jugadores}
        keyExtractor={(j) => String(j.id)}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            <TouchableOpacity onPress={onVolver}><Text style={st.volver}>← Volver</Text></TouchableOpacity>
            <Nombre>{entrenamiento.categoria_nombre}</Nombre>
            <Gris>{entrenamiento.fecha} · {hora(entrenamiento.hora_inicio)} a {hora(entrenamiento.hora_fin)}</Gris>
            <Text style={st.contador}>{presentes} de {jugadores.length} presentes</Text>
          </View>
        }
        ListEmptyComponent={<Gris>No hay jugadores en esta categoría</Gris>}
        renderItem={({ item: j }) => (
          <Tarjeta>
            <View style={st.fila}>
              <Text style={st.jugador}>{j.nombre}</Text>
              <Switch
                value={j.presente}
                onValueChange={(v) => cambiar(j.id, v)}
                trackColor={{ true: colores.verde }}
              />
            </View>
          </Tarjeta>
        )}
      />
      <View style={{ padding: 16, backgroundColor: colores.tarjeta, borderTopWidth: 1, borderTopColor: colores.borde }}>
        {error ? <Text style={{ color: '#c62828' }}>{error}</Text> : null}
        <Boton texto="Guardar asistencia" onPress={guardar} cargando={guardando} deshabilitado={guardando} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  jugador: { flex: 1, fontSize: 16, color: colores.texto },
  volver: { color: colores.verde, fontWeight: 'bold', marginBottom: 8 },
  contador: { color: colores.verdeOscuro, fontWeight: 'bold', marginTop: 6 },
});