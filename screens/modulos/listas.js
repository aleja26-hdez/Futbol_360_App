import { StyleSheet, Text, View } from 'react-native';
import { Boton, ESTADOS_PAGO, Fila, Gris, Insignia, Nombre, Pantalla, Subtitulo, Tarjeta, hora, llamar } from '../../components/ui';
import { colores, formatCOP } from '../../theme';

export function Jugadores() {
  return (
    <Pantalla
      ruta="/api/jugadores/"
      vacio="No hay jugadores todavía"
      renderItem={(j) => (
        <Tarjeta>
          <Nombre>{j.nombre_completo}</Nombre>
          <Fila etiqueta="Edad" valor={`${j.edad} años`} />
          <Fila etiqueta="Categoría" valor={j.categoria_nombre} />
          <Fila etiqueta="Dirección" valor={j.direccion} />
          <Fila etiqueta="Acudiente" valor={j.acudiente_nombre} />
          <Fila etiqueta="Teléfono acudiente" valor={j.telefono_acudiente} />
          {j.telefono_acudiente ? (
            <Boton tipo="secundario" texto="📞 Llamar al acudiente" onPress={() => llamar(j.telefono_acudiente)} />
          ) : null}
        </Tarjeta>
      )}
    />
  );
}

export function Entrenamientos() {
  return (
    <Pantalla
      ruta="/api/entrenamientos/"
      vacio="No hay entrenamientos registrados"
      renderItem={(e) => (
        <Tarjeta>
          <Nombre>{e.categoria_nombre}</Nombre>
          <Fila etiqueta="Fecha" valor={e.fecha} />
          <Fila etiqueta="Horario" valor={`${hora(e.hora_inicio)} a ${hora(e.hora_fin)}`} />
          <Fila etiqueta="Lugar" valor={e.lugar} />
          <Fila etiqueta="Entrenador" valor={e.entrenador_nombre} />
          <Fila etiqueta="Tema" valor={e.tema} />
        </Tarjeta>
      )}
    />
  );
}

export function Categorias() {
  return (
    <Pantalla
      ruta="/api/categorias/"
      vacio="No hay categorías registradas"
      renderItem={(c) => (
        <Tarjeta>
          <Nombre>{c.nombre}</Nombre>
          <Fila etiqueta="Edades" valor={`${c.edad_minima} a ${c.edad_maxima} años`} />
          <Fila etiqueta="Escuela" valor={c.escuela_nombre} />
        </Tarjeta>
      )}
    />
  );
}

export function Entrenadores() {
  return (
    <Pantalla
      ruta="/api/entrenadores/"
      vacio="No hay entrenadores registrados"
      renderItem={(e) => (
        <Tarjeta>
          <Nombre>{e.nombre_completo}</Nombre>
          <Fila etiqueta="Teléfono" valor={e.telefono} />
          <Fila etiqueta="Especialidad" valor={e.especialidad} />
          <Fila etiqueta="Categorías" valor={(e.categorias_nombres || []).join(', ')} />
          {e.telefono ? <Boton tipo="secundario" texto="📞 Llamar" onPress={() => llamar(e.telefono)} /> : null}
        </Tarjeta>
      )}
    />
  );
}

export function PagosDirectivo() {
  return (
    <Pantalla
      ruta="/api/pagos/estados/"
      vacio="No hay pagos registrados todavía"
      renderItem={(p) => {
        const e = ESTADOS_PAGO[p.estado] || ESTADOS_PAGO.pendiente;
        return (
          <Tarjeta>
            <View style={st.encabezado}>
              <View style={{ flex: 1 }}>
                <Nombre>{p.jugador_nombre}</Nombre>
                <Gris>{p.mes}</Gris>
              </View>
              <Insignia texto={e.texto} color={e.color} fondo={e.fondo} />
            </View>
            <Fila etiqueta="Total" valor={formatCOP(p.valor_total)} />
            <Fila etiqueta="Abonado" valor={formatCOP(p.valor_abonado)} />
            <Fila etiqueta="Saldo" valor={formatCOP(p.saldo_pendiente)} />
          </Tarjeta>
        );
      }}
    />
  );
}

export function Torneos() {
  return (
    <Pantalla
      ruta="/api/torneos/torneos/"
      vacio="No hay torneos registrados todavía"
      renderItem={(t) => (
        <Tarjeta>
          <Nombre>{t.nombre}</Nombre>
          <Fila etiqueta="Categoría" valor={t.categoria_nombre} />
          <Fila etiqueta="Fechas" valor={`${t.fecha_inicio} a ${t.fecha_fin}`} />
          <Subtitulo>Partidos</Subtitulo>
          {(t.partidos || []).length === 0 ? (
            <Gris>Sin partidos registrados</Gris>
          ) : (
            t.partidos.map((p) => (
              <View key={p.id} style={st.partido}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colores.texto, fontWeight: '600' }}>vs {p.rival}</Text>
                  <Gris>{p.fecha} · {hora(p.hora)}</Gris>
                </View>
                <Text style={st.marcador}>{p.goles_favor} - {p.goles_contra}</Text>
              </View>
            ))
          )}
        </Tarjeta>
      )}
    />
  );
}

export function UsuariosLista() {
  return (
    <Pantalla
      ruta="/api/usuarios/"
      vacio="No hay usuarios registrados"
      renderItem={(u) => (
        <Tarjeta>
          <View style={st.encabezado}>
            <View style={{ flex: 1 }}>
              <Nombre>{`${u.first_name} ${u.last_name}`.trim() || u.username}</Nombre>
              <Gris>@{u.username}</Gris>
            </View>
            <Insignia texto={u.rol_display} color={colores.verde} fondo="#e6f4ea" />
          </View>
          <Fila etiqueta="Email" valor={u.email} />
          <Fila etiqueta="Escuela" valor={u.escuela_nombre} />
          <Fila etiqueta="Activo" valor={u.is_active ? 'Sí' : 'No'} />
        </Tarjeta>
      )}
    />
  );
}

const st = StyleSheet.create({
  encabezado: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  partido: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: colores.borde },
  marcador: { fontWeight: 'bold', fontSize: 18, color: colores.verdeOscuro },
});