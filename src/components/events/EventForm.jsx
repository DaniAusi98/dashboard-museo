import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { authService } from '../../lib/auth';
import useNotifications from '../hooks/notification/useNotifications';
import { API_URL } from '../../services/api';
import ImageUpload from '../ImageUpload';
import EventResourceSelector from '../ResourceSelector';

import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
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

import EventAvailabilityCalendar from './EventAvailabilityCalendar';

const schema = z.object({
  NombreyApellidoSolicitante: z.string().min(3, 'Mínimo 3 caracteres'),

  TelefonoSolicitante: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(15, 'Máximo 15 caracteres'),

  EmailSolicitante: z.email('Formato inválido'),

  Institucion: z.string().min(1, 'Ingrese la institución'),

  TipoEvento: z.enum(
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
    'Seleccione un tipo de evento válido'
  ),

  TituloEvento: z.string().min(1, 'Ingrese el título del evento'),

  DescripcionEvento: z.string().optional(),

  FundamentacionEvento: z.string().optional(),

  TipoPublico: z.string().min(1, 'Ingrese el tipo de público'),

  ConcurrenciaEstimada: z.coerce
    .number()
    .positive('La concurrencia debe ser mayor a 0')
    .int('La concurrencia debe ser un número entero'),

  Inicio: z.string().min(1, 'Seleccione un horario'),

  Fin: z.string().min(1, 'Seleccione un horario'),

  SalasIds: z.array(z.string()).min(1, 'Seleccione al menos una sala'),

  RequiereDifusion: z.boolean(),

  SolicitarAsistenciaDifusion: z.boolean(),

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

export default function FormularioEventos() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const calendarRef = useRef(null);

  const [salas, setSalas] = React.useState([]);
  const [imagenes, setImagenes] = React.useState([]);
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
      NombreyApellidoSolicitante: '',
      TelefonoSolicitante: '',
      EmailSolicitante: '',
      Institucion: '',
      TipoEvento: '',
      TituloEvento: '',
      DescripcionEvento: '',
      FundamentacionEvento: '',
      TipoPublico: '',
      ConcurrenciaEstimada: '',
      Inicio: '',
      Fin: '',
      SalasIds: [],
      RequiereDifusion: false,
      RRule: null,
      SolicitarAsistenciaDifusion: false,
      Recursos: [],
    },
  });

  const salasIds = watch('SalasIds');
  const inicio = watch('Inicio');
  const fin = watch('Fin');
  const rrule = watch('RRule');

  // Obtener salas disponibles
  useEffect(() => {
    const obtenerSalas = async () => {
      setLoadingSalas(true);

      try {
        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/eventos/salas-disponibles-eventos`,
          { method: 'GET' }
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

  // Cambiar salas y limpiar la disponibilidad seleccionada
  const handleSalaChange = (field, salaId) => {
    const value = field.value ?? [];

    const nuevasSalas = value.includes(salaId)
      ? value.filter((id) => id !== salaId)
      : [...value, salaId];

    field.onChange(nuevasSalas);

    setValue('Inicio', '');
    setValue('Fin', '');
    setValue('RRule', null);
    setValue('Recursos', []);
  };

  // Seleccionar horario
  const handleEventConfigurationChange = (configuracion) => {
    const nuevoInicio =
      configuracion.fechaInicio && configuracion.horaInicio
        ? `${configuracion.fechaInicio}T${configuracion.horaInicio}`
        : '';

    const nuevoFin =
      configuracion.fechaFin && configuracion.horaFin
        ? `${configuracion.fechaFin}T${configuracion.horaFin}`
        : '';

    setValue('Inicio', nuevoInicio, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue('Fin', nuevoFin, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue('RRule', configuracion.recurrencia || null, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue('Recursos', [], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Obtener disponibilidad de recursos
  useEffect(() => {
    const obtenerDisponibilidadRecursos = async () => {
      if (!inicio || !fin) {
        setRecursosDisponibles([]);
        return;
      }

      try {
        const params = new URLSearchParams({ inicio, fin });

        if (rrule) {
          params.append('rrule', rrule);
        }

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/Recurso/disponibilidad?${params.toString()}`,
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error('Error al obtener la disponibilidad de recursos');
        }

        const result = await response.json();
        setRecursosDisponibles(result?.data ?? []);
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

  // Crear evento
  const onSubmit = async (data) => {
    const formData = new FormData();

    formData.append(
      'NombreyApellidoSolicitante',
      data.NombreyApellidoSolicitante
    );
    formData.append('TelefonoSolicitante', data.TelefonoSolicitante);
    formData.append('EmailSolicitante', data.EmailSolicitante);
    formData.append('Institucion', data.Institucion);
    formData.append('TipoEvento', data.TipoEvento);
    formData.append('TituloEvento', data.TituloEvento);
    formData.append('DescripcionEvento', data.DescripcionEvento || '');
    formData.append('FundamentacionEvento', data.FundamentacionEvento || '');

    // TipoPublico ahora es un string, no una colección.
    formData.append('TipoPublico', data.TipoPublico);

    formData.append('ConcurrenciaEstimada', String(data.ConcurrenciaEstimada));
    formData.append('Inicio', data.Inicio);
    formData.append('Fin', data.Fin);

    data.SalasIds.forEach((salaId) => {
      formData.append('SalasIds', salaId);
    });

    formData.append('RequiereDifusion', String(data.RequiereDifusion));
    formData.append(
      'SolicitarAsistenciaDifusion',
      String(data.SolicitarAsistenciaDifusion)
    );

    if (data.RRule) {
      formData.append('RRule', data.RRule);
    }

    imagenes.forEach((imagen) => {
      formData.append('imagenes', imagen);
    });

    data.Recursos.forEach((recurso, index) => {
      formData.append(`Recursos[${index}].RecursoId`, recurso.RecursoId);
      formData.append(
        `Recursos[${index}].CantidadAsignada`,
        String(recurso.CantidadAsignada)
      );
    });

    try {
      const response = await authService.authenticatedFetch(
        `${API_URL}/api/v1/Eventos`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al crear el evento');
      }

      const createdEvent = await response.json();

      reset();
      setImagenes([]);
      notifications.success('Evento creado correctamente');

      navigate(`/eventos/${createdEvent.id}`);
    } catch (error) {
      console.error('Error al crear evento:', error);
      notifications.error(error.message || 'No se pudo crear el evento.');
    }
  };

  const onError = (formErrors) => {
    console.log('SUBMIT ERROR', formErrors);
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
          Formulario de Eventos y Actividades Externas
        </Typography>

        <Typography variant="h5" sx={{ mb: 1 }}>
          Datos del solicitante
        </Typography>

        <TextField
          label="Nombre y apellido"
          fullWidth
          margin="normal"
          {...register('NombreyApellidoSolicitante')}
          error={!!errors.NombreyApellidoSolicitante}
          helperText={errors.NombreyApellidoSolicitante?.message}
        />

        <TextField
          label="Teléfono"
          fullWidth
          margin="normal"
          {...register('TelefonoSolicitante')}
          error={!!errors.TelefonoSolicitante}
          helperText={errors.TelefonoSolicitante?.message}
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          {...register('EmailSolicitante')}
          error={!!errors.EmailSolicitante}
          helperText={errors.EmailSolicitante?.message}
        />

        <TextField
          label="Institución"
          fullWidth
          margin="normal"
          {...register('Institucion')}
          error={!!errors.Institucion}
          helperText={errors.Institucion?.message}
        />

        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Datos del evento
        </Typography>

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

        <TextField
          label="Título del evento"
          fullWidth
          margin="normal"
          {...register('TituloEvento')}
          error={!!errors.TituloEvento}
          helperText={errors.TituloEvento?.message}
        />

        <TextField
          label="Descripción"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          {...register('DescripcionEvento')}
          error={!!errors.DescripcionEvento}
          helperText={errors.DescripcionEvento?.message}
        />

        <TextField
          label="Fundamentación"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          {...register('FundamentacionEvento')}
          error={!!errors.FundamentacionEvento}
          helperText={errors.FundamentacionEvento?.message}
        />

        {/* Tipo de público: ahora es un único texto */}
        <TextField
          label="Tipo de público"
          placeholder="Ej.: estudiantes universitarios, público general..."
          fullWidth
          margin="normal"
          {...register('TipoPublico')}
          error={!!errors.TipoPublico}
          helperText={errors.TipoPublico?.message}
        />

        <TextField
          label="Concurrencia estimada"
          type="number"
          fullWidth
          margin="normal"
          {...register('ConcurrenciaEstimada')}
          error={!!errors.ConcurrenciaEstimada}
          helperText={errors.ConcurrenciaEstimada?.message}
          slotProps={{
            htmlInput: {
              min: 1,
              step: 1,
            },
          }}
        />

        <Controller
          name="SalasIds"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.SalasIds}>
              <FormLabel sx={{ mb: 1 }}>Salas disponibles</FormLabel>

              {loadingSalas ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Cargando salas...</Typography>
                </Box>
              ) : salas.length === 0 ? (
                <Typography variant="body2">
                  No hay salas disponibles.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
                </Box>
              )}

              <FormHelperText>{errors.SalasIds?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
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
            {inicio
              ? dayjs(inicio).format('DD/MM/YYYY HH:mm')
              : 'Sin seleccionar'}
          </Typography>

          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Fin:</strong>{' '}
            {fin ? dayjs(fin).format('DD/MM/YYYY HH:mm') : 'Sin seleccionar'}
          </Typography>
        </Box>

        <Controller
          name="RequiereDifusion"
          control={control}
          render={({ field }) => (
            <FormControl margin="normal">
              <FormLabel>¿Requiere difusión?</FormLabel>

              <RadioGroup
                row
                value={field.value ? 'true' : 'false'}
                onChange={(event) => {
                  field.onChange(event.target.value === 'true');
                }}
              >
                <FormControlLabel value="true" control={<Radio />} label="Sí" />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="No"
                />
              </RadioGroup>
            </FormControl>
          )}
        />

        <ImageUpload imagenes={imagenes} onChange={setImagenes} />

        <FormControlLabel
          control={
            <Checkbox
              checked={watch('SolicitarAsistenciaDifusion')}
              onChange={(event) =>
                setValue('SolicitarAsistenciaDifusion', event.target.checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          }
          label="Solicitar asistencia para la creación del flyer o imagen promocional."
        />

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

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando evento...' : 'Crear evento'}
        </Button>
      </Box>
    </Box>
  );
}
