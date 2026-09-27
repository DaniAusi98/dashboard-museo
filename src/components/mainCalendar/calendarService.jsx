export async function getCalendarEvents(fechaDesde, fechaHasta) {
  const response = await fetch(
    `https://localhost:7204/api/v1/Actividades/calendar?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`,
  );

  if (!response.ok) {
    throw new Error("Error al obtener actividades");
  }

  const result = await response.json();

  const actividades = result.data.items;

  const events = [];

  for (const actividad of actividades) {
    for (const slot of actividad.timeSlots) {
      events.push({
        id: `${actividad.id}-${slot.inicio}`,
        title: actividad.tipoActividad,
        start: slot.inicio,
        end: slot.fin,

        // Datos que vamos a usar después
        actividad,
        slotSeleccionado: slot,
      });
    }
  }

  return events;
}
