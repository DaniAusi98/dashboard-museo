import dayjs from 'dayjs';
import 'dayjs/locale/es';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Popover,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';

const GuideDaySchedule = ({
  anchorEl,
  selectedDate,
  guias = [],
  onClose,
  onAgregarAusencia,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const open = Boolean(anchorEl && selectedDate);

  const fechaSeleccionada = selectedDate
    ? dayjs(selectedDate).format('YYYY-MM-DD')
    : null;

  const fechaFormateada = selectedDate
    ? dayjs(selectedDate).locale('es').format('DD/MM/YYYY')
    : '';

  // DayOfWeek de .NET: domingo = 0, lunes = 1, ..., sábado = 6.
  const diaSeleccionado = selectedDate ? dayjs(selectedDate).day() : null;

  const formatearHora = (hora) => hora?.slice(0, 5) ?? '';

  const guiasDelDia = guias
    .map((guia) => ({
      ...guia,
      nombreCompleto:
        [guia.nombre, guia.apellido].filter(Boolean).join(' ') ||
        'Guía sin nombre',
      horarioDelDia: (guia.horariosLaborales ?? []).filter(
        (horario) => horario.diaAsignado === diaSeleccionado
      ),
      turnos: (guia.fechasDisponiblesDtos ?? []).filter(
        (turno) => turno.fecha === fechaSeleccionada
      ),
    }))
    .filter((guia) => guia.turnos.length > 0);

  const getEstadoGuia = (turnos) => {
    const disponibles = turnos.filter((turno) => turno.disponible).length;

    if (disponibles === turnos.length) {
      return { label: 'Disponible', color: 'success' };
    }

    if (disponibles > 0) {
      return { label: 'Disponibilidad parcial', color: 'warning' };
    }

    return { label: 'No disponible', color: 'error' };
  };

  const getNombreTurno = (turno, index) => {
    if (turno.nombreTurno) return turno.nombreTurno;
    return `Turno ${index + 1}`;
  };

  const contenido = (
    <Stack spacing={2}>
      {guiasDelDia.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          No hay guías con turnos configurados para esta fecha.
        </Typography>
      ) : (
        guiasDelDia.map((guia) => {
          const estado = getEstadoGuia(guia.turnos);

          return (
            <Box
              key={guia.guiaId}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Avatar>{guia.nombreCompleto.charAt(0).toUpperCase()}</Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={600}>
                    {guia.nombreCompleto}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Guía
                  </Typography>

                  {guia.horarioDelDia.length > 0 ? (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ mt: 0.5 }}
                    >
                      <AccessTimeIcon
                        sx={{ fontSize: 16, color: 'text.secondary' }}
                      />

                      <Typography variant="body2" color="text.secondary">
                        {guia.horarioDelDia
                          .map(
                            (horario) =>
                              `${formatearHora(horario.horaInicio)}–${formatearHora(horario.horaFin)}`
                          )
                          .join(', ')}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Sin horario laboral configurado
                    </Typography>
                  )}
                </Box>

                <Chip size="small" label={estado.label} color={estado.color} />
              </Stack>

              <Stack spacing={1.5}>
                {guia.turnos.map((turno, index) => (
                  <Stack
                    key={`${turno.fecha}-${turno.horaInicio}-${index}`}
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {getNombreTurno(turno, index)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {formatearHora(turno.horaInicio)} –{' '}
                        {formatearHora(turno.horaFin)}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      variant="outlined"
                      color={turno.disponible ? 'success' : 'error'}
                      label={turno.disponible ? 'Disponible' : 'No disponible'}
                    />
                  </Stack>
                ))}
              </Stack>

              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => onAgregarAusencia?.(guia)}
              >
                Registrar ausencia
              </Button>
            </Box>
          );
        })
      )}
    </Stack>
  );

  if (isMobile) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        aria-labelledby="guide-day-dialog-title"
      >
        <DialogTitle id="guide-day-dialog-title" sx={{ pr: 7 }}>
          <Typography
            component="span"
            variant="h6"
            fontWeight={700}
            display="block"
          >
            Disponibilidad de guías
          </Typography>

          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            display="block"
          >
            {fechaFormateada}
          </Typography>

          <IconButton
            aria-label="Cerrar"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 2 }}>{contenido}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 560,
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: '75vh',
            overflowY: 'auto',
            p: 2,
            borderRadius: 2,
          },
        },
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Disponibilidad de guías
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {fechaFormateada}
          </Typography>
        </Box>

        <Divider />

        {contenido}
      </Stack>
    </Popover>
  );
};

export default GuideDaySchedule;
