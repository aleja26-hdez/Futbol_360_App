import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiPost } from '../../api';
import { useCarga } from '../../hooks';
import { Boton, Fila, Gris, Nombre, Pantalla, Segmentos, Subtitulo, Tarjeta, fechaHora } from '../../components/ui';
import { colores } from '../../theme';

export default function Notificaciones() {
  const [modo, setModo] = useState('enviadas');
  return (
    <View style={{ flex: 1 }}>
      <Segmentos
        opciones={[{ clave: 'enviadas', titulo: 'Enviadas' }, { clave: 'enviar', titulo: 'Enviar nueva' }]}
        valor={modo}
        onCambio={setModo}
      />
      {modo === 'enviadas' ? <Enviadas /> : <Enviar onEnviada={() => setModo('enviadas')} />}
    </View>
  );
}

function Enviadas() {
  return (
    <Pantalla
      ruta="/api/app/notificaciones/enviadas/"
      vacio="No se han enviado notificaciones todavía"
      renderItem={(n) => (
        <Tarjeta>
          <View style={st.fila}>
            <View style={{ flex: 1 }}>
              <Nombre>{n.titulo}</Nombre>
              <Gris>Para: {n.destinatario_nombre}</Gris>
            </View>
            <Text style={{ fontSize: 18 }}>{n.leida ? '✅' : '❌'}</Text>
          </View>
          <Text style={{ color: colores.texto, marginTop: 6 }}>{n.mensaje}</Text>
          <Fila etiqueta="Fecha" valor={fechaHora(n.fecha_envio)} />
        </Tarjeta>
      )}
    />
  );
}

function Enviar({ onEnviada }) {
  const { datos, cargando, error } = useCarga('/api/app/notificaciones/destinatarios/');
  const [destino, setDestino] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState('');

  const enviar = async () => {
    if (!destino || !titulo.trim() || !mensaje.trim()) {
      setAviso('Elige un destinatario y completa el título y el mensaje');
      return;
    }
    setEnviando(true);
    setAviso('');
    try {
      await apiPost('/api/app/notificaciones/enviar/', {
        destinatario: destino,
        titulo: titulo.trim(),
        mensaje: mensaje.trim(),
      });
      Alert.alert('Listo', 'Notificación enviada correctamente.');
      onEnviada();
    } catch (e) {
      setAviso(e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <ActivityIndicator size="large" color={colores.verde} style={{ marginTop: 40 }} />;
  const padres = Array.isArray(datos) ? datos : [];

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      {error ? <Text style={st.error}>{error}</Text> : null}

      <Subtitulo>Enviar a</Subtitulo>
      {padres.length === 0 ? (
        <Gris>No hay padres de familia disponibles para notificar.</Gris>
      ) : (
        padres.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setDestino(p.id)}
            style={[st.opcion, destino === p.id && st.opcionActiva]}
          >
            <Text style={[st.opcionTxt, destino === p.id && { color: '#fff' }]}>{p.nombre}</Text>
          </TouchableOpacity>
        ))
      )}

      <Subtitulo>Título</Subtitulo>
      <TextInput style={st.input} value={titulo} onChangeText={setTitulo} maxLength={100} placeholder="Ej: Cambio de horario" />

      <Subtitulo>Mensaje</Subtitulo>
      <TextInput
        style={[st.input, { height: 110, textAlignVertical: 'top' }]}
        value={mensaje}
        onChangeText={setMensaje}
        multiline
        placeholder="Escribe el mensaje"
      />

      {aviso ? <Text style={st.error}>{aviso}</Text> : null}
      <Boton texto="Enviar notificación" onPress={enviar} cargando={enviando} deshabilitado={enviando} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center' },
  opcion: { borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.tarjeta, borderRadius: 10, padding: 12, marginBottom: 6 },
  opcionActiva: { backgroundColor: colores.verde, borderColor: colores.verde },
  opcionTxt: { color: colores.texto },
  input: { borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.tarjeta, borderRadius: 10, padding: 12, fontSize: 16 },
  error: { color: '#c62828', marginVertical: 8 },
});