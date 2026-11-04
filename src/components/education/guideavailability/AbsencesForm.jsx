import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';

import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Radio,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { API_URL } from '../../../services/api';

const schema = z
  .object({
    GuiaId: z.string().min(1, 'Seleccione un guía'),
    FechaDesde: z.string().min(1, 'Seleccione la fecha de inicio'),
    HoraDesde: z.string().min(1, 'Seleccione la hora de inicio'),
    FechaHasta: z.string().min(1, 'Seleccione la fecha de fin'),
    HoraHasta: z.string().min(1, 'Seleccione la hora de fin'),
    Motivo: z.string().trim().min(1, 'Indique el motivo de la ausencia'),
  })
  .refine(
    (data) =>
      dayjs(`${data.FechaHasta}T${data.HoraHasta}`).isAfter(
        dayjs(`${data.FechaDesde}T${data.HoraDesde}`)
      ) ||
      dayjs(`${data.FechaHasta}T${data.HoraHasta}`).isSame(
        dayjs(`${data.FechaDesde}T${data.HoraDesde}`)
      ),
    {
      message: 'La fecha y hora de fin no pueden ser anteriores al inicio',
      path: ['HoraHasta'],
    }
  );

export default function FormularioAusenciaGuia() {
  const [guias, setGuias] = useState([]);
  const [cargandoGuias, setCargandoGuias] = useState(true);
  const [errorGuias, setErrorGuias] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');
  const [exito, setExito] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      GuiaId: '',
      FechaDesde: '',
      HoraDesde: '09:00',
      FechaHasta: '',
      HoraHasta: '14:00',
      Motivo: '',
    },
  });

  const guiaSeleccionado = watch('GuiaId');
  const fechaDesde = watch('FechaDesde');
  const horaDesde = watch('HoraDesde');
  const fechaHasta = watch('FechaHasta');
  const horaHasta = watch('HoraHasta');

  useEffect(() => {
    const cargarGuias = async () => {
      try {
        const token = localStorage.getItem('auth_token');

        const response = await fetch(
          `${API_URL}/api/v1/Guia/getGuidesActives?pageIndex=1&pageSize=100`,
          {
            headers: {
              Accept: 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (!response.ok) {
          throw new Error('No se pudieron cargar los guías.');
        }

        const resultado = await response.json();
        setGuias(resultado.data ?? []);
      } catch (error) {
        setErrorGuias(error.message || 'Error al cargar los guías.');
      } finally {
        setCargandoGuias(false);
      }
    };

    cargarGuias();
  }, []);

  const onSubmit = async (data) => {
    setGuardando(true);
    setErrorGuardar('');
    setExito('');

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${API_URL}/api/v1/Guia/NoDisponibilidadGuia`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            guiaId: data.GuiaId,
            fechaDesde: `${data.FechaDesde}T${data.HoraDesde}:00`,
            fechaHasta: `${data.FechaHasta}T${data.HoraHasta}:00`,
            motivo: data.Motivo,
          }),
        }
      );

      const resultado = await response.json().catch(() => null);

      if (!response.ok || resultado?.success === false) {
        throw new Error(
          resultado?.message || 'No se pudo registrar la ausencia.'
        );
      }

      setExito('La ausencia se registró correctamente.');
      reset();
    } catch (error) {
      setErrorGuardar(error.message || 'Error al registrar la ausencia.');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarFecha = (campo, valor) => {
    setValue(campo, valor?.isValid() ? valor.format('YYYY-MM-DD') : '', {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const cambiarHora = (campo, valor) => {
    setValue(campo, valor?.isValid() ? valor.format('HH:mm') : '', {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Stack sx={{ gap: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Registrar ausencia de guía
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Seleccioná un guía y especificá el período de ausencia.
            </Typography>
          </Box>

          <Divider />

          <FormControl error={!!errors.GuiaId} component="fieldset">
            <FormLabel
              component="legend"
              sx={{
                mb: 1,
                color: 'text.primary',
                fontWeight: 600,
              }}
            >
              Seleccionar guía
            </FormLabel>

            {cargandoGuias ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : errorGuias ? (
              <Alert severity="error">{errorGuias}</Alert>
            ) : guias.length === 0 ? (
              <Alert severity="info">No hay guías activos.</Alert>
            ) : (
              <Paper
                variant="outlined"
                sx={{ maxHeight: 320, overflowY: 'auto' }}
              >
                <List disablePadding>
                  {guias.map(({ guia }) => (
                    <ListItemButton
                      key={guia.id}
                      selected={guiaSeleccionado === guia.id}
                      onClick={() =>
                        setValue('GuiaId', guia.id, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      sx={{
                        gap: 1.5,
                        py: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(193, 17, 59, 0.08)',
                        },
                        '&.Mui-selected:hover': {
                          backgroundColor: 'rgba(193, 17, 59, 0.14)',
                        },
                      }}
                    >
                      <Radio
                        checked={guiaSeleccionado === guia.id}
                        value={guia.id}
                        sx={{
                          color: '#9CA3AF',
                          '&.Mui-checked': { color: '#c1113b' },
                        }}
                      />
                      <Avatar
                        sx={{
                          bgcolor: '#F3E3E8',
                          color: '#c1113b',
                          fontWeight: 600,
                        }}
                      >
                        {guia.nombre?.charAt(0)?.toUpperCase() || 'G'}
                      </Avatar>

                      <ListItemText
                        primary={`${guia.nombre} ${guia.apellido}`.trim()}
                        secondary={
                          <Stack sx={{ gap: 0.3, mt: 0.5 }}>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ overflowWrap: 'anywhere' }}
                            >
                              {guia.email}
                            </Typography>

                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {guia.telefono}
                            </Typography>
                          </Stack>
                        }
                        slotProps={{
                          secondary: {
                            component: 'div',
                          },
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}

            {errors.GuiaId && (
              <FormHelperText>{errors.GuiaId.message}</FormHelperText>
            )}
          </FormControl>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack sx={{ gap: 2.5 }}>
              <Typography fontWeight={600}>Período de ausencia</Typography>

              <Typography variant="body2" color="text.secondary">
                Inicio
              </Typography>

              <Stack
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <DatePicker
                  label="Fecha desde"
                  format="DD/MM/YYYY"
                  value={fechaDesde ? dayjs(fechaDesde) : null}
                  onChange={(value) => cambiarFecha('FechaDesde', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.FechaDesde,
                      helperText: errors.FechaDesde?.message,
                    },
                  }}
                />

                <TimePicker
                  label="Hora desde"
                  ampm={false}
                  format="HH:mm"
                  value={horaDesde ? dayjs(`2000-01-01T${horaDesde}`) : null}
                  onChange={(value) => cambiarHora('HoraDesde', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.HoraDesde,
                      helperText: errors.HoraDesde?.message,
                    },
                  }}
                />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Fin
              </Typography>

              <Stack
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <DatePicker
                  label="Fecha hasta"
                  format="DD/MM/YYYY"
                  minDate={fechaDesde ? dayjs(fechaDesde) : undefined}
                  value={fechaHasta ? dayjs(fechaHasta) : null}
                  onChange={(value) => cambiarFecha('FechaHasta', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.FechaHasta,
                      helperText: errors.FechaHasta?.message,
                    },
                  }}
                />

                <TimePicker
                  label="Hora hasta"
                  ampm={false}
                  format="HH:mm"
                  value={horaHasta ? dayjs(`2000-01-01T${horaHasta}`) : null}
                  onChange={(value) => cambiarHora('HoraHasta', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.HoraHasta,
                      helperText: errors.HoraHasta?.message,
                    },
                  }}
                />
              </Stack>

              <TextField
                {...register('Motivo')}
                label="Motivo de la ausencia"
                placeholder="Ej.: licencia, vacaciones..."
                multiline
                minRows={3}
                fullWidth
                required
                error={!!errors.Motivo}
                helperText={errors.Motivo?.message}
              />

              {errorGuardar && <Alert severity="error">{errorGuardar}</Alert>}

              {exito && <Alert severity="success">{exito}</Alert>}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 1,
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={guardando || cargandoGuias || guias.length === 0}
                  sx={{
                    bgcolor: '#c1113b',
                    '&:hover': { bgcolor: '#9f1032' },
                    minWidth: 180,
                  }}
                >
                  {guardando ? (
                    <CircularProgress size={23} color="inherit" />
                  ) : (
                    'Registrar ausencia'
                  )}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </LocalizationProvider>
  );
}
