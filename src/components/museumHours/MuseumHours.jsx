import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { API_URL } from '../../services/api';
import { authService } from '../../lib/auth';
import useNotifications from '../../components/hooks/notification/useNotifications';
const DIAS_SEMANA = [
  { nombre: 'Lunes', dia: 1 },
  { nombre: 'Martes', dia: 2 },
  { nombre: 'Miércoles', dia: 3 },
  { nombre: 'Jueves', dia: 4 },
  { nombre: 'Viernes', dia: 5 },
  { nombre: 'Sábado', dia: 6 },
  { nombre: 'Domingo', dia: 0 },
];

const horarioSchema = z
  .object({
    dia: z.number(),
    abierto: z.boolean(),
    desde: z.string(),
    hasta: z.string(),
  })
  .superRefine((horario, ctx) => {
    if (!horario.abierto) return;

    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!formatoHora.test(horario.desde)) {
      ctx.addIssue({
        code: 'custom',
        path: ['desde'],
        message: 'Ingresá una hora válida.',
      });
    }

    if (!formatoHora.test(horario.hasta)) {
      ctx.addIssue({
        code: 'custom',
        path: ['hasta'],
        message: 'Ingresá una hora válida.',
      });
    }

    if (
      formatoHora.test(horario.desde) &&
      formatoHora.test(horario.hasta) &&
      horario.desde >= horario.hasta
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['hasta'],
        message: 'Debe ser posterior a la hora de apertura.',
      });
    }
  });

const schema = z
  .object({
    horarios: z.array(horarioSchema),
  })
  .superRefine(({ horarios }, ctx) => {
    if (!horarios.some((horario) => horario.abierto)) {
      ctx.addIssue({
        code: 'custom',
        path: ['horarios'],
        message: 'Seleccioná al menos un día de apertura.',
      });
    }
  });

const valoresIniciales = {
  horarios: DIAS_SEMANA.map(({ dia }) => ({
    dia,
    abierto: false,
    desde: '09:00',
    hasta: '20:00',
  })),
};

export default function HorariosMuseo() {
  const [guardando, setGuardando] = useState(false);

  const notifications = useNotifications();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciales,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const horarios = watch('horarios');

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarHorariosMuseo = async () => {
      try {
        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/ConfiguracionHorarioMuseo/get-museum-hours`,
          {
            method: 'GET',
            headers: {
              Accept: '*/*',
            },
          }
        );

        if (!response.ok) {
          throw new Error('No se pudieron obtener los horarios del museo.');
        }

        const data = await response.json();

        const horariosGuardados = data.horarioAperturaList ?? [];

        const horariosFormulario = DIAS_SEMANA.map(({ dia }) => {
          const horarioGuardado = horariosGuardados.find(
            (horario) => Number(horario.dia) === dia
          );

          return {
            dia,
            abierto: Boolean(horarioGuardado),
            desde: horarioGuardado?.desde?.slice(0, 5) ?? '09:00',
            hasta: horarioGuardado?.hasta?.slice(0, 5) ?? '20:00',
          };
        });

        reset({
          horarios: horariosFormulario,
        });

        // Si también tenés un formulario para los días de cierre,
        // podés cargar data.diaCierreDtos en ese estado.
      } catch (error) {
        console.error('Error al cargar los horarios:', error);

        notifications.error(
          error.message || 'Ocurrió un error al cargar los horarios del museo.'
        );
      } finally {
        setCargando(false);
      }
    };

    cargarHorariosMuseo();
  }, [reset]);

  const onSubmit = async ({ horarios }) => {
    setGuardando(true);

    try {
      const datos = {
        HorariosApertura: horarios
          .filter((horario) => horario.abierto)
          .map(({ dia, desde, hasta }) => ({
            Dia: dia,
            Desde: `${desde}:00`,
            Hasta: `${hasta}:00`,
          })),
      };

      const response = await authService.authenticatedFetch(
        `${API_URL}/api/v1/ConfiguracionHorarioMuseo/set-museum-hours`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datos),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);

        throw new Error(
          errorBody?.message ||
            errorBody?.detail ||
            'No se pudo guardar la configuración.'
        );
      }

      notifications.success(
        'Los horarios del museo se actualizaron correctamente.'
      );
    } catch (error) {
      notifications.error(
        error.message || 'Ocurrió un error al guardar los horarios.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <Stack
        sx={{
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Horarios del museo
        </Typography>

        <Typography color="text.secondary">
          Configurá los días y horarios de apertura del museo.
        </Typography>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 1,
        }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack sx={{ gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Días de apertura
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Selecciona los días de apertura y definí sus horarios.
              </Typography>
            </Box>

            <Divider />

            {DIAS_SEMANA.map(({ nombre }, index) => {
              const abierto = horarios?.[index]?.abierto;

              return (
                <Box
                  key={nombre}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr 1fr',
                      sm: 'minmax(150px, 1.2fr) 1fr 1fr',
                    },
                    alignItems: 'center',
                    gap: 2,
                    py: 1,
                  }}
                >
                  <Box
                    sx={{
                      gridColumn: {
                        xs: '1 / -1',
                        sm: 'auto',
                      },
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...register(`horarios.${index}.abierto`)}
                          disabled={guardando}
                        />
                      }
                      label={<Typography fontWeight={500}>{nombre}</Typography>}
                    />
                  </Box>

                  <TextField
                    {...register(`horarios.${index}.desde`)}
                    label="Desde"
                    type="time"
                    size="small"
                    fullWidth
                    disabled={!abierto || guardando}
                    error={Boolean(errors.horarios?.[index]?.desde)}
                    helperText={errors.horarios?.[index]?.desde?.message}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />

                  <TextField
                    {...register(`horarios.${index}.hasta`)}
                    label="Hasta"
                    type="time"
                    size="small"
                    fullWidth
                    disabled={!abierto || guardando}
                    error={Boolean(errors.horarios?.[index]?.hasta)}
                    helperText={errors.horarios?.[index]?.hasta?.message}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                </Box>
              );
            })}

            {errors.horarios?.message && (
              <Alert severity="warning">{errors.horarios.message}</Alert>
            )}

            <Divider />

            <Stack
              sx={{
                flexDirection: {
                  xs: 'column',
                  sm: 'row',
                },
                justifyContent: 'flex-end',
                alignItems: {
                  xs: 'stretch',
                  sm: 'center',
                },
                gap: 2,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={guardando}
                startIcon={
                  guardando ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : undefined
                }
                sx={{
                  minWidth: 180,
                }}
              >
                {guardando ? 'Guardando...' : 'Guardar horarios'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
