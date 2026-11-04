export async function getCalendarEvents(fechaDesde, fechaHasta) {
  const response = await fetch(
    `https://localhost:7204/api/v1/Actividades/calendar?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`
  );

  if (!response.ok) {
    throw new Error('Error al obtener actividades');
  }

  const result = await response.json();

  const actividades = result.data.items;

  const events = [];

  for (const actividad of actividades) {
    events.push({
      id: `${actividad.id}-${actividad.horario.inicio}`,
      title: actividad.titulo || actividad.tipoActividad,
      start: actividad.horario.inicio,
      end: actividad.horario.fin,

      actividad,
      slotSeleccionado: actividad.horario,
    });
  }

  return events;
}
