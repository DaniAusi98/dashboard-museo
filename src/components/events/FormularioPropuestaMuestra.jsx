import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { authService } from '../../lib/auth';
import useNotifications from '../../components/hooks/notification/useNotifications';
import { API_URL } from '../../../src/services/api';

import EventAvailabilityCalendar from '../events/EventAvailabilityCalendar';

import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  TextField,
  Typography,
  Stack,
} from '@mui/material';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// =========================
// VALIDACIONES
// =========================

const schema = z.object({
  NombreApellidoResponsable: z.string().min(3, 'Mínimo 3 caracteres'),

  Telefono: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(15, 'Máximo 15 caracteres'),

  EmailResponsable: z.string().email('Formato de email inválido'),

  TituloPropuesta: z.string().min(1, 'Ingrese el título de la muestra'),

  Inicio: z.string().min(1, 'Seleccione un horario'),

  Fin: z.string().min(1, 'Seleccione un horario'),

  SalasIds: z.array(z.string()).min(1, 'Seleccione al menos una sala'),

  LogisticaMuestraTemporalDto: z
    .object({
      FechaMontaje: z.string().min(1, 'Seleccione la fecha'),
      HoraMontaje: z.string().min(1, 'Seleccione la hora'),

      FechaMontajeHasta: z.string().min(1, 'Seleccione la fecha'),
      HoraMontajeHasta: z.string().min(1, 'Seleccione la hora'),

      FechaDesmontaje: z.string().min(1, 'Seleccione la fecha'),
      HoraDesmontaje: z.string().min(1, 'Seleccione la hora'),

      FechaDesmontajeHasta: z.string().min(1, 'Seleccione la fecha'),
      HoraDesmontajeHasta: z.string().min(1, 'Seleccione la hora'),
    })
    .superRefine((data, ctx) => {
      // Combinar fecha y hora para comparar
      const montajeInicio = `${data.FechaMontaje}T${data.HoraMontaje}`;
      const montajeFin = `${data.FechaMontajeHasta}T${data.HoraMontajeHasta}`;

      const desmontajeInicio = `${data.FechaDesmontaje}T${data.HoraDesmontaje}`;
      const desmontajeFin = `${data.FechaDesmontajeHasta}T${data.HoraDesmontajeHasta}`;

      // Validar período de montaje
      if (
        data.FechaMontaje &&
        data.HoraMontaje &&
        data.FechaMontajeHasta &&
        data.HoraMontajeHasta &&
        montajeInicio > montajeFin
      ) {
        ctx.addIssue({
          code: 'custom',
          message:
            'El inicio del montaje no puede ser posterior a su finalización',
          path: ['FechaMontajeHasta'],
        });
      }

      // Validar período de desmontaje
      if (
        data.FechaDesmontaje &&
        data.HoraDesmontaje &&
        data.FechaDesmontajeHasta &&
        data.HoraDesmontajeHasta &&
        desmontajeInicio > desmontajeFin
      ) {
        ctx.addIssue({
          code: 'custom',
          message:
            'El inicio del desmontaje no puede ser posterior a su finalización',
          path: ['FechaDesmontajeHasta'],
        });
      }

      // El desmontaje debe comenzar después de finalizar el montaje
      if (
        data.FechaMontajeHasta &&
        data.HoraMontajeHasta &&
        data.FechaDesmontaje &&
        data.HoraDesmontaje &&
        montajeFin >= desmontajeInicio
      ) {
        ctx.addIssue({
          code: 'custom',
          message:
            'El desmontaje debe comenzar después de finalizar el montaje',
          path: ['FechaDesmontaje'],
        });
      }
    }),
});

export default function FormularioPropuestaMuestra() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const calendarRef = useRef(null);

  const [salas, setSalas] = useState([]);
  const [loadingSalas, setLoadingSalas] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),

    mode: 'onSubmit',
    reValidateMode: 'onChange',

    defaultValues: {
      NombreApellidoResponsable: '',
      Telefono: '',
      EmailResponsable: '',
      TituloPropuesta: '',
      Inicio: '',
      Fin: '',
      SalasIds: [],

      LogisticaMuestraTemporalDto: {
        FechaMontaje: '',
        HoraMontaje: '',
        FechaMontajeHasta: '',
        HoraMontajeHasta: '',
        FechaDesmontaje: '',
        HoraDesmontaje: '',
        FechaDesmontajeHasta: '',
        HoraDesmontajeHasta: '',
      },
    },
  });

  const salasIds = watch('SalasIds');
  const inicio = watch('Inicio');
  const fin = watch('Fin');

  // =========================
  // OBTENER SALAS
  // =========================

  useEffect(() => {
    const obtenerSalas = async () => {
      setLoadingSalas(true);

      try {
        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/eventos/salas-disponibles-eventos`,
          {
            method: 'GET',
          }
        );

        if (!response.ok) {
          throw new Error('Error al obtener las salas');
        }

        const result = await response.json();

        setSalas(result?.data?.items ?? []);
      } catch (error) {
        console.error('Error obteniendo salas:', error);

        notifications.error('No se pudieron obtener las salas.');

        setSalas([]);
      } finally {
        setLoadingSalas(false);
      }
    };

    obtenerSalas();
  }, []);

  // =========================
  // CAMBIAR SALAS
  // =========================

  const handleSalaChange = (salaId) => {
    const value = salasIds ?? [];

    const nuevasSalas = value.includes(salaId)
      ? value.filter((id) => id !== salaId)
      : [...value, salaId];

    setValue('SalasIds', nuevasSalas, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // La disponibilidad anterior deja de ser válida.
    setValue('Inicio', '', { shouldValidate: true });
    setValue('Fin', '', { shouldValidate: true });
  };

  // =========================
  // CONFIGURACIÓN DEL CALENDARIO
  // =========================

  const handleEventConfigurationChange = (configuracion) => {
    const inicio =
      configuracion.fechaInicio && configuracion.horaInicio
        ? `${configuracion.fechaInicio}T${configuracion.horaInicio}`
        : '';

    const fin =
      configuracion.fechaFin && configuracion.horaFin
        ? `${configuracion.fechaFin}T${configuracion.horaFin}`
        : '';

    setValue('Inicio', inicio, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue('Fin', fin, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // =========================
  // SUBMIT
  // =========================

  const onSubmit = async (data) => {
    const payload = {
      NombreApellidoResponsable: data.NombreApellidoResponsable,
      EmailResponsable: data.EmailResponsable,
      Telefono: data.Telefono,
      TituloPropuesta: data.TituloPropuesta,

      LogisticaMuestraTemporalDto: {
        FechaMontaje: `${data.LogisticaMuestraTemporalDto.FechaMontaje}T${data.LogisticaMuestraTemporalDto.HoraMontaje}`,

        FechaMontajeHasta: `${data.LogisticaMuestraTemporalDto.FechaMontajeHasta}T${data.LogisticaMuestraTemporalDto.HoraMontajeHasta}`,

        FechaDesmontaje: `${data.LogisticaMuestraTemporalDto.FechaDesmontaje}T${data.LogisticaMuestraTemporalDto.HoraDesmontaje}`,

        FechaDesmontajeHasta: `${data.LogisticaMuestraTemporalDto.FechaDesmontajeHasta}T${data.LogisticaMuestraTemporalDto.HoraDesmontajeHasta}`,
      },

      Inicio: data.Inicio,
      Fin: data.Fin,
      SalasIds: data.SalasIds,
    };

    try {
      const response = await authService.authenticatedFetch(
        `${API_URL}/api/v1/PropuestaEvento/crear-propuesta-muestra`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(errorData?.message || 'Error al crear la propuesta');
      }

      reset();

      notifications.success('Propuesta de muestra creada correctamente');

      navigate('/eventProposals');
    } catch (error) {
      console.error('Error al crear la propuesta:', error);

      notifications.error(error.message || 'No se pudo crear la propuesta.');
    }
  };

  const onError = (errors) => {
    console.log('SUBMIT ERROR', errors);
  };

  // =========================
  // RENDER
  // =========================

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit, onError)}
        sx={{
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: { xs: 2, sm: 4 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Formulario de Propuesta de Muestra Temporal
        </Typography>

        {/* RESPONSABLE */}

        <Typography variant="h5" sx={{ mb: 1 }}>
          Datos del responsable de la muestra
        </Typography>

        <TextField
          label="Nombre y apellido"
          fullWidth
          margin="normal"
          {...register('NombreApellidoResponsable')}
          error={!!errors.NombreApellidoResponsable}
          helperText={errors.NombreApellidoResponsable?.message}
        />

        <TextField
          label="Teléfono"
          fullWidth
          margin="normal"
          {...register('Telefono')}
          error={!!errors.Telefono}
          helperText={errors.Telefono?.message}
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          {...register('EmailResponsable')}
          error={!!errors.EmailResponsable}
          helperText={errors.EmailResponsable?.message}
        />

        {/* DATOS DE LA MUESTRA */}

        <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
          Datos de la muestra
        </Typography>

        <TextField
          label="Título de la muestra"
          fullWidth
          margin="normal"
          {...register('TituloPropuesta')}
          error={!!errors.TituloPropuesta}
          helperText={errors.TituloPropuesta?.message}
        />

        {/* LOGÍSTICA */}

        <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
          Logística de la muestra
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Indique los períodos previstos para el montaje y desmontaje de la
          muestra.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Fecha y hora del montaje
        </Typography>

        <Stack direction="row" spacing={2} alignItems="flex-start">
          <TextField
            type="date"
            size="small"
            sx={{ width: 180 }}
            {...register('LogisticaMuestraTemporalDto.FechaMontaje')}
            error={!!errors.LogisticaMuestraTemporalDto?.FechaMontaje}
            helperText={
              errors.LogisticaMuestraTemporalDto?.FechaMontaje?.message
            }
          />

          <TextField
            type="time"
            size="small"
            sx={{ width: 140 }}
            {...register('LogisticaMuestraTemporalDto.HoraMontaje')}
            error={!!errors.LogisticaMuestraTemporalDto?.HoraMontaje}
            helperText={
              errors.LogisticaMuestraTemporalDto?.HoraMontaje?.message
            }
          />
          <TextField
            type="time"
            size="small"
            sx={{ width: 140 }}
            {...register('LogisticaMuestraTemporalDto.HoraMontajeHasta')}
            error={!!errors.LogisticaMuestraTemporalDto?.HoraMontajeHasta}
            helperText={
              errors.LogisticaMuestraTemporalDto?.HoraMontajeHasta?.message
            }
          />

          <TextField
            type="date"
            size="small"
            sx={{ width: 180 }}
            {...register('LogisticaMuestraTemporalDto.FechaMontajeHasta')}
            error={!!errors.LogisticaMuestraTemporalDto?.FechaMontajeHasta}
            helperText={
              errors.LogisticaMuestraTemporalDto?.FechaMontajeHasta?.message
            }
          />
        </Stack>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Fecha y hora desmontaje
        </Typography>

        <Stack direction="row" spacing={2} alignItems="flex-start">
          <TextField
            type="date"
            size="small"
            sx={{ width: 180 }}
            {...register('LogisticaMuestraTemporalDto.FechaDesmontaje')}
            error={!!errors.LogisticaMuestraTemporalDto?.FechaDesmontaje}
            helperText={
              errors.LogisticaMuestraTemporalDto?.FechaDesmontaje?.message
            }
          />

          <TextField
            type="time"
            size="small"
            sx={{ width: 140 }}
            {...register('LogisticaMuestraTemporalDto.HoraDesmontaje')}
            error={!!errors.LogisticaMuestraTemporalDto?.HoraDesmontaje}
            helperText={
              errors.LogisticaMuestraTemporalDto?.HoraDesmontaje?.message
            }
          />
          <TextField
            type="time"
            size="small"
            sx={{ width: 140 }}
            {...register('LogisticaMuestraTemporalDto.HoraDesmontajeHasta')}
            error={!!errors.LogisticaMuestraTemporalDto?.HoraDesmontajeHasta}
            helperText={
              errors.LogisticaMuestraTemporalDto?.HoraDesmontajeHasta?.message
            }
          />

          <TextField
            type="date"
            size="small"
            sx={{ width: 180 }}
            {...register('LogisticaMuestraTemporalDto.FechaDesmontajeHasta')}
            error={!!errors.LogisticaMuestraTemporalDto?.FechaDesmontajeHasta}
            helperText={
              errors.LogisticaMuestraTemporalDto?.FechaDesmontajeHasta?.message
            }
          />
        </Stack>

        {/* SALAS */}

        <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
          Salas solicitadas
        </Typography>

        <FormControl fullWidth margin="normal" error={!!errors.SalasIds}>
          <FormLabel sx={{ mb: 1 }}>Seleccione las salas</FormLabel>

          {loadingSalas ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Cargando salas...</Typography>
            </Box>
          ) : salas.length === 0 ? (
            <Typography variant="body2">No hay salas disponibles.</Typography>
          ) : (
            <FormGroup>
              {salas.map((sala) => (
                <FormControlLabel
                  key={sala.id}
                  control={
                    <Checkbox
                      checked={salasIds?.includes(sala.id) ?? false}
                      onChange={() => handleSalaChange(sala.id)}
                    />
                  }
                  label={`${sala.nombre} — Capacidad: ${sala.capacidad}`}
                />
              ))}
            </FormGroup>
          )}

          <FormHelperText>{errors.SalasIds?.message}</FormHelperText>
        </FormControl>

        {/* DISPONIBILIDAD */}

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Seleccione un horario disponible
        </Typography>

        <EventAvailabilityCalendar
          ref={calendarRef}
          salasIds={salasIds}
          onEventConfigurationChange={handleEventConfigurationChange}
        />

        {errors.Inicio && (
          <FormHelperText error>{errors.Inicio.message}</FormHelperText>
        )}

        {errors.Fin && (
          <FormHelperText error>{errors.Fin.message}</FormHelperText>
        )}

        {/* FECHAS SELECCIONADAS */}

        <Box
          sx={{
            mt: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>Período de la muestra</strong>
          </Typography>

          <Typography variant="body1">
            <strong>Inicio:</strong>{' '}
            {inicio
              ? dayjs(inicio).format('DD/MM/YYYY HH:mm')
              : 'Sin seleccionar'}
          </Typography>

          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Fin:</strong>{' '}
            {fin ? dayjs(fin).format('DD/MM/YYYY HH:mm') : 'Sin seleccionar'}
          </Typography>
        </Box>

        {/* SUBMIT */}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando propuesta...' : 'Crear propuesta de muestra'}
        </Button>
      </Box>
    </Box>
  );
}
