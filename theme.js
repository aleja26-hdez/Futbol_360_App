export const colores = {
  verde: '#1b7a43',
  verdeOscuro: '#14532d',
  fondo: '#f4faf6',
  texto: '#1b2b22',
  gris: '#5c6b62',
  borde: '#dce7df',
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