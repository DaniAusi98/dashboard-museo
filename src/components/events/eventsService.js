import { API_URL } from '../../services/api';
export async function getEventsReport(desde, hasta) {
  const response = await fetch(
    `${API_URL}/api/v1/Eventos/reporteEventos?desde=${desde}&hasta=${hasta}`
  );

  if (!response.ok) {
    throw new Error('Error al obtener el reporte de eventos');
  }

  return await response.json();
}
export async function getEventsByRoomReport(desde, hasta) {
  const response = await fetch(
    `${API_URL}/api/v1/Eventos/reporteEventoPorSala?desde=${desde}&hasta=${hasta}`
  );

  if (!response.ok) {
    throw new Error('Error al obtener el reporte de eventos por sala');
  }

  return await response.json();
}
