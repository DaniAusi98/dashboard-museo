import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from "react";
import dayjs from "dayjs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Tooltip,
} from "@mui/material";

import { API_URL } from "../../services/api";
import { authService } from "../../lib/auth";

import EventDateConfigurationResponsive from "./EventDateConfigurationResponsive";
import CalendarToolbar from "../mainCalendar/CalendarToolbar";

const EventAvailabilityCalendar = forwardRef(
  ({ salasIds = [], onEventConfigurationChange }, ref) => {
    const [events, setEvents] = useState([]);
    const [slotsOriginales, setSlotsOriginales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [configurationOpen, setConfigurationOpen] = useState(false);
    const [initialDates, setInitialDates] = useState(null);
    const [configurationPosition, setConfigurationPosition] = useState(null);
    const [slotsNoDisponibles, setSlotsNoDisponibles] = useState([]);

    const [view, setView] = useState("dayGridMonth");
    const [title, setTitle] = useState("");

    const calendarRef = useRef(null);
    const calendarContainerRef = useRef(null);

    // =========================================================
    // FETCH DISPONIBILIDAD
    // =========================================================

    const fetchAvailableTimes = async (startStr, endStr) => {
      if (!salasIds || salasIds.length === 0) {
        setEvents([]);
        setSlotsOriginales([]);
        setSlotsNoDisponibles([]);
        return;
      }

      setLoading(true);

      try {
        const fechaDesde = dayjs(startStr).format("YYYY-MM-DD");
        const fechaHasta = dayjs(endStr).format("YYYY-MM-DD");

        const params = new URLSearchParams();

        params.append("desde", fechaDesde);
        params.append("hasta", fechaHasta);

        salasIds.forEach((salaId) => {
          params.append("salasIds", salaId);
        });

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/eventos/disponibilidad?${params.toString()}`,
          {
            method: "GET",
          },
        );

        if (!response.ok) {
          throw new Error("Error al obtener disponibilidad");
        }

        const result = await response.json();

        const slots = result?.data?.horariosDisponibles ?? [];

        setSlotsNoDisponibles(
          slots.filter((slot) => slot.disponible === false),
        );

        setSlotsOriginales(slots);

        const bloqueosMapeados = slots
          .filter((slot) => slot.disponible === false)
          .map((slot) => ({
            id: slot.inicio,
            title: slot.mensaje || "No disponible",
            start: slot.inicio,
            end: slot.fin,
            display: "background",
            color: "#bdbdbd",
            textColor: "#424242",
          }));

        setEvents(bloqueosMapeados);
      } catch (error) {
        console.error("Error fetching disponibilidad:", error);

        setEvents([]);
        setSlotsOriginales([]);
        setSlotsNoDisponibles([]);
      } finally {
        setLoading(false);
      }
    };

    // =========================================================
    // REFRESH DESDE EL PADRE
    // =========================================================

    useImperativeHandle(
      ref,
      () => ({
        refreshAvailability: () => {
          if (calendarRef.current) {
            const api = calendarRef.current.getApi();

            fetchAvailableTimes(api.view.activeStart, api.view.activeEnd);
          }
        },
      }),
      [salasIds],
    );

    // =========================================================
    // RECARGAR DISPONIBILIDAD CUANDO CAMBIAN LAS SALAS
    // =========================================================

    useEffect(() => {
      if (calendarRef.current) {
        const api = calendarRef.current.getApi();

        fetchAvailableTimes(api.view.activeStart, api.view.activeEnd);
      }
    }, [salasIds.join(",")]);

    // =========================================================
    // ABRIR CONFIGURACIÓN DEL EVENTO
    // =========================================================

    const abrirConfiguracionEvento = (selectInfo) => {
      const api = calendarRef.current.getApi();

      let initialConfiguration;

      // ---------------------------------------------------------
      // VISTA MES
      // Seleccionamos una fecha y damos un horario inicial
      // ---------------------------------------------------------

      if (api.view.type === "dayGridMonth") {
        const ahora = dayjs();

        let horaInicio;

        if (ahora.minute() === 0 || ahora.minute() === 30) {
          horaInicio = ahora;
        } else if (ahora.minute() < 30) {
          horaInicio = ahora.minute(30);
        } else {
          horaInicio = ahora.add(1, "hour").minute(0);
        }

        const horaFin = horaInicio.add(1, "hour");

        initialConfiguration = {
          fechaInicio: dayjs(selectInfo.startStr).format("YYYY-MM-DD"),
          horaInicio: horaInicio.format("HH:mm"),
          horaFin: horaFin.format("HH:mm"),
        };
      }

      // ---------------------------------------------------------
      // VISTA SEMANA / DÍA
      // Seleccionamos fecha + horario
      // ---------------------------------------------------------
      else {
        initialConfiguration = {
          fechaInicio: dayjs(selectInfo.startStr).format("YYYY-MM-DD"),
          horaInicio: dayjs(selectInfo.startStr).format("HH:mm"),
          horaFin: dayjs(selectInfo.endStr).format("HH:mm"),
        };
      }

      setInitialDates(initialConfiguration);

      // ---------------------------------------------------------
      // CENTRO DEL CONTENEDOR DEL CALENDARIO
      // ---------------------------------------------------------

      const container = calendarContainerRef.current;

      if (container) {
        const rect = container.getBoundingClientRect();

        setConfigurationPosition({
          top: rect.top + rect.height / 2,
          left: rect.left + rect.width / 2,
        });
      }

      setConfigurationOpen(true);
    };

    // =========================================================
    // CONFIGURACIÓN FINAL DEL EVENTO
    // =========================================================

    const handleConfigurationChange = (configuracion) => {
      onEventConfigurationChange?.(configuracion);

      setConfigurationOpen(false);
      setInitialDates(null);
      setConfigurationPosition(null);
    };

    // =========================================================
    // CERRAR CONFIGURACIÓN
    // =========================================================

    const handleCloseConfiguration = () => {
      setConfigurationOpen(false);
      setInitialDates(null);
      setConfigurationPosition(null);

      calendarRef.current?.getApi()?.unselect();
    };

    // =========================================================
    // MANEJO DE SELECCIÓN
    // =========================================================

    const handleSelectSlot = (selectInfo) => {
      const api = calendarRef.current.getApi();

      // ---------------------------------------------------------
      // VISTA MES
      // ---------------------------------------------------------

      if (api.view.type === "dayGridMonth") {
        const fechaCeldaStr = dayjs(selectInfo.startStr).format("YYYY-MM-DD");

        const slotsDelDia = slotsOriginales.filter(
          (slot) => dayjs(slot.inicio).format("YYYY-MM-DD") === fechaCeldaStr,
        );

        if (
          slotsDelDia.length > 0 &&
          slotsDelDia.every((s) => s.disponible === false)
        ) {
          api.unselect();
          return;
        }

        abrirConfiguracionEvento(selectInfo);
        return;
      }

      // ---------------------------------------------------------
      // VISTA SEMANA / DÍA
      // ---------------------------------------------------------

      const seSolapaConBloqueo = events.some(
        (b) => selectInfo.startStr < b.end && selectInfo.endStr > b.start,
      );

      if (seSolapaConBloqueo) {
        api.unselect();
        return;
      }

      abrirConfiguracionEvento(selectInfo);
    };

    // =========================================================
    // CONTROL VISUAL MES
    // =========================================================

    const handleRenderCeldaMes = (info) => {
      const fechaCeldaStr = dayjs(info.date).format("YYYY-MM-DD");

      const slotsDelDia = slotsOriginales.filter(
        (slot) => dayjs(slot.inicio).format("YYYY-MM-DD") === fechaCeldaStr,
      );

      if (
        slotsDelDia.length > 0 &&
        slotsDelDia.every((s) => s.disponible === false)
      ) {
        info.el.style.backgroundColor = "#bdbdbd";
        info.el.style.cursor = "not-allowed";
        info.el.style.opacity = "0.75";
      }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
      <Box ref={calendarContainerRef} sx={{ position: "relative" }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(255,255,255,0.7)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Card>
          <CardContent
            sx={{
              "& .fc": {
                fontFamily: "Roboto, sans-serif",
              },
            }}
          >
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
              headerToolbar={false}
              locale="es"
              timeZone="local"
              allDaySlot={false}
              slotMinTime="08:00:00"
              slotMaxTime="21:00:00"
              slotDuration="00:30:00"
              selectable={true}
              selectMirror={true}
              select={handleSelectSlot}
              events={events}
              dayCellDidMount={handleRenderCeldaMes}
              datesSet={(dateInfo) => {
                const raw = dateInfo.view.title;

                const nextTitle = raw.charAt(0).toUpperCase() + raw.slice(1);

                setView(dateInfo.view.type);

                setTitle((currentTitle) =>
                  currentTitle === nextTitle ? currentTitle : nextTitle,
                );

                fetchAvailableTimes(dateInfo.startStr, dateInfo.endStr);
              }}
              eventContent={(arg) => (
                <Tooltip title={arg.event.title} placement="top" arrow>
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      cursor: "not-allowed",
                    }}
                  />
                </Tooltip>
              )}
            />
          </CardContent>
        </Card>

        {/* =====================================================
            CONFIGURACIÓN RESPONSIVE
        ===================================================== */}

        <EventDateConfigurationResponsive
          open={configurationOpen}
          position={configurationPosition}
          onClose={handleCloseConfiguration}
          initialDates={initialDates}
          onEventConfigurationChange={handleConfigurationChange}
          slotsNoDisponibles={slotsNoDisponibles}
          salasIds={salasIds}
        />
      </Box>
    );
  },
);

export default EventAvailabilityCalendar;
