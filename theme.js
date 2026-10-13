export const colores = {
  verde: '#22a447',
  neon: '#4ade3b',
  verdeOscuro: '#4ade3b',
  fondo: '#060f0a',
  tarjeta: '#0b1d13',
  texto: '#ffffff',
  gris: '#9bb5a5',
  borde: '#1f5a33',
};

export function formatCOP(valor) {
  const n = Math.round(Number(valor) || 0);
  return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
export function formatFecha(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${Number(d)} de ${MESES[Number(m) - 1]} de ${y}`;
}
export const hhmm = (h) => (h || '').slice(0, 5);