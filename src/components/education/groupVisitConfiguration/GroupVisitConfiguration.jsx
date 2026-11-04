import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
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

const URL_CONFIGURACION = `${API_URL}/api/v1/ConfiguracionVisitasGrupalesGuiadas`;

const DIAS = [
  { dia: 1, nombre: 'Lunes' },
  { dia: 2, nombre: 'Martes' },
  { dia: 3, nombre: 'Miércoles' },
  { dia: 4, nombre: 'Jueves' },
  { dia: 5, nombre: 'Viernes' },
  { dia: 6, nombre: 'Sábado' },
  { dia: 0, nombre: 'Domingo' },
];

const turnoSchema = z
  .object({
    desde: z.string().min(1, 'Ingresá la hora de inicio'),
    hasta: z.string().min(1, 'Ingresá la hora de finalización'),
  })
  .refine((turno) => turno.hasta > turno.desde, {
    message: 'La hora de fin debe ser posterior al inicio',
    path: ['hasta'],
  });

const diaSchema = z.object({
  dia: z.number(),
  nombre: z.string(),
  turnos: z.array(turnoSchema),
});

const configuracionSchema = z
  .object({
    capacidadPorGuia: z
      .number({ error: 'Ingresá la capacidad por guía' })
      .int('Debe ser un número entero')
      .positive('Debe ser mayor a cero'),

    capacidadMaximaPorTurno: z
      .number({ error: 'Ingresá la capacidad máxima por turno' })
      .int('Debe ser un número entero')
      .positive('Debe ser mayor a cero'),

    maximoVisitasSimultaneas: z
      .number({ error: 'Ingresá el máximo de visitas simultáneas' })
      .int('Debe ser un número entero')
      .positive('Debe ser mayor a cero'),

    dias: z.array(diaSchema),
  })
  .superRefine((configuracion, ctx) => {
    if (
      configuracion.capacidadMaximaPorTurno < configuracion.capacidadPorGuia
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          'La capacidad máxima por turno no puede ser menor que la capacidad por guía',
        path: ['capacidadMaximaPorTurno'],
      });
    }

    const tieneTurnos = configuracion.dias.some((dia) => dia.turnos.length > 0);

    if (!tieneTurnos) {
      ctx.addIssue({
        code: 'custom',
        message: 'Configurá al menos un turno disponible',
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
              message: 'Este turno se solapa con otro horario',
              path: ['dias', diaIndex, 'turnos', otroIndex, 'desde'],
            });
          }
        });
      });
    });
  });

const crearTurno = () => ({
  desde: '09:30',
  hasta: '10:30',
});

const valoresIniciales = {
  capacidadPorGuia: 25,
  capacidadMaximaPorTurno: 50,
  maximoVisitasSimultaneas: 1,
  dias: DIAS.map((dia) => ({
    ...dia,
    turnos: [],
  })),
};

const formatoHoraInput = (hora) => {
  if (!hora) return '';
  return String(hora).slice(0, 5);
};

function DiaHorario({ dia, diaIndex, control, register, errors, disabled }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dias.${diaIndex}.turnos`,
  });

  const turnos = useWatch({
    control,
    name: `dias.${diaIndex}.turnos`,
  });

  const tieneTurnos = fields.length > 0;
  const erroresTurnos = errors?.dias?.[diaIndex]?.turnos;

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
                checked={tieneTurnos}
                disabled={disabled}
                onChange={(e) => {
                  if (e.target.checked) {
                    append(crearTurno());
                  } else {
                    remove(fields.map((_, index) => index));
                  }
                }}
              />
            }
            label={<Typography fontWeight={600}>{dia.nombre}</Typography>}
          />

          {tieneTurnos && (
            <Typography variant="body2" color="text.secondary">
              {fields.length} {fields.length === 1 ? 'turno' : 'turnos'}
            </Typography>
          )}
        </Stack>

        {tieneTurnos && (
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
                  error={Boolean(erroresTurnos?.[index]?.desde)}
                  helperText={erroresTurnos?.[index]?.desde?.message}
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
                  error={Boolean(erroresTurnos?.[index]?.hasta)}
                  helperText={erroresTurnos?.[index]?.hasta?.message}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />

                <IconButton
                  color="error"
                  disabled={disabled}
                  aria-label={`Eliminar turno de ${dia.nombre}`}
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
                onClick={() => append(crearTurno())}
              >
                Agregar turno
              </Button>
            </Box>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default function GuidedVisitsConfiguration() {
  const [errorCargar, setErrorCargar] = useState('');
  const [errorGuardar, setErrorGuardar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

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
              Accept: '*/*',
            },
          }
        );

        if (!respuesta.ok) {
          const errorBody = await respuesta.json().catch(() => null);

          throw new Error(
            errorBody?.message ||
              errorBody?.detail ||
              'No se pudo cargar la configuración de visitas guiadas.'
          );
        }

        const resultado = await respuesta.json();
        const configuracion = resultado.data;

        if (!configuracion) {
          throw new Error('La respuesta no contiene una configuración.');
        }

        const diasGuardados = configuracion.diasDisponibles ?? [];

        const diasFormulario = DIAS.map((dia) => ({
          ...dia,
          turnos: diasGuardados
            .filter((turno) => Number(turno.dia) === dia.dia)
            .map((turno) => ({
              desde: formatoHoraInput(turno.desde),
              hasta: formatoHoraInput(turno.hasta),
            })),
        }));

        reset({
          capacidadPorGuia: configuracion.capacidadPorGuia ?? 25,
          capacidadMaximaPorTurno: configuracion.capacidadMaximaPorTurno ?? 50,
          maximoVisitasSimultaneas: configuracion.maximoVisitasSimultaneas ?? 1,
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

    const configuracion = {
      capacidadPorGuia: datos.capacidadPorGuia,
      capacidadMaximaPorTurno: datos.capacidadMaximaPorTurno,
      maximoVisitasSimultaneas: datos.maximoVisitasSimultaneas,
      diasDisponibles,
    };

    try {
      const respuesta = await authService.authenticatedFetch(
        URL_CONFIGURACION,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(configuracion),
        }
      );

      if (!respuesta.ok) {
        const errorBody = await respuesta.json().catch(() => null);

        throw new Error(
          errorBody?.message ||
            errorBody?.detail ||
            `Error al guardar la configuración (${respuesta.status})`
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
            Configuración de visitas grupales
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Configurá los horarios y las capacidades de las visitas grupales
            guiadas.
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
              <Typography variant="h6">Horarios de visitas guiadas</Typography>

              <Typography variant="body2" color="text.secondary">
                Los turnos existentes se cargan automáticamente. Podés
                modificarlos, agregar otros o desactivar los días que no estén
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
              <Typography variant="h6">Capacidad de las visitas</Typography>

              <Typography variant="body2" color="text.secondary">
                Definí cuántas personas puede atender cada guía y los límites de
                cada turno.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
              <TextField
                label="Capacidad por guía"
                type="number"
                fullWidth
                disabled={guardando || Boolean(errorCargar)}
                {...register('capacidadPorGuia', {
                  valueAsNumber: true,
                })}
                error={Boolean(errors.capacidadPorGuia)}
                helperText={errors.capacidadPorGuia?.message}
                slotProps={{
                  htmlInput: { min: 1, step: 1 },
                }}
              />

              <TextField
                label="Capacidad máxima por turno"
                type="number"
                fullWidth
                disabled={guardando || Boolean(errorCargar)}
                {...register('capacidadMaximaPorTurno', {
                  valueAsNumber: true,
                })}
                error={Boolean(errors.capacidadMaximaPorTurno)}
                helperText={errors.capacidadMaximaPorTurno?.message}
                slotProps={{
                  htmlInput: { min: 1, step: 1 },
                }}
              />
            </Stack>

            <TextField
              label="Máximo de visitas simultáneas"
              type="number"
              fullWidth
              disabled={guardando || Boolean(errorCargar)}
              {...register('maximoVisitasSimultaneas', {
                valueAsNumber: true,
              })}
              error={Boolean(errors.maximoVisitasSimultaneas)}
              helperText={
                errors.maximoVisitasSimultaneas?.message ||
                'Cantidad máxima de reservas grupales simultáneas.'
              }
              slotProps={{
                htmlInput: { min: 1, step: 1 },
              }}
            />

            {errorGuardar && <Alert severity="error">{errorGuardar}</Alert>}

            {guardado && (
              <Alert severity="success">
                Configuración guardada correctamente.
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
