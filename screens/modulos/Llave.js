import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiGet, apiPost } from '../../api';
import { Boton, Gris, Nombre, Pantalla, Tarjeta } from '../../components/ui';
import { colores } from '../../theme';

// Medidas del dibujo
const PW = 112, PH = 34, GAP = 22, CH = 58, TOP = 40;
const CW = PW * 2 + 14;
const XQI = 0, XSI = PW + GAP, XC = 2 * (PW + GAP);
const XSD = XC + CW + GAP, XQD = XSD + PW + GAP;
const ANCHO = XQD + PW, ALTO = TOP + 4 * CH + 24;
const yq = (i) => TOP + (i + 0.5) * CH;
const ys = (j) => TOP + (j + 0.5) * 2 * CH;
const yf = TOP + 2 * CH;

const ESTILO = {
  cuartos: { bg: '#9ee7f7', fg: '#06222a' },
  semis: { bg: '#ffc83d', fg: '#2b2100' },
  final: { bg: '#ffffff', fg: '#111111' },
};
const TITULO = { cuartos: 'Cuarto de final', semis: 'Semifinal', final: 'Final' };
const nombreCruce = (c) => (c.ronda === 'final' ? 'Final' : `${TITULO[c.ronda]} ${c.posicion}`);
const txt = (v) => (v === null || v === undefined ? '' : String(v));

function Linea({ x1, y1, x2, y2 }) {
  const estilo = y1 === y2
    ? { left: Math.min(x1, x2), top: y1 - 1, width: Math.abs(x2 - x1), height: 2 }
    : { left: x1 - 1, top: Math.min(y1, y2), width: 2, height: Math.abs(y2 - y1) };
  return <View style={[st.linea, estilo]} />;
}

function Union({ xa, xb, y1, y2 }) {
  const mid = (xa + xb) / 2;
  const ym = (y1 + y2) / 2;
  return (
    <>
      <Linea x1={xa} y1={y1} x2={mid} y2={y1} />
      <Linea x1={xa} y1={y2} x2={mid} y2={y2} />
      <Linea x1={mid} y1={y1} x2={mid} y2={y2} />
      <Linea x1={mid} y1={ym} x2={xb} y2={ym} />
    </>
  );
}

function Pildora({ x, y, c, lado, onPress }) {
  const equipo = lado === 'a' ? c.equipo_a : c.equipo_b;
  const goles = lado === 'a' ? c.goles_a : c.goles_b;
  const pen = lado === 'a' ? c.penales_a : c.penales_b;
  const e = ESTILO[c.ronda];
  const gana = !!c.ganador && c.ganador === equipo;
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress ? () => onPress(c) : undefined}
      style={[st.pil, { left: x, top: y - PH / 2, backgroundColor: e.bg }, gana && st.gana, c.estado === 'empate' && st.empate]}
    >
      <Text numberOfLines={1} style={[st.pilNom, { color: e.fg }, gana && { fontWeight: '800' }]}>{equipo || 'Por definir'}</Text>
      <Text style={[st.pilGol, { color: e.fg }]}>{goles ?? '-'}{pen !== null && pen !== undefined ? ` (${pen})` : ''}</Text>
    </TouchableOpacity>
  );
}

function Editor({ cruce, torneoId, onCerrar, onGuardado }) {
  const cuartos = cruce.ronda === 'cuartos';
  const [f, setF] = useState({
    equipo_a: cruce.equipo_a, equipo_b: cruce.equipo_b,
    goles_a: txt(cruce.goles_a), goles_b: txt(cruce.goles_b),
    penales_a: txt(cruce.penales_a), penales_b: txt(cruce.penales_b),
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  const sinEquipos = !cuartos && (!cruce.equipo_a || !cruce.equipo_b);
  const empate = f.goles_a !== '' && f.goles_b !== '' && Number(f.goles_a) === Number(f.goles_b);

  const guardar = async () => {
    setGuardando(true);
    setError('');
    try {
      const entrada = {
        ronda: cruce.ronda, posicion: cruce.posicion,
        goles_a: f.goles_a, goles_b: f.goles_b,
        penales_a: empate ? f.penales_a : '', penales_b: empate ? f.penales_b : '',
      };
      if (cuartos) { entrada.equipo_a = f.equipo_a; entrada.equipo_b = f.equipo_b; }
      const data = await apiPost(`/api/app/torneos/${torneoId}/llave/`, { cruces: [entrada] });
      onGuardado(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCerrar}>
      <View style={st.fondoModal}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
          <View style={st.caja}>
            <Text style={st.tituloModal}>{nombreCruce(cruce)}</Text>

            {cuartos ? (
              <>
                <Text style={st.etq}>Equipo 1</Text>
                <TextInput style={st.input} value={f.equipo_a} onChangeText={set('equipo_a')} maxLength={100} placeholder="Nombre del equipo" placeholderTextColor={colores.gris} />
                <Text style={st.etq}>Equipo 2</Text>
                <TextInput style={st.input} value={f.equipo_b} onChangeText={set('equipo_b')} maxLength={100} placeholder="Nombre del equipo" placeholderTextColor={colores.gris} />
              </>
            ) : (
              <Text style={st.vs}>{cruce.equipo_a || 'Por definir'}  vs  {cruce.equipo_b || 'Por definir'}</Text>
            )}

            {sinEquipos ? (
              <Text style={st.nota}>Este partido se habilita cuando se conozcan los dos equipos.</Text>
            ) : (
              <>
                <View style={st.fila}>
                  <View style={st.mitad}>
                    <Text style={st.etq} numberOfLines={1}>Goles {f.equipo_a || cruce.equipo_a || 'equipo 1'}</Text>
                    <TextInput style={st.input} value={f.goles_a} onChangeText={set('goles_a')} keyboardType="number-pad" maxLength={2} placeholder="0" placeholderTextColor={colores.gris} />
                  </View>
                  <View style={st.mitad}>
                    <Text style={st.etq} numberOfLines={1}>Goles {f.equipo_b || cruce.equipo_b || 'equipo 2'}</Text>
                    <TextInput style={st.input} value={f.goles_b} onChangeText={set('goles_b')} keyboardType="number-pad" maxLength={2} placeholder="0" placeholderTextColor={colores.gris} />
                  </View>
                </View>

                {empate ? (
                  <>
                    <Text style={st.aviso}>⚠ Empate: estos equipos se enfrentan para definir. Escribe los penales.</Text>
                    <View style={st.fila}>
                      <View style={st.mitad}>
                        <Text style={st.etq}>Penales equipo 1</Text>
                        <TextInput style={st.input} value={f.penales_a} onChangeText={set('penales_a')} keyboardType="number-pad" maxLength={2} placeholder="0" placeholderTextColor={colores.gris} />
                      </View>
                      <View style={st.mitad}>
                        <Text style={st.etq}>Penales equipo 2</Text>
                        <TextInput style={st.input} value={f.penales_b} onChangeText={set('penales_b')} keyboardType="number-pad" maxLength={2} placeholder="0" placeholderTextColor={colores.gris} />
                      </View>
                    </View>
                  </>
                ) : null}
              </>
            )}

            {error ? <Text style={st.error}>{error}</Text> : null}
            {!sinEquipos ? <Boton texto="Guardar" onPress={guardar} cargando={guardando} deshabilitado={guardando} /> : null}
            <Boton tipo="secundario" texto="Cancelar" onPress={onCerrar} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function LlaveTorneo({ torneo, onVolver }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setData(await apiGet(`/api/app/torneos/${torneo.id}/llave/`));
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [torneo.id]);

  const volver = (
    <TouchableOpacity onPress={onVolver}><Text style={st.volver}>← Torneos</Text></TouchableOpacity>
  );

  if (!data) {
    return (
      <View style={{ padding: 16 }}>
        {volver}
        {error ? <Text style={st.error}>{error}</Text> : <ActivityIndicator size="large" color={colores.verde} style={{ marginTop: 30 }} />}
      </View>
    );
  }

  const por = {};
  data.cruces.forEach((c) => { por[`${c.ronda}${c.posicion}`] = c; });
  const q = [por.cuartos1, por.cuartos2, por.cuartos3, por.cuartos4];
  const s = [por.semis1, por.semis2];
  const fin = por.final1;
  const abrir = data.puede_editar ? setEditando : undefined;
  const empates = data.cruces.filter((c) => c.estado === 'empate');

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {volver}
        <Text style={st.titulo}>{data.torneo.nombre}</Text>
        <Gris>{data.torneo.categoria}</Gris>

        <View style={st.panel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={st.lienzo}>
              <Union xa={XQI + PW} xb={XSI} y1={yq(0)} y2={yq(1)} />
              <Union xa={XQI + PW} xb={XSI} y1={yq(2)} y2={yq(3)} />
              <Union xa={XSI + PW} xb={XC} y1={ys(0)} y2={ys(1)} />
              <Union xa={XQD} xb={XSD + PW} y1={yq(0)} y2={yq(1)} />
              <Union xa={XQD} xb={XSD + PW} y1={yq(2)} y2={yq(3)} />
              <Union xa={XSD} xb={XC + CW} y1={ys(0)} y2={ys(1)} />

              {[['Cuartos', XQI, PW], ['Semis', XSI, PW], ['Final', XC, CW], ['Semis', XSD, PW], ['Cuartos', XQD, PW]].map(([t, x, w], i) => (
                <Text key={i} style={[st.titColumna, { left: x, width: w }]}>{t.toUpperCase()}</Text>
              ))}

              <Pildora x={XQI} y={yq(0)} c={q[0]} lado="a" onPress={abrir} />
              <Pildora x={XQI} y={yq(1)} c={q[0]} lado="b" onPress={abrir} />
              <Pildora x={XQI} y={yq(2)} c={q[1]} lado="a" onPress={abrir} />
              <Pildora x={XQI} y={yq(3)} c={q[1]} lado="b" onPress={abrir} />

              <Pildora x={XSI} y={ys(0)} c={s[0]} lado="a" onPress={abrir} />
              <Pildora x={XSI} y={ys(1)} c={s[0]} lado="b" onPress={abrir} />

              <Pildora x={XC} y={yf} c={fin} lado="a" onPress={abrir} />
              <Pildora x={XC + CW - PW} y={yf} c={fin} lado="b" onPress={abrir} />

              <Pildora x={XSD} y={ys(0)} c={s[1]} lado="a" onPress={abrir} />
              <Pildora x={XSD} y={ys(1)} c={s[1]} lado="b" onPress={abrir} />

              <Pildora x={XQD} y={yq(0)} c={q[2]} lado="a" onPress={abrir} />
              <Pildora x={XQD} y={yq(1)} c={q[2]} lado="b" onPress={abrir} />
              <Pildora x={XQD} y={yq(2)} c={q[3]} lado="a" onPress={abrir} />
              <Pildora x={XQD} y={yq(3)} c={q[3]} lado="b" onPress={abrir} />

              <View style={[st.trofeo, { left: XC, width: CW, top: yf - PH / 2 - 92 }]}>
                <Text style={st.ganador}>GANADOR</Text>
                <Text style={{ fontSize: 40 }}>🏆</Text>
                <Text style={st.campeon} numberOfLines={1}>{data.campeon || 'Por definir'}</Text>
              </View>
            </View>
          </ScrollView>
          <View style={st.pie}>
            <Text style={st.pieTxt}>CUADRO DEL TORNEO</Text>
            <Text style={st.pieTxt} numberOfLines={1}>{data.torneo.nombre}</Text>
          </View>
        </View>

        <Text style={st.ayuda}>
          {data.puede_editar
            ? 'Desliza para ver todo el cuadro. Toca un partido para escribir los equipos y los goles.'
            : 'Desliza para ver todo el cuadro.'}
        </Text>

        {empates.map((c) => (
          <Text key={c.ronda + c.posicion} style={st.aviso}>
            ⚠ {nombreCruce(c)}: {c.equipo_a} y {c.equipo_b} empataron. Se enfrentan para definir.
          </Text>
        ))}
      </ScrollView>

      {editando ? (
        <Editor
          cruce={editando}
          torneoId={torneo.id}
          onCerrar={() => setEditando(null)}
          onGuardado={(nueva) => { setData(nueva); setEditando(null); }}
        />
      ) : null}
    </>
  );
}

export default function Llaves() {
  const [sel, setSel] = useState(null);
  if (sel) return <LlaveTorneo torneo={sel} onVolver={() => setSel(null)} />;
  return (
    <Pantalla
      ruta="/api/app/torneos/"
      vacio="No hay torneos disponibles"
      renderItem={(t) => (
        <TouchableOpacity onPress={() => setSel(t)}>
          <Tarjeta>
            <Nombre>🏆 {t.nombre}</Nombre>
            <Gris>{t.categoria} · {t.fecha_inicio} a {t.fecha_fin}</Gris>
            <Text style={{ color: colores.neon, fontWeight: 'bold', marginTop: 6 }}>Ver llave →</Text>
          </Tarjeta>
        </TouchableOpacity>
      )}
    />
  );
}

const st = StyleSheet.create({
  volver: { color: colores.neon, fontWeight: 'bold', marginBottom: 8 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: colores.texto },
  panel: { backgroundColor: '#1f2a24', borderRadius: 16, overflow: 'hidden', marginTop: 12 },
  lienzo: { width: ANCHO, height: ALTO, margin: 16 },
  linea: { position: 'absolute', backgroundColor: '#2f7a47' },
  pil: { position: 'absolute', width: PW, height: PH, borderRadius: 8, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pilNom: { flex: 1, fontSize: 12, fontWeight: '600' },
  pilGol: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  gana: { borderWidth: 2, borderColor: colores.neon },
  empate: { borderWidth: 2, borderColor: '#ff7a00', borderStyle: 'dashed' },
  titColumna: { position: 'absolute', top: 12, textAlign: 'center', color: colores.gris, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  trofeo: { position: 'absolute', alignItems: 'center', height: 88 },
  ganador: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  campeon: { color: '#ffc83d', fontWeight: '800', fontSize: 13 },
  pie: { backgroundColor: '#ffc83d', paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between' },
  pieTxt: { color: '#2b2100', fontWeight: '800', fontSize: 12, flexShrink: 1 },
  ayuda: { color: colores.gris, marginTop: 10 },
  aviso: { color: '#ffc107', fontWeight: '600', marginTop: 8 },
  error: { color: '#ff6b6b', marginVertical: 8 },
  fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  caja: { backgroundColor: colores.tarjeta, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderWidth: 1, borderColor: colores.borde },
  tituloModal: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  etq: { color: colores.gris, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colores.borde, backgroundColor: '#08170f', color: '#fff', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 10 },
  fila: { flexDirection: 'row', marginHorizontal: -4 },
  mitad: { flex: 1, marginHorizontal: 4 },
  vs: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  nota: { color: colores.gris, marginBottom: 12 },
});