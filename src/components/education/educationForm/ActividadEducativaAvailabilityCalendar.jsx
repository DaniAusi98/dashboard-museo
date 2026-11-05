import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import dayjs from 'dayjs';

import esLocale from '@fullcalendar/core/locales/es';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

import { API_URL } from '../../../services/api';
import { authService } from '../../../lib/auth';

import ActividadEducativaDateConfigurationResponsive from './ActividadEducativaDateConfigurationResponsive';

import CalendarToolbar from '../../mainCalendar/CalendarToolbar';

const ActividadEducativaAvailabilityCalendar = forwardRef(
  ({ salasIds = [], onActivityConfigurationChange }, ref) => {
    const calendarRef = useRef(null);
    const calendarContainerRef = useRef(null);

    const [events, setEvents] = useState([]);
    const [slotsOriginales, setSlotsOriginales] = useState([]);
    const [loading, setLoading] = useState(false);

    const [configurationOpen, setConfigurationOpen] = useState(false);
    const [initialDates, setInitialDates] = useState(null);
    const [configurationPosition, setConfigurationPosition] = useState(null);

    const [slotsNoDisponibles, setSlotsNoDisponibles] = useState([]);

    const [view, setView] = useState('dayGridMonth');
    const [title, setTitle] = useState('');

    // =========================================================
    // FETCH DISPONIBILIDAD
    // =========================================================

    const fetchAvailableTimes = async (startStr, endStr) => {
      if (!salasIds.length) {
        setEvents([]);
        setSlotsOriginales([]);
        setSlotsNoDisponibles([]);
        return;
      }

      try {
        setLoading(true);

        const fechaDesde = dayjs(startStr).format('YYYY-MM-DD');
        const fechaHasta = dayjs(endStr).format('YYYY-MM-DD');

        const params = new URLSearchParams({
          desde: fechaDesde,
          hasta: fechaHasta,
        });

        salasIds.forEach((salaId) => {
          params.append('salasIds', salaId);
        });

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/ActividadEducativa/disponibilidadactividadeseducativas?${params.toString()}`,
          {
            method: 'GET',
          }
        );

        if (!response.ok) {
          throw new Error('Error al obtener disponibilidad');
        }

        const result = await response.json();

        const slots = result?.data?.horariosDisponibles ?? [];

        setSlotsOriginales(slots);

        const slotsNoDisponiblesActuales = slots.filter(
          (slot) => slot.disponible === false
        );

        setSlotsNoDisponibles(slotsNoDisponiblesActuales);

        const bloqueosMapeados = slotsNoDisponiblesActuales.map((slot) => ({
          id: slot.inicio,
          title: slot.mensaje || 'No disponible',
          start: slot.inicio,
          end: slot.fin,
          display: 'background',
          backgroundColor: '#d1d5db',
          borderColor: '#d1d5db',
        }));

        setEvents(bloqueosMapeados);
      } catch (error) {
        console.error('Error obteniendo disponibilidad:', error);

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
        refreshAvailability() {
          const calendarApi = calendarRef.current?.getApi();

          if (!calendarApi) return;

          const view = calendarApi.view;

          fetchAvailableTimes(
            view.activeStart.toISOString(),
            view.activeEnd.toISOString()
          );
        },
      }),
      [salasIds]
    );

    // =========================================================
    // RECARGAR CUANDO CAMBIAN LAS SALAS
    // =========================================================

    useEffect(() => {
      const calendarApi = calendarRef.current?.getApi();

      if (!calendarApi) return;

      const currentView = calendarApi.view;

      fetchAvailableTimes(
        currentView.activeStart.toISOString(),
        currentView.activeEnd.toISOString()
      );
    }, [salasIds.join(',')]);

    // =========================================================
    // OBTENER HORARIO POR DEFECTO
    // =========================================================

    const obtenerHorarioPorDefecto = () => {
      const ahora = dayjs();

      let horaInicio;

      if (ahora.minute() === 0 || ahora.minute() === 30) {
        horaInicio = ahora;
      } else if (ahora.minute() < 30) {
        horaInicio = ahora.minute(30);
      } else {
        horaInicio = ahora.add(1, 'hour').minute(0);
      }

      const horaFin = horaInicio.add(1, 'hour');

      return {
        horaInicio,
        horaFin,
      };
    };

    // =========================================================
    // SELECCIÓN DE FECHA / HORARIO
    // =========================================================

    const handleDateSelect = (selectInfo) => {
      const { start, end, view } = selectInfo;

      const calendarApi = calendarRef.current?.getApi();

      if (!calendarApi) return;

      const selectedStart = dayjs(start);
      const selectedEnd = dayjs(end);

      // =======================================================
      // VISTA MES
      // Seleccionamos solamente una fecha.
      // Usamos la hora actual redondeada a 00/30.
      // =======================================================

      if (view.type === 'dayGridMonth') {
        const fecha = selectedStart.format('YYYY-MM-DD');

        const slotsDelDia = slotsOriginales.filter(
          (slot) => dayjs(slot.inicio).format('YYYY-MM-DD') === fecha
        );

        const todosNoDisponibles =
          slotsDelDia.length > 0 &&
          slotsDelDia.every((slot) => slot.disponible === false);

        if (todosNoDisponibles) {
          calendarApi.unselect();
          return;
        }

        const { horaInicio, horaFin } = obtenerHorarioPorDefecto();

        setInitialDates({
          fechaInicio: fecha,
          fechaFin: fecha,
          horaInicio: horaInicio.format('HH:mm'),
          horaFin: horaFin.format('HH:mm'),
        });

        const rect = calendarContainerRef.current?.getBoundingClientRect();

        setConfigurationPosition({
          top: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
          left: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
        });

        setConfigurationOpen(true);

        return;
      }

      // =======================================================
      // VISTA SEMANA / DÍA
      // Usa exactamente el slot seleccionado.
      // =======================================================

      const tieneConflicto = slotsNoDisponibles.some((slot) => {
        const slotInicio = dayjs(slot.inicio);
        const slotFin = dayjs(slot.fin);

        return (
          selectedStart.isBefore(slotFin) && selectedEnd.isAfter(slotInicio)
        );
      });

      if (tieneConflicto) {
        calendarApi.unselect();
        return;
      }

      setInitialDates({
        fechaInicio: selectedStart.format('YYYY-MM-DD'),
        fechaFin: selectedStart.format('YYYY-MM-DD'),
        horaInicio: selectedStart.format('HH:mm'),
        horaFin: selectedEnd.format('HH:mm'),
      });

      const rect = calendarContainerRef.current?.getBoundingClientRect();

      setConfigurationPosition({
        top: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
        left: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
      });

      setConfigurationOpen(true);
    };

    // =========================================================
    // RENDER DE CELDAS DEL MES
    // =========================================================

    const handleRenderCeldaMes = (arg) => {
      const fecha = dayjs(arg.date).format('YYYY-MM-DD');

      const slotsDelDia = slotsOriginales.filter(
        (slot) => dayjs(slot.inicio).format('YYYY-MM-DD') === fecha
      );

      if (!slotsDelDia.length) return;

      const todosNoDisponibles = slotsDelDia.every(
        (slot) => slot.disponible === false
      );

      if (todosNoDisponibles) {
        arg.el.style.backgroundColor = '#f3f4f6';
        arg.el.style.opacity = '0.6';
        arg.el.style.cursor = 'not-allowed';
      }
    };

    // =========================================================
    // CAMBIO DE RANGO DEL CALENDARIO
    // =========================================================

    const handleDatesSet = (dateInfo) => {
      setView(dateInfo.view.type);
      setTitle(dateInfo.view.title);

      fetchAvailableTimes(dateInfo.startStr, dateInfo.endStr);
    };

    // =========================================================
    // CONTENIDO DE EVENTOS
    // =========================================================

    const handleEventContent = (arg) => {
      if (!arg.event.title) return null;

      return (
        <Tooltip title={arg.event.title} arrow>
          <Box
            sx={{
              fontSize: '0.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              px: 0.5,
            }}
          >
            {arg.event.title}
          </Box>
        </Tooltip>
      );
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
    // RENDER
    // =========================================================

    return (
      <Card ref={calendarContainerRef}>
        <CardContent>
          <Box sx={{ position: 'relative' }}>
            <CalendarToolbar
              calendarRef={calendarRef}
              view={view}
              setView={setView}
              title={title}
            />

            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 60,
                  right: 20,
                  zIndex: 10,
                }}
              >
                <CircularProgress size={24} />
              </Box>
            )}

            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={false}
              locale={esLocale}
              timeZone="local"
              height="auto"
              allDaySlot={false}
              slotMinTime="08:00:00"
              slotMaxTime="21:00:00"
              slotDuration="00:30:00"
              selectable={true}
              selectMirror={true}
              select={handleDateSelect}
              events={events}
              dayCellDidMount={handleRenderCeldaMes}
              datesSet={handleDatesSet}
              eventContent={handleEventContent}
            />
          </Box>
        </CardContent>

        <ActividadEducativaDateConfigurationResponsive
          open={configurationOpen}
          position={configurationPosition}
          onClose={handleCloseConfiguration}
          initialDates={initialDates}
          onActivityConfigurationChange={onActivityConfigurationChange}
          slotsNoDisponibles={slotsNoDisponibles}
          salasIds={salasIds}
        />
      </Card>
    );
  }
);

ActividadEducativaAvailabilityCalendar.displayName =
  'ActividadEducativaAvailabilityCalendar';

export default ActividadEducativaAvailabilityCalendar;
