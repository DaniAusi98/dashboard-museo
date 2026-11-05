import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import ReportPeriodFilter from '../report/ReportPeriodFilter';
import EventsGrid from './EventsGrid';
import EventsByRoomGrid from './EventByRoom';
import { useEvents } from './useEvents';

export default function EventsGridWrapper() {
  const navigate = useNavigate();

  const [fechaDesde, setFechaDesde] = useState(dayjs().startOf('month'));
  const [fechaHasta, setFechaHasta] = useState(dayjs().endOf('month'));

  const { events, eventsByRoom, loading, fetchEvents, fetchEventsByRoom } =
    useEvents();

  useEffect(() => {
    const desde = fechaDesde.format('YYYY-MM-DD');

    const hasta = fechaHasta ? fechaHasta.format('YYYY-MM-DD') : null;

    fetchEvents(desde, hasta);
    fetchEventsByRoom(desde, hasta);
  }, [fechaDesde, fechaHasta, fetchEvents, fetchEventsByRoom]);

  const aplicarPeriodo = (desde, hasta) => {
    setFechaDesde(desde);
    setFechaHasta(hasta);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
            mt: 2,
          }}
        >
          <Typography variant="h5">Eventos y Actividades Externas</Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Button variant="contained" onClick={() => navigate('/eventForm')}>
              Formulario
            </Button>

            <Button variant="outlined">Enviar formulario</Button>
          </Box>
        </Box>

        <Box
          sx={{
            width: '100%',
            bgcolor: '#fff',
            p: 2,
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              alignItems: 'center',
              justifyContent: {
                xs: 'center',
                sm: 'space-between',
              },
              gap: 1,
              mb: 2,
            }}
          >
            <Typography variant="h6">Periodo:</Typography>

            <ReportPeriodFilter
              fechaDesdeInicial={fechaDesde}
              fechaHastaInicial={fechaHasta}
              onAplicar={aplicarPeriodo}
            />
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Eventos
            </Typography>

            <EventsGrid rows={events} loading={loading} />
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Eventos por Sala
            </Typography>

            <EventsByRoomGrid rows={eventsByRoom} loading={loading} />
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
