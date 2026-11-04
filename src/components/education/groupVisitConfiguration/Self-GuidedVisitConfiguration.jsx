import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { authService } from '../../../lib/auth';
import { API_URL } from '../../../services/api';

const URL_CONFIGURACION = `${API_URL}/api/v1/ConfigVisitasAutoguiadas/get-settings-self-guided-tours`;

const URL_GUARDAR = `${API_URL}/api/v1/ConfigVisitasAutoguiadas/create-settings-self-guided-tours`;

const DIAS = [
  { dia: 1, nombre: 'Lunes' },
  { dia: 2, nombre: 'Martes' },
  { dia: 3, nombre: 'Miércoles' },
  { dia: 4, nombre: 'Jueves' },
  { dia: 5, nombre: 'Viernes' },
  { dia: 6, nombre: 'Sábado' },
  { dia: 0, nombre: 'Domingo' },
];

const horarioSchema = z
  .object({
    desde: z.string().min(1, 'Ingresá la hora de inicio'),
    hasta: z.string().min(1, 'Ingresá la hora de finalización'),
  })
  .refine((horario) => horario.hasta > horario.desde, {
    message: 'La hora de fin debe ser posterior al inicio',
    path: ['hasta'],
  });

const diaSchema = z.object({
  dia: z.number(),
  nombre: z.string(),
  turnos: z.array(horarioSchema),
});

const configuracionSchema = z
  .object({
    capacidadMaximaPorGrupo: z
      .number({ error: 'Ingresá la capacidad máxima por grupo' })
      .int('Debe ser un número entero')
      .positive('Debe ser mayor a cero'),

    duracionHoras: z
      .number()
      .int()
      .min(0, 'Las horas no pueden ser negativas')
      .max(23, 'Ingresá un valor de hasta 23 horas'),

    duracionMinutos: z
      .number()
      .int()
      .min(0)
      .max(59, 'Los minutos deben estar entre 0 y 59'),

    intervaloHoras: z
      .number()
      .int()
      .min(0, 'Las horas no pueden ser negativas')
      .max(23, 'Ingresá un valor de hasta 23 horas'),

    intervaloMinutos: z
      .number()
      .int()
      .min(0)
      .max(59, 'Los minutos deben estar entre 0 y 59'),

    visitasSimultaneasMaximas: z
      .number({ error: 'Ingresá el máximo de visitas simultáneas' })
      .int('Debe ser un número entero')
      .positive('Debe ser mayor a cero'),

    dias: z.array(diaSchema),
  })
  .superRefine((configuracion, ctx) => {
    const duracionTotal =
      configuracion.duracionHoras * 60 + configuracion.duracionMinutos;

    const intervaloTotal =
      configuracion.intervaloHoras * 60 + configuracion.intervaloMinutos;

    if (duracionTotal <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'La duración debe ser mayor a cero',
        path: ['duracionMinutos'],
      });
    }

    if (intervaloTotal <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'El intervalo entre reservas debe ser mayor a cero',
        path: ['intervaloMinutos'],
      });
    }

    if (duracionTotal > 0 && intervaloTotal > duracionTotal) {
      ctx.addIssue({
        code: 'custom',
        message:
          'El intervalo entre reservas no puede superar la duración de la visita',
        path: ['intervaloMinutos'],
      });
    }

    const tieneHorarios = configuracion.dias.some(
      (dia) => dia.turnos.length > 0
    );

    if (!tieneHorarios) {
      ctx.addIssue({
        code: 'custom',
        message: 'Configurá al menos un horario disponible',
        path: ['dias'],
      });
    }

    configuracion.dias.forEach((dia, diaIndex) => {
      dia.turnos.forEach((turno, turnoIndex) => {
        dia.turnos.forEach((otroTurno, otroIndex) => {
          if (otroIndex <= turnoIndex) return;

          const seSolapan =
            turno.desde < otroTurno.hasta && otroTurno.desde < turno.hasta;

          if (seSolapan) {
            ctx.addIssue({
              code: 'custom',
              message: 'Este horario se solapa con otro del mismo día',
              path: ['dias', diaIndex, 'turnos', otroIndex, 'desde'],
            });
          }
        });
      });
    });
  });

const crearHorario = () => ({
  desde: '09:30',
  hasta: '10:30',
});

const valoresIniciales = {
  capacidadMaximaPorGrupo: 25,
  duracionHoras: 1,
  duracionMinutos: 0,
  intervaloHoras: 0,
  intervaloMinutos: 30,
  visitasSimultaneasMaximas: 1,
  dias: DIAS.map((dia) => ({
    ...dia,
    turnos: [],
  })),
};

// Convierte un TimeSpan como "01:30:00" en horas y minutos.
const separarTiempo = (tiempo, horasPorDefecto, minutosPorDefecto) => {
  if (typeof tiempo !== 'string') {
    return {
      horas: horasPorDefecto,
      minutos: minutosPorDefecto,
    };
  }

  const [horas, minutos] = tiempo.split(':').map(Number);

  return {
    horas: Number.isFinite(horas) ? horas : horasPorDefecto,
    minutos: Number.isFinite(minutos) ? minutos : minutosPorDefecto,
  };
};

// Convierte "09:00:00" en "09:00", que es lo que espera el input type="time".
const formatoHoraInput = (hora) => {
  if (!hora) return '';

  return String(hora).slice(0, 5);
};

function DiaHorario({ dia, diaIndex, control, register, errors, disabled }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dias.${diaIndex}.turnos`,
  });

  const tieneHorarios = fields.length > 0;
  const erroresHorarios = errors?.dias?.[diaIndex]?.turnos;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack sx={{ gap: 2 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={tieneHorarios}
                disabled={disabled}
                onChange={(e) => {
                  if (e.target.checked) {
                    append(crearHorario());
                  } else {
                    remove(fields.map((_, index) => index));
                  }
                }}
              />
            }
            label={<Typography fontWeight={600}>{dia.nombre}</Typography>}
          />

          {tieneHorarios && (
            <Typography variant="body2" color="text.secondary">
              {fields.length} {fields.length === 1 ? 'horario' : 'horarios'}
            </Typography>
          )}
        </Stack>

        {tieneHorarios && (
          <Stack sx={{ gap: 2, pl: { xs: 0, sm: 5 } }}>
            {fields.map((field, index) => (
              <Stack
                key={field.id}
                direction={{ xs: 'column', sm: 'row' }}
                sx={{
                  alignItems: { xs: 'stretch', sm: 'flex-start' },
                  gap: 2,
                }}
              >
                <TextField
                  label="Desde"
                  type="time"
                  fullWidth
                  size="small"
                  disabled={disabled}
                  {...register(`dias.${diaIndex}.turnos.${index}.desde`)}
                  error={Boolean(erroresHorarios?.[index]?.desde)}
                  helperText={erroresHorarios?.[index]?.desde?.message}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />

                <TextField
                  label="Hasta"
                  type="time"
                  fullWidth
                  size="small"
                  disabled={disabled}
                  {...register(`dias.${diaIndex}.turnos.${index}.hasta`)}
                  error={Boolean(erroresHorarios?.[index]?.hasta)}
                  helperText={erroresHorarios?.[index]?.hasta?.message}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />

                <IconButton
                  color="error"
                  disabled={disabled}
                  aria-label={`Eliminar horario de ${dia.nombre}`}
                  onClick={() => remove(index)}
                  sx={{ mt: { xs: 0, sm: 0.5 } }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}

            <Box>
              <Button
                variant="outlined"
                disabled={disabled}
                startIcon={<AddIcon />}
                onClick={() => append(crearHorario())}
              >
                Agregar horario
              </Button>
            </Box>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default function SelfGuidedVisitsConfiguration() {
  const [errorGuardar, setErrorGuardar] = useState('');
  const [errorCargar, setErrorCargar] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(configuracionSchema),
    defaultValues: valoresIniciales,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        setErrorCargar('');

        const respuesta = await authService.authenticatedFetch(
          URL_CONFIGURACION,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!respuesta.ok) {
          const errorBody = await respuesta.json().catch(() => null);

          throw new Error(
            errorBody?.message ||
              errorBody?.detail ||
              'No se pudo cargar la configuración de visitas autoguiadas.'
          );
        }

        const resultado = await respuesta.json();

        // La respuesta del backend envuelve la configuración en "data".
        const configuracion = resultado.data;

        if (!configuracion) {
          throw new Error('La respuesta no contiene una configuración.');
        }

        const diasGuardados = configuracion.diasDisponibles ?? [];

        // Agrupamos los intervalos existentes por día de la semana.
        const diasFormulario = DIAS.map((dia) => ({
          ...dia,
          turnos: diasGuardados
            .filter((horario) => Number(horario.dia) === dia.dia)
            .map((horario) => ({
              desde: formatoHoraInput(horario.desde),
              hasta: formatoHoraInput(horario.hasta),
            })),
        }));

        const duracion = separarTiempo(configuracion.duracionVisita, 1, 0);

        const intervalo = separarTiempo(configuracion.intervaloReservas, 0, 30);

        reset({
          capacidadMaximaPorGrupo: configuracion.capacidadMaximaPorGrupo ?? 25,
          duracionHoras: duracion.horas,
          duracionMinutos: duracion.minutos,
          intervaloHoras: intervalo.horas,
          intervaloMinutos: intervalo.minutos,
          visitasSimultaneasMaximas:
            configuracion.visitasSimultaneasMaximas ?? 1,
          dias: diasFormulario,
        });
      } catch (error) {
        console.error('Error al cargar la configuración:', error);
        setErrorCargar(
          error.message || 'No se pudo cargar la configuración existente.'
        );
      } finally {
        setCargando(false);
      }
    };

    cargarConfiguracion();
  }, [reset]);

  const guardar = async (datos) => {
    setErrorGuardar('');
    setGuardado(false);
    setGuardando(true);

    const diasDisponibles = datos.dias.flatMap((dia) =>
      dia.turnos.map((turno) => ({
        dia: dia.dia,
        desde: `${turno.desde}:00`,
        hasta: `${turno.hasta}:00`,
      }))
    );

    const aTimeSpan = (horas, minutos) =>
      `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;

    const configuracion = {
      capacidadMaximaPorGrupo: datos.capacidadMaximaPorGrupo,
      duracionVisita: aTimeSpan(datos.duracionHoras, datos.duracionMinutos),
      intervaloReservas: aTimeSpan(
        datos.intervaloHoras,
        datos.intervaloMinutos
      ),
      visitasSimultaneasMaximas: datos.visitasSimultaneasMaximas,
      diasDisponibles,
    };

    try {
      const respuesta = await authService.authenticatedFetch(URL_GUARDAR, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(configuracion),
      });

      if (!respuesta.ok) {
        const errorBody = await respuesta.json().catch(() => null);

        throw new Error(
          errorBody?.message ||
            errorBody?.detail ||
            'No se pudo guardar la configuración.'
        );
      }

      setGuardado(true);
    } catch (error) {
      setErrorGuardar(error.message || 'No se pudo guardar la configuración.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack sx={{ gap: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Configuración de visitas autoguiadas
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Configurá los horarios disponibles, la duración y la capacidad de
            las visitas grupales autoguiadas.
          </Typography>
        </Box>

        {errorCargar && <Alert severity="error">{errorCargar}</Alert>}

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            component="form"
            onSubmit={handleSubmit(guardar)}
            sx={{ gap: 3 }}
          >
            <Box>
              <Typography variant="h6">
                Horarios de visitas autoguiadas
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Los horarios actuales aparecen cargados. Podés modificarlos,
                agregar otros intervalos o desactivar los días que no estén
                disponibles.
              </Typography>
            </Box>

            {errors.dias?.root?.message && (
              <Alert severity="error">{errors.dias.root.message}</Alert>
            )}

            {errors.dias?.message && (
              <Alert severity="error">{errors.dias.message}</Alert>
            )}

            {DIAS.map((dia, diaIndex) => (
              <DiaHorario
                key={dia.dia}
                dia={dia}
                diaIndex={diaIndex}
                control={control}
                register={register}
                errors={errors}
                disabled={guardando || Boolean(errorCargar)}
              />
            ))}

            <Divider />

            <Box>
              <Typography variant="h6">
                Capacidad y duración de las visitas
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Definí la cantidad máxima de personas por grupo, la duración de
                cada visita y el intervalo entre reservas.
              </Typography>
            </Box>

            <TextField
              label="Capacidad máxima por grupo"
              type="number"
              fullWidth
              disabled={guardando || Boolean(errorCargar)}
              {...register('capacidadMaximaPorGrupo', {
                valueAsNumber: true,
              })}
              error={Boolean(errors.capacidadMaximaPorGrupo)}
              helperText={errors.capacidadMaximaPorGrupo?.message}
              slotProps={{
                htmlInput: { min: 1, step: 1 },
              }}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Duración de la visita
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
                <TextField
                  label="Horas"
                  type="number"
                  fullWidth
                  disabled={guardando || Boolean(errorCargar)}
                  {...register('duracionHoras', {
                    valueAsNumber: true,
                  })}
                  error={Boolean(errors.duracionHoras)}
                  helperText={errors.duracionHoras?.message}
                  slotProps={{
                    htmlInput: { min: 0, max: 23, step: 1 },
                  }}
                />

                <TextField
                  label="Minutos"
                  type="number"
                  fullWidth
                  disabled={guardando || Boolean(errorCargar)}
                  {...register('duracionMinutos', {
                    valueAsNumber: true,
                  })}
                  error={Boolean(errors.duracionMinutos)}
                  helperText={errors.duracionMinutos?.message}
                  slotProps={{
                    htmlInput: { min: 0, max: 59, step: 1 },
                  }}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Intervalo entre reservas
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
                <TextField
                  label="Horas"
                  type="number"
                  fullWidth
                  disabled={guardando || Boolean(errorCargar)}
                  {...register('intervaloHoras', {
                    valueAsNumber: true,
                  })}
                  error={Boolean(errors.intervaloHoras)}
                  helperText={errors.intervaloHoras?.message}
                  slotProps={{
                    htmlInput: { min: 0, max: 23, step: 1 },
                  }}
                />

                <TextField
                  label="Minutos"
                  type="number"
                  fullWidth
                  disabled={guardando || Boolean(errorCargar)}
                  {...register('intervaloMinutos', {
                    valueAsNumber: true,
                  })}
                  error={Boolean(errors.intervaloMinutos)}
                  helperText={errors.intervaloMinutos?.message}
                  slotProps={{
                    htmlInput: { min: 0, max: 59, step: 1 },
                  }}
                />
              </Stack>
            </Box>

            <TextField
              label="Máximo de visitas simultáneas"
              type="number"
              fullWidth
              disabled={guardando || Boolean(errorCargar)}
              {...register('visitasSimultaneasMaximas', {
                valueAsNumber: true,
              })}
              error={Boolean(errors.visitasSimultaneasMaximas)}
              helperText={
                errors.visitasSimultaneasMaximas?.message ||
                'Cantidad máxima de visitas que pueden realizarse simultáneamente.'
              }
              slotProps={{
                htmlInput: { min: 1, step: 1 },
              }}
            />

            {errorGuardar && <Alert severity="error">{errorGuardar}</Alert>}

            {guardado && (
              <Alert severity="success">
                Configuración de visitas autoguiadas guardada correctamente.
              </Alert>
            )}

            <Divider />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{
                justifyContent: 'flex-end',
                gap: 2,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={guardando || Boolean(errorCargar)}
                startIcon={
                  guardando ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : undefined
                }
              >
                {guardando ? 'Guardando...' : 'Guardar configuración'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
