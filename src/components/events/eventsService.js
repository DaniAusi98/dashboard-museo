import { API_URL } from "../../services/api";
export async function getEventsReport(desde, hasta) {
  const response = await fetch(
    `${API_URL}/api/v1/Eventos/reporteEventos?desde=${desde}&hasta=${hasta}`,
  );

  if (!response.ok) {
    throw new Error("Error al obtener el reporte de eventos");
  }

  return await response.json();
}
