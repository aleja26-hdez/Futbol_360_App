import { useCallback, useEffect, useState } from 'react';
import { apiGet } from './api';

export function useCarga(ruta) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      setError('');
      const data = await apiGet(ruta);
      setDatos(Array.isArray(data) ? data : data?.results ?? data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [ruta]);

  useEffect(() => { cargar(); }, [cargar]);

  const refrescar = () => { setRefrescando(true); cargar(); };
  return { datos, cargando, refrescando, error, refrescar };
}