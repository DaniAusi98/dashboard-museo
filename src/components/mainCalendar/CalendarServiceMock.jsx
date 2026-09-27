export async function getCalendarEvents(fechaDesde, fechaHasta) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const result = {
    success: true,
    data: {
      count: 5,
      items: [
        {
          id: 1,
          categoriaActividad: "VisitaGrupal",
          tipoActividad: "VisitaGrupalGuiada",
          estado: "Activa",
          cantidadPersonas: 30,
          salas: [
            {
              salaId: 3,
              nombreSala: "Arqueología del Siglo XIX",
              tipoSala: "ExposicionPermanente",
              ubicacion: "PlantaBaja",
            },
          ],
          recursos: [
            {
              recursoId: 1,
              nombreRecurso: "Audioguía",
              tipoRecurso: "Tecnológico",
              cantidadAsignada: 10,
            },
          ],
          timeSlots: [
            {
              inicio: "2026-07-29T11:00:00",
              fin: "2026-07-29T12:00:00",
            },
          ],
        },

        {
          id: 2,
          categoriaActividad: "VisitaGrupal",
          tipoActividad: "VisitaGrupalAutoguiada",
          estado: "Activa",
          cantidadPersonas: 20,
          salas: [
            {
              salaId: 5,
              nombreSala: "Mensajes de Identidad",
              tipoSala: "ExposicionPermanente",
              ubicacion: "PlantaBaja",
            },
          ],
          recursos: [],
          timeSlots: [
            {
              inicio: "2026-07-30T09:30:00",
              fin: "2026-07-30T10:30:00",
            },
          ],
        },

        {
          id: 3,
          categoriaActividad: "Evento",
          tipoActividad: "Conferencia",
          estado: "Activa",
          cantidadPersonas: 80,
          salas: [
            {
              salaId: 2,
              nombreSala: "Auditorio",
              tipoSala: "Auditorio",
              ubicacion: "PrimerPiso",
            },
          ],
          recursos: [
            {
              recursoId: 2,
              nombreRecurso: "Equipo de Audio",
              tipoRecurso: "Audio",
              cantidadAsignada: 1,
            },
            {
              recursoId: 3,
              nombreRecurso: "Micrófono",
              tipoRecurso: "Audio",
              cantidadAsignada: 2,
            },
          ],
          timeSlots: [
            {
              inicio: "2026-07-30T16:00:00",
              fin: "2026-07-30T18:00:00",
            },
          ],
        },

        {
          id: 4,
          categoriaActividad: "Educativa",
          tipoActividad: "Curso",
          estado: "Activa",
          cantidadPersonas: 15,
          salas: [
            {
              salaId: 4,
              nombreSala: "Sala Educativa",
              tipoSala: "Educativa",
              ubicacion: "SegundoPiso",
            },
          ],
          recursos: [
            {
              recursoId: 4,
              nombreRecurso: "Proyector",
              tipoRecurso: "Tecnológico",
              cantidadAsignada: 1,
            },
          ],
          timeSlots: [
            {
              inicio: "2026-07-28T09:00:00",
              fin: "2026-07-28T11:00:00",
            },
          ],
        },

        {
          id: 5,
          categoriaActividad: "Educativa",
          tipoActividad: "Taller",
          estado: "Activa",
          cantidadPersonas: 25,
          salas: [
            {
              salaId: 6,
              nombreSala: "Aula Taller",
              tipoSala: "Educativa",
              ubicacion: "SegundoPiso",
            },
          ],
          recursos: [],
          timeSlots: [
            {
              inicio: "2026-07-24T14:00:00",
              fin: "2026-07-24T16:00:00",
            },
          ],
        },
      ],
    },
  };

  const actividades = result.data.items;

  const desde = new Date(fechaDesde);
  const hasta = new Date(fechaHasta);

  const events = [];

  for (const actividad of actividades) {
    for (const slot of actividad.timeSlots) {
      const inicio = new Date(slot.inicio);

      if (inicio >= desde && inicio <= hasta) {
        events.push({
          id: `${actividad.id}-${slot.inicio}`,

          // título que verá FullCalendar
          title: actividad.tipoActividad,

          start: slot.inicio,
          end: slot.fin,

          // mantenemos toda la actividad
          actividad,

          slotSeleccionado: slot,
        });
      }
    }
  }

  return events;
}
