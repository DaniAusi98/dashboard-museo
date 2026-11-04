import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../../auth/AuthContext';
import { authService } from '../../../lib/auth';
import useNotifications from '../../hooks/notification/useNotifications';
import { API_URL } from '../../../services/api';
import EventResourceSelector from '../../ResourceSelector';

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
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import EventAvailabilityCalendar from '../EventAvailabilityCalendar';

const schema = z.object({
  NombreyApellidoResponsable: z.string().min(3, 'Mínimo 3 caracteres'),

  TelefonoResponsable: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(15, 'Máximo 15 caracteres'),

  EmailResponsable: z.email('Formato inválido'),
  TituloEvento: z.string().min(1, 'Ingrese el título del evento'),

  TipoEvento: z.enum(
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
    'Seleccione un tipo de evento válido'
  ),

  Inicio: z.string().min(1, 'Seleccione un horario'),

  Fin: z.string().min(1, 'Seleccione un horario'),

  SalasIds: z.array(z.string()).min(1, 'Seleccione al menos una sala'),

  RRule: z.string().nullable().default(null),
  Recursos: z
    .array(
      z.object({
        RecursoId: z.string(),
        CantidadAsignada: z.coerce.number().int().positive(),
      })
    )
    .default([]),
});
const tiposEvento = [
  { value: '0', label: 'Conferencia' },
  { value: '1', label: 'Taller' },
  { value: '2', label: 'Seminario' },
  { value: '3', label: 'Exposición' },
  { value: '4', label: 'Charla' },
  { value: '5', label: 'Paneles' },
  { value: '6', label: 'Presentación' },
  { value: '7', label: 'Jornadas' },
  { value: '8', label: 'Defensa de tesis' },
  { value: '9', label: 'Curso de capacitación' },
  { value: '10', label: 'Conversatorio' },
  { value: '11', label: 'Cine debate' },
  { value: '12', label: 'Otros' },
  { value: '13', label: 'MuestraExposicionTemporal' },
];

export default function FormularioPropuestaEvento() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const auth = useAuth();
  const calendarRef = useRef(null);
  const [salas, setSalas] = React.useState([]);
  const [loadingSalas, setLoadingSalas] = React.useState(true);
  const [recursosDisponibles, setRecursosDisponibles] = useState([]);

  const {
    register,
    control,
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
      NombreyApellidoResponsable: '',
      TelefonoResponsable: '',
      EmailResponsable: '',
      TipoEvento: '',
      TituloEvento: '',
      Inicio: '',
      Fin: '',
      SalasIds: [],
      RRule: null,
      Recursos: [],
    },
  });
  const salasIds = watch('SalasIds');
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

  const handleSalaChange = (field, salaId) => {
    const value = field.value ?? [];

    let nuevasSalas;

    if (value.includes(salaId)) {
      nuevasSalas = value.filter((id) => id !== salaId);
    } else {
      nuevasSalas = [...value, salaId];
    }

    field.onChange(nuevasSalas);

    // Al cambiar las salas,
    // la disponibilidad anterior deja de ser válida.
    setValue('Inicio', '');
    setValue('Fin', '');
    setValue('RRule', null);
    setValue('Recursos', []);
  };

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

    setValue('RRule', configuracion.recurrencia || null, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // La disponibilidad de recursos depende
    // de la nueva configuración temporal.
    setValue('Recursos', [], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const inicio = watch('Inicio');
  const fin = watch('Fin');
  const rrule = watch('RRule');

  useEffect(() => {
    const obtenerDisponibilidadRecursos = async () => {
      if (!inicio || !fin) {
        setRecursosDisponibles([]);
        return;
      }

      try {
        const params = new URLSearchParams({
          inicio,
          fin,
        });

        if (rrule) {
          params.append('rrule', rrule);
        }

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/Recurso/disponibilidad?${params.toString()}`,
          {
            method: 'GET',
          }
        );

        if (!response.ok) {
          throw new Error('Error al obtener la disponibilidad de recursos');
        }

        const result = await response.json();

        // CAMBIA ESTA LÍNEA:
        setRecursosDisponibles(result?.data ?? []); // <--- Extrae directamente el array que está en "data"
      } catch (error) {
        console.error('Error obteniendo disponibilidad de recursos:', error);

        setRecursosDisponibles([]);

        notifications.error(
          'No se pudo obtener la disponibilidad de recursos.'
        );
      }
    };

    obtenerDisponibilidadRecursos();
  }, [inicio, fin, rrule]);

  // =========================
  // SUBMIT
  // =========================

  const onSubmit = async (data) => {
    const payload = {
      NombreyApellidoResponsable: data.NombreyApellidoResponsable,
      TelefonoResponsable: data.TelefonoResponsable,
      EmailResponsable: data.EmailResponsable,
      TituloEvento: data.TituloEvento,
      TipoEvento: Number(data.TipoEvento),
      Inicio: data.Inicio,
      Fin: data.Fin,
      SalasIds: data.SalasIds,
      Recursos: data.Recursos.map((recurso) => ({
        RecursoId: recurso.RecursoId,
        CantidadAsignada: Number(recurso.CantidadAsignada),
      })),
      RRule: data.RRule || null,
    };

    try {
      const response = await authService.authenticatedFetch(
        `${API_URL}/api/v1/PropuestaEvento/crear-propuesta-evento`,
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

      const createdProposal = await response.json();

      reset();

      notifications.success('Propuesta creada correctamente');

      navigate('/eventProposals');
    } catch (error) {
      console.error('Error al crear la propuesta:', error);
      notifications.error(error.message || 'No se pudo crear la propuesta.');
    }
  };

  const onError = (errors) => {
    console.log('SUBMIT ERROR', errors);
  };

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
          Formulario de Propuesta de Eventos y Actividades Externas
        </Typography>
        {/* =========================
            DATOS DEL SOLICITANTE
        ========================= */}

        <Typography variant="h5" sx={{ mb: 1 }}>
          Datos del Responsable del evento
        </Typography>

        <TextField
          label="Nombre y apellido"
          fullWidth
          margin="normal"
          {...register('NombreyApellidoResponsable')}
          error={!!errors.NombreyApellidoResponsable}
          helperText={errors.NombreyApellidoResponsable?.message}
        />

        <TextField
          label="Teléfono"
          fullWidth
          margin="normal"
          {...register('TelefonoResponsable')}
          error={!!errors.TelefonoResponsable}
          helperText={errors.TelefonoResponsable?.message}
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

        {/* =========================
            DATOS DEL EVENTO
        ========================= */}

        <Typography
          variant="h5"
          sx={{
            mt: 4,
            mb: 2,
          }}
        >
          Datos del evento
        </Typography>

        <TextField
          label="Título del evento"
          fullWidth
          margin="normal"
          {...register('TituloEvento')}
          error={!!errors.TituloEvento}
          helperText={errors.TituloEvento?.message}
        />
        <Controller
          name="TipoEvento"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.TipoEvento}>
              <FormLabel>Tipo de evento</FormLabel>

              <Select {...field} value={field.value || ''}>
                <MenuItem value="">
                  <em>Seleccione un tipo</em>
                </MenuItem>

                {tiposEvento.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>{errors.TipoEvento?.message}</FormHelperText>
            </FormControl>
          )}
        />

        {/* =========================
            CONCURRENCIA
        ========================= */}

        {/* =========================
            SALAS
        ========================= */}

        <Controller
          name="SalasIds"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.SalasIds}>
              <FormLabel sx={{ mb: 1 }}>Salas disponibles</FormLabel>

              {loadingSalas ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CircularProgress size={20} />

                  <Typography variant="body2">Cargando salas...</Typography>
                </Box>
              ) : salas.length === 0 ? (
                <Typography variant="body2">
                  No hay salas disponibles.
                </Typography>
              ) : (
                <FormGroup>
                  {salas.map((sala) => (
                    <FormControlLabel
                      key={sala.id}
                      control={
                        <Checkbox
                          checked={field.value?.includes(sala.id) ?? false}
                          onChange={() => handleSalaChange(field, sala.id)}
                        />
                      }
                      label={`${sala.nombre} — Capacidad: ${sala.capacidad}`}
                    />
                  ))}
                </FormGroup>
              )}

              <FormHelperText>{errors.SalasIds?.message}</FormHelperText>
            </FormControl>
          )}
        />

        {/* =========================
            DISPONIBILIDAD
        ========================= */}

        <Typography
          variant="h6"
          sx={{
            mt: 4,
            mb: 1,
          }}
        >
          Seleccione un horario disponible
        </Typography>
        <EventAvailabilityCalendar
          ref={calendarRef}
          salasIds={salasIds}
          onEventConfigurationChange={handleEventConfigurationChange}
        />

        {errors.Inicio && (
          <FormHelperText error sx={{ mt: 1 }}>
            {errors.Inicio.message}
          </FormHelperText>
        )}
        {errors.Fin && (
          <FormHelperText error sx={{ mt: 1 }}>
            {errors.Fin.message}
          </FormHelperText>
        )}

        {/* =========================
            INICIO
        ========================= */}

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
            <strong>Fecha seleccionada</strong>
          </Typography>

          <Typography variant="body1">
            <strong>Inicio:</strong>{' '}
            {watch('Inicio')
              ? dayjs(watch('Inicio')).format('DD/MM/YYYY HH:mm')
              : 'Sin seleccionar'}
          </Typography>

          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Fin:</strong>{' '}
            {watch('Fin')
              ? dayjs(watch('Fin')).format('DD/MM/YYYY HH:mm')
              : 'Sin seleccionar'}
          </Typography>
        </Box>

        <Controller
          name="Recursos"
          control={control}
          render={({ field }) => (
            <EventResourceSelector
              recursos={recursosDisponibles}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {/* =========================
            SUBMIT
        ========================= */}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando Propuesta...' : 'Crear Propuesta'}
        </Button>
      </Box>
    </Box>
  );
}
