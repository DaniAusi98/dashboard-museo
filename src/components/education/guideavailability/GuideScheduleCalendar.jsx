import { useCallback, useRef, useState } from 'react';

import { Backdrop, Box, CircularProgress } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import CalendarToolbar from '../../mainCalendar/CalendarToolbar';
import { getGuideAvailability } from './guideScheduleService';
import GuideDaySchedule from './GuideDaySchedule';

const disponibilidadVacia = {
  desde: null,
  hasta: null,
  guiasDisponible: [],
};

const GuideScheduleCalendar = () => {
  const calendarRef = useRef(null);

  const [view, setView] = useState('dayGridMonth');
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [availability, setAvailability] = useState(disponibilidadVacia);
  const [loading, setLoading] = useState(false);

  const loadAvailability = useCallback(async (dateInfo) => {
    try {
      setLoading(true);

      const data = await getGuideAvailability(
        dateInfo.startStr,
        dateInfo.endStr
      );

      setAvailability({
        desde: data?.desde ?? null,
        hasta: data?.hasta ?? null,
        guiasDisponible: data?.guiasDisponible ?? [],
      });
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      setAvailability(disponibilidadVacia);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDatesSet = useCallback(
    (dateInfo) => {
      setTitle(dateInfo.view.title);
      setView(dateInfo.view.type);
      loadAvailability(dateInfo);
    },
    [loadAvailability]
  );

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setAnchorEl(info.dayEl);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (newView) => {
    const calendarApi = calendarRef.current?.getApi();

    if (!calendarApi) return;

    calendarApi.changeView(newView);
    setView(newView);
  };

  return (
    <Box>
      <CalendarToolbar
        view={view}
        setView={handleViewChange}
        title={title}
        calendarRef={calendarRef}
      />

      <Box sx={{ position: 'relative', bgcolor: 'background.paper' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          weekends={false}
          headerToolbar={false}
          height="auto"
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
        />

        <Backdrop
          open={loading}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            color: 'white',
          }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>

      <GuideDaySchedule
        anchorEl={anchorEl}
        selectedDate={selectedDate}
        guias={availability.guiasDisponible}
        onClose={handleClose}
        onAgregarAusencia={(guia) => {
          console.log('Registrar ausencia para:', guia);
          // Después conectamos el formulario de ausencia.
        }}
      />
    </Box>
  );
};

export default GuideScheduleCalendar;
