import { ActivityIndicator, Image, ScrollView, StyleSheet, Text } from 'react-native';
import { useCarga } from '../../hooks';
import { Boton, Fila, Gris, Nombre, Pantalla, Subtitulo, Tarjeta, abrir } from '../../components/ui';
import { colores } from '../../theme';

function InfoEscuela({ e }) {
  return (
    <Tarjeta>
      {e.logo ? <Image source={{ uri: e.logo }} style={st.logo} resizeMode="contain" /> : null}
      <Nombre>{e.nombre}</Nombre>
      <Fila etiqueta="Ubicación" valor={[e.direccion, e.ciudad].filter(Boolean).join(', ')} />
      <Fila etiqueta="Edades" valor={`${e.edad_minima} a ${e.edad_maxima} años`} />
      <Fila etiqueta="Teléfono" valor={e.telefono} />
      <Fila etiqueta="Registrada" valor={e.fecha_registro} />
      {e.instagram ? <Boton tipo="secundario" texto="Ver Instagram" onPress={() => abrir(e.instagram)} /> : null}
      {e.facebook ? <Boton tipo="secundario" texto="Ver Facebook" onPress={() => abrir(e.facebook)} /> : null}

      <Subtitulo>Nuestras instalaciones</Subtitulo>
      {(e.fotos || []).length === 0 ? (
        <Gris>Aún no hay fotos de las instalaciones.</Gris>
      ) : (
        e.fotos.map((f) => (
          <ScrollView key={f.id} scrollEnabled={false}>
            <Image source={{ uri: f.imagen }} style={st.foto} />
            {f.descripcion ? <Text style={st.pie}>{f.descripcion}</Text> : null}
          </ScrollView>
        ))
      )}
    </Tarjeta>
  );
}

// Para entrenador: la escuela a la que pertenece
export function EscuelaInfo() {
  const { datos, cargando, error } = useCarga('/api/app/escuela/');
  if (cargando) return <ActivityIndicator size="large" color={colores.verde} style={{ marginTop: 40 }} />;
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {error ? <Text style={{ color: '#c62828', marginBottom: 10 }}>{error}</Text> : null}
      {datos ? <InfoEscuela e={datos} /> : <Gris>No hay información de la escuela registrada todavía.</Gris>}
    </ScrollView>
  );
}

// Para directivo: todas las escuelas
export function Escuelas() {
  return (
    <Pantalla
      ruta="/api/app/escuelas/"
      vacio="No hay escuelas registradas todavía"
      renderItem={(e) => <InfoEscuela e={e} />}
    />
  );
}

const st = StyleSheet.create({
  logo: { width: '100%', height: 90, marginBottom: 8 },
  foto: { width: '100%', height: 190, borderRadius: 10, marginTop: 8 },
  pie: { color: colores.gris, marginTop: 4 },
});