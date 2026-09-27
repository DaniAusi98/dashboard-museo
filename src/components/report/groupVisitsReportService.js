const USE_MOCK = false;

import { API_URL } from "../../services/api";
import { authService } from "../../lib/auth";

// REPORTE SUMMARY CARDS

export async function getGroupVisitsSummary(fechaDesde, fechaHasta) {
  if (USE_MOCK) {
    return Promise.resolve(mockGroupVisitsSummary);
  }

  const params = new URLSearchParams({
    desde: fechaDesde,
    hasta: fechaHasta,
  });

  const response = await fetch(
    `${API_URL}/api/v1/ReportesVisitasGrupales/reportSummaryCards?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el reporte de visitas grupales");
  }

  return await response.json();
}

// ======================================================
// VISITAS GUIADAS
// ======================================================

export async function getGuidedVisitsReport(fechaDesde, fechaHasta) {
  const response = await fetch(
    `${API_URL}/api/v1/ReportesVisitasGrupales/reporteVisitaGuiada?desde=${fechaDesde}&hasta=${fechaHasta}`,
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el reporte de visitas guiadas");
  }
  return await response.json();
}

// ======================================================
// VISITAS AUTOGUIADAS
// ======================================================

export async function getSelfGuidedVisitsReport(fechaDesde, fechaHasta) {
  const response = await fetch(
    `${API_URL}/api/v1/ReportesVisitasGrupales/reporteVisitaAutoguiada?desde=${fechaDesde}&hasta=${fechaHasta}`,
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el reporte de visitas autoguiadas");
  }
  return await response.json();
}

export async function getGroupVisitsReport(fechaDesde, fechaHasta) {
  const response = await fetch(
    `${API_URL}/api/v1/ReportesVisitasGrupales/reportGrid?desde=${fechaDesde}&hasta=${fechaHasta}`,
  );

  if (!response.ok) {
    throw new Error("Error obteniendo el reporte de visitas grupales");
  }

  const result = await response.json();

  return result.data.items;
}

export async function getVisitorsByRoom(fechaDesde, fechaHasta) {
  const response = await fetch(
    `${API_URL}/api/v1/ReportesVisitasGrupales/reporteVisitasSala?desde=${fechaDesde}&hasta=${fechaHasta}`,
  );
  if (!response.ok) {
    throw new Error("Error obteniendo el reporte de visitantes por sala");
  }
  const result = await response.json();

  return result;
}
