import { useCallback, useRef, useState } from "react";
import esLocale from "@fullcalendar/core/locales/es";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import CalendarToolbar from "./CalendarToolbar";
import { getCalendarEvents } from "./calendarServiceMock";
import ActivityPopover from "./ActivityPopover";
import ActivityTodayGrid from "./ActivityTodayGrid";

export default function MainCalendar() {
  const calendarRef = useRef(null);
  const [view, setView] = useState("dayGridMonth");
  const [title, setTitle] = useState("");

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [anchorPosition, setAnchorPosition] = useState(null);

  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async (fetchInfo) => {
    setLoading(true);

    try {
      const data = await getCalendarEvents(
        fetchInfo.startStr,
        fetchInfo.endStr,
      );

      setAllEvents(data);
      return data;
    } catch (error) {
      console.error("Error cargando actividades:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <CalendarToolbar
        view={view}
        setView={setView}
        title={title}
        calendarRef={calendarRef}
      />

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        weekends={false}
        locale="es"
        locales={[esLocale]}
        headerToolbar={false}
        slotMinTime={"09:00:00"}
        slotMaxTime={"21:00:00"}
        scrollTime={"09:00:00"}
        events={fetchEvents}
        eventClick={(info) => {
          setSelectedActivity(info.event.extendedProps.actividad);

          setSelectedSlot(info.event.extendedProps.slotSeleccionado);

          setAnchorPosition({
            top: info.jsEvent.clientY,

            left: info.jsEvent.clientX,
          });
        }}
        height="auto"
        views={{
          dayGridMonth: {
            titleFormat: {
              year: "numeric",
              month: "long",
            },
          },

          timeGridWeek: {
            titleFormat: {
              year: "numeric",
              month: "long",
            },
          },

          timeGridDay: {
            titleFormat: {
              year: "numeric",

              month: "long",

              day: "numeric",
            },
          },
        }}
        datesSet={(info) => {
          const raw = info.view.title;

          const nextTitle = raw.charAt(0).toUpperCase() + raw.slice(1);

          setTitle((currentTitle) =>
            currentTitle === nextTitle ? currentTitle : nextTitle,
          );
        }}
        dayHeaderContent={(arg) => {
          if (arg.view.type === "dayGridMonth") {
            return arg.text.toUpperCase();
          }

          const weekday = arg.date
            .toLocaleDateString("es-ES", {
              weekday: "short",
            })
            .toUpperCase();

          const day = arg.date.getDate();

          return `${weekday} ${day}`;
        }}
      />

      <ActivityPopover
        open={Boolean(anchorPosition)}
        position={anchorPosition}
        activity={selectedActivity}
        slot={selectedSlot}
        onClose={() => {
          setAnchorPosition(null);

          setSelectedActivity(null);

          setSelectedSlot(null);
        }}
      />

      <ActivityTodayGrid rows={allEvents} loading={loading} />
    </>
  );
}
