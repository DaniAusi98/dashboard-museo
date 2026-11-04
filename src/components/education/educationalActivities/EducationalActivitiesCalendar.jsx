import { useCallback, useRef, useState } from 'react';
import esLocale from '@fullcalendar/core/locales/es';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import CalendarToolbar from '../../mainCalendar/CalendarToolbar';
import { getEducationalActivities } from './educationalActivitiesService';
import CalendarEventPopover from './CalendarEventPopover';
export default function EducationalActivitiesCalendar({ onDateRangeChange }) {
  const calendarRef = useRef(null);
  const [view, setView] = useState('dayGridMonth');
  const [title, setTitle] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [anchorPosition, setAnchorPosition] = useState(null);
  function closePopover() {
    setAnchorPosition(null);
    setSelectedEvent(null);
  }
  const loadEvents = useCallback(
    async (fetchInfo, successCallback, failureCallback) => {
      try {
        const response = await getEducationalActivities(
          fetchInfo.startStr,
          fetchInfo.endStr
        );
        onDateRangeChange(fetchInfo.startStr, fetchInfo.endStr);
        const eventosVisitasGuiadas = response.data.visitasGuiadas.map(
          (visit) => ({
            id: String(visit.id),
            title: `Visita guiada`,
            start: visit.fechaInicio,
            end: visit.fechaFin,
            extendedProps: {
              tipo: 'visitaGuiada',
              visit,
            },
          })
        );

        const eventosActividadesEducativas =
          response.data.actividadesEducativas.map((actividad, index) => ({
            id: `${actividad.id}-${actividad.timeSlot.inicio}-${index}`,
            title: actividad.titulo,
            start: actividad.timeSlot.inicio,
            end: actividad.timeSlot.fin,
            extendedProps: {
              tipo: 'actividadEducativa',
              actividad,
            },
          }));

        const events = [
          ...eventosVisitasGuiadas,
          ...eventosActividadesEducativas,
        ];
        successCallback(events);
      } catch (error) {
        console.error('Error cargando actividades del calendario:', error);
        failureCallback(error);
      }
    },
    [onDateRangeChange]
  );
  return (
    <>
      {' '}
      <CalendarToolbar
        view={view}
        setView={setView}
        title={title}
        calendarRef={calendarRef}
      />{' '}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        weekends={false}
        locale="es"
        locales={[esLocale]}
        headerToolbar={false}
        slotMinTime="09:00:00"
        slotMaxTime="21:00:00"
        scrollTime="09:00:00"
        events={loadEvents}
        eventClick={(info) => {
          setSelectedEvent({
            ...info.event.extendedProps,
          });

          setAnchorPosition({
            top: info.jsEvent.clientY,
            left: info.jsEvent.clientX,
          });
        }}
        height="auto"
        views={{
          dayGridMonth: { titleFormat: { year: 'numeric', month: 'long' } },
          timeGridWeek: { titleFormat: { year: 'numeric', month: 'long' } },
          timeGridDay: {
            titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
          },
        }}
        datesSet={(info) => {
          const rawTitle = info.view.title;
          const nextTitle =
            rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
          setTitle((currentTitle) =>
            currentTitle === nextTitle ? currentTitle : nextTitle
          );
        }}
        dayHeaderContent={(arg) => {
          if (arg.view.type === 'dayGridMonth') {
            return arg.text.toUpperCase();
          }
          const weekday = arg.date
            .toLocaleDateString('es-ES', { weekday: 'short' })
            .toUpperCase();
          return `${weekday} ${arg.date.getDate()}`;
        }}
      />{' '}
      <CalendarEventPopover
        open={Boolean(anchorPosition)}
        position={anchorPosition}
        event={selectedEvent}
        onClose={closePopover}
      />{' '}
    </>
  );
}
