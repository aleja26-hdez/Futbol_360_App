import Home from '../components/Home';
import { PanelEntrenador } from './modulos/Paneles';
import { Jugadores, Entrenamientos } from './modulos/listas';
import Asistencia from './modulos/Asistencia';
import Notificaciones from './modulos/Notificaciones';
import { EscuelaInfo } from './modulos/Escuelas';

const SECCIONES = [
  { clave: 'panel', titulo: 'Mi panel', componente: PanelEntrenador },
  { clave: 'jugadores', titulo: 'Jugadores', componente: Jugadores },
  { clave: 'entrenamientos', titulo: 'Entrenamientos', componente: Entrenamientos },
  { clave: 'asistencia', titulo: 'Asistencia', componente: Asistencia },
  { clave: 'notificaciones', titulo: 'Notificaciones', componente: Notificaciones },
  { clave: 'escuela', titulo: 'La escuela', componente: EscuelaInfo },
];

export default function EntrenadorHome({ user, onLogout }) {
  return <Home user={user} rolTexto="Entrenador" secciones={SECCIONES} onLogout={onLogout} />;
}