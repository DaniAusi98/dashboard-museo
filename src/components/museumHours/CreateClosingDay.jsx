import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { API_URL } from '../../services/api';
import { authService } from '../../lib/auth';
import useNotifications from '../../components/hooks/notification/useNotifications';

const MOTIVOS_CIERRE = [
  { valor: 0, label: 'Mantenimiento y refacciones' },
  { valor: 1, label: 'Feriado' },
  { valor: 2, label: 'Días festivos' },
  { valor: 3, label: 'Eventos institucionales' },
  { valor: 4, label: 'Otro' },
];

const schema = z
  .object({
    fecha: z.string().min(1, 'Seleccioná la fecha desde.'),
    fechaHasta: z.string(),
    motivo: z.string().min(1, 'Seleccioná el motivo del cierre.'),
    observaciones: z.string().trim().min(1, 'Ingresá las observaciones.'),
  })
  .superRefine(({ fecha, fechaHasta }, ctx) => {
    if (fechaHasta && fechaHasta < fecha) {
      ctx.addIssue({
        code: 'custom',
        path: ['fechaHasta'],
        message: 'La fecha hasta debe ser igual o posterior a la fecha desde.',
      });
    }
  });

const valoresIniciales = {
  fecha: '',
  fechaHasta: '',
  motivo: '',
  observaciones: '',
};

export default function CreateClosingDay() {
  const [guardando, setGuardando] = useState(false);
  const notifications = useNotifications();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciales,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (datos) => {
    setGuardando(true);

    try {
      const body = {
        Fecha: `${datos.fecha}T00:00:00`,
        FechaHasta: datos.fechaHasta ? `${datos.fechaHasta}T00:00:00` : null,
        Motivo: Number(datos.motivo),
        Observaciones: datos.observaciones.trim(),
      };

      const response = await authService.authenticatedFetch(
        `${API_URL}/api/v1/ConfiguracionHorarioMuseo/create-cl-day`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);

        throw new Error(
          errorBody?.message ||
            errorBody?.detail ||
            'No se pudo crear el día de cierre.'
        );
      }

      notifications.success('El día de cierre se creó correctamente.');
      reset(valoresIniciales);
    } catch (error) {
      notifications.error(
        error.message || 'Ocurrió un error al crear el día de cierre.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: 'auto',
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack sx={{ gap: 1, mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Crear día de cierre
        </Typography>

        <Typography color="text.secondary">
          Configurá las fechas y el motivo de cierre del museo.
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
                Datos del cierre
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Completá los campos para registrar el cierre.
              </Typography>
            </Box>

            <Divider />

            <Controller
              name="fecha"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Fecha desde"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(newValue) => {
                    field.onChange(
                      newValue && newValue.isValid()
                        ? newValue.format('YYYY-MM-DD')
                        : ''
                    );
                  }}
                  format="DD/MM/YYYY"
                  disabled={guardando}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: Boolean(errors.fecha),
                      helperText: errors.fecha?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              name="fechaHasta"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Fecha hasta"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(newValue) => {
                    field.onChange(
                      newValue && newValue.isValid()
                        ? newValue.format('YYYY-MM-DD')
                        : ''
                    );
                  }}
                  format="DD/MM/YYYY"
                  disabled={guardando}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.fechaHasta),
                      helperText:
                        errors.fechaHasta?.message ||
                        'Opcional. Completala solo si el cierre dura más de un día.',
                    },
                  }}
                />
              )}
            />

            <Controller
              name="motivo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Motivo del cierre"
                  fullWidth
                  required
                  disabled={guardando}
                  error={Boolean(errors.motivo)}
                  helperText={errors.motivo?.message}
                >
                  {MOTIVOS_CIERRE.map(({ valor, label }) => (
                    <MenuItem key={valor} value={String(valor)}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <TextField
              {...register('observaciones')}
              label="Observaciones"
              fullWidth
              required
              multiline
              minRows={3}
              disabled={guardando}
              error={Boolean(errors.observaciones)}
              helperText={errors.observaciones?.message}
            />

            <Divider />

            <Stack
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'flex-end',
                alignItems: { xs: 'stretch', sm: 'center' },
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
                sx={{ minWidth: 180 }}
              >
                {guardando ? 'Guardando...' : 'Guardar día de cierre'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
