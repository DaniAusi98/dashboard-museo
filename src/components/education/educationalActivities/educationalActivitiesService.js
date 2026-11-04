import { API_URL } from '../../../services/api';

export async function getEducationalActivities(desde, hasta) {
  const response = await fetch(
    `${API_URL}/api/v1/ActividadEducativa/actividadeseducacion?desde=${desde}&hasta=${hasta}`
  );

  if (!response.ok) {
    throw new Error('Error al obtener las actividades educativas');
  }

  return await response.json();
}
export async function getEducActivities(desde, hasta) {
  const response = await fetch(
    `${API_URL}/api/v1/ActividadEducativa/actividadeseducativas?desde=${desde}&hasta=${hasta}`
  );

  if (!response.ok) {
    throw new Error('Error al obtener las actividades educativas');
  }

  return await response.json();
}

export async function getGuidedVisitsReport(desde, hasta) {
  const response = await fetch(
    `${API_URL}/api/v1/VisitasGuiadas/reporteguiadas?desde=${desde}&hasta=${hasta}`
  );

  if (!response.ok) {
    throw new Error('Error al obtener el reporte de visitas guiadas');
  }

  return await response.json();
}
