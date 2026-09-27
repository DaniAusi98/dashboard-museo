import { API_URL } from ".././../services/api.js";

export async function getGroupVisitsCalendar(fechaDesde, fechaHasta) {
  const response = await fetch(
    `${API_URL}/api/v1/VisitasGuiadas/calendar?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`,
  );

  if (!response.ok) {
    throw new Error("Error al obtener las visitas del calendario");
  }

  return await response.json();
}

export async function getGuidedVisitsReport(desde, hasta) {
  const response = await fetch(
    `${API_URL}/api/v1/VisitasGuiadas/reporteguiadas?desde=${desde}&hasta=${hasta}`,
  );

  if (!response.ok) {
    throw new Error("Error al obtener el reporte de visitas guiadas");
  }

  return await response.json();
}
export async function getSelfGuidedVisitsReport(desde, hasta) {
  const response = await fetch(
    `${API_URL}/api/v1/VisitaAutoguiada/reporteautoguiadas?desde=${desde}&hasta=${hasta}`,
  );

  if (!response.ok) {
    throw new Error("Error al obtener el reporte de visitas autoguiadas");
  }

  return await response.json();
}
