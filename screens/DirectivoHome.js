import Home from '../components/Home';
import { DashboardDirectivo } from './modulos/Paneles';
import { Jugadores, PagosDirectivo, Categorias, Entrenadores, Entrenamientos, Torneos, UsuariosLista } from './modulos/listas';
import Notificaciones from './modulos/Notificaciones';
import { Escuelas } from './modulos/Escuelas';
import Llaves from './modulos/Llave';

const SECCIONES = [
  { clave: 'dashboard', titulo: 'Dashboard', componente: DashboardDirectivo },
  { clave: 'jugadores', titulo: 'Jugadores', componente: Jugadores },
  { clave: 'pagos', titulo: 'Pagos', componente: PagosDirectivo },
  { clave: 'categorias', titulo: 'Categorías', componente: Categorias },
  { clave: 'entrenadores', titulo: 'Entrenadores', componente: Entrenadores },
  { clave: 'entrenamientos', titulo: 'Entrenamientos', componente: Entrenamientos },
  { clave: 'torneos', titulo: 'Torneos', componente: Torneos },
  { clave: 'notificaciones', titulo: 'Notificaciones', componente: Notificaciones },
  { clave: 'escuelas', titulo: 'Escuelas', componente: Escuelas },
  { clave: 'usuarios', titulo: 'Usuarios', componente: UsuariosLista },
  { clave: 'llaves', titulo: 'Llaves', componente: Llaves },
];

export default function DirectivoHome({ user, onLogout }) {
  return <Home user={user} rolTexto="Directivo" secciones={SECCIONES} onLogout={onLogout} />;
}