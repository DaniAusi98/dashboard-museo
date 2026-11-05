import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import ActividadEducativaAvailabilityCalendar from './ActividadEducativaAvailabilityCalendar';
import { API_URL } from '../../../services/api';
import { authService } from '../../../lib/auth';
import useNotifications from '../../hooks/notification/useNotifications';

import ImageUpload from '../../ImageUpload';
import EventResourceSelector from '../../ResourceSelector';

import AddIcon from '@mui/icons-material/Add';

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

const schema = z.object({
  Titulo: z.string().min(3, 'Mínimo 3 caracteres'),

  TipoActividadEducativa: z.enum(
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    'Seleccione un tipo de evento válido'
  ),

  ProyectoVinculadaId: z.string().min(1, 'Seleccione un proyecto vinculado '),
  InstitucionVinculada: z.string().min(1, 'Ingrese la institución vinculada'),

  PublicoObjetivo: z
    .string()
    .min(1, 'Indique el publico al que se dirige la actividad'),

  Observaciones: z.string().optional(),

  Inicio: z.string().min(1, 'Seleccione un horario'),
  Fin: z.string().min(1, 'Seleccione un horario'),

  SalasIds: z.array(z.string()).min(1, 'Seleccione al menos una sala'),

  CantidadAsistentes: z.union([
    z.literal(''),
    z.coerce
      .number()
      .positive('La concurrencia debe ser mayor a 0')
      .pipe(z.int('La concurrencia debe ser un número entero')),
  ]),

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

const tipoActividadEducativa = [
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
];

export default function FormularioActividadEducativa() {
  const navigate = useNavigate();

  const [salas, setSalas] = React.useState([]);
  const [imagenes, setImagenes] = React.useState([]);
  const [loadingSalas, setLoadingSalas] = React.useState(true);

  const [recursosDisponibles, setRecursosDisponibles] = useState([]);
  const [mostrarSelectorRecursos, setMostrarSelectorRecursos] = useState(false);

  const [proyectosEducativos, setProyectosEducativos] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);

  const calendarRef = useRef(null);
  const notifications = useNotifications();

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      Titulo: '',
      TipoActividadEducativa: '',
      ProyectoVinculadaId: '',
      InstitucionVinculada: '',
      PublicoObjetivo: '',
      Observaciones: '',
      CantidadAsistentes: '',
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

  useEffect(() => {
    const obtenerSalas = async () => {
      try {
        setLoadingSalas(true);

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/ActividadEducativa/salas-disponibles-actEducativas`,
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error('Error al obtener las salas');
        }

        const result = await response.json();
        setSalas(result?.data?.items ?? []);
      } catch (error) {
        console.error('Error obteniendo las salas:', error);
        setSalas([]);
      } finally {
        setLoadingSalas(false);
      }
    };

    obtenerSalas();
  }, []);

  useEffect(() => {
    const obtenerProyectosEducativos = async () => {
      setLoadingProyectos(true);

      try {
        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/ActividadEducativa/proyectos-educativos`,
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error('Error al obtener los proyectos educativos');
        }

        const result = await response.json();
        setProyectosEducativos(result?.data ?? []);
      } catch (error) {
        console.error('Error obteniendo proyectos educativos:', error);
        setProyectosEducativos([]);
        notifications.error('No se pudieron obtener los proyectos educativos.');
      } finally {
        setLoadingProyectos(false);
      }
    };

    obtenerProyectosEducativos();
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

    // Al cambiar las salas, la disponibilidad anterior deja de ser válida.
    setValue('Inicio', '');
    setValue('Fin', '');
    setValue('RRule', null);
    setValue('Recursos', []);
  };

  // =========================
  // SELECCIONAR HORARIO
  // =========================

  const handleActEducationConfigurationChange = (configuracion) => {
    const inicio =
      configuracion.fechaInicio && configuracion.horaInicio
        ? `${configuracion.fechaInicio}T${configuracion.horaInicio}`
        : '';

    const fin =
      configuracion.fechaFin && configuracion.horaFin
        ? `${configuracion.fechaFin}T${configuracion.horaFin}`
        : '';

    reset(
      {
        ...getValues(),
        Inicio: inicio,
        Fin: fin,
        RRule: configuracion.recurrencia || null,
        Recursos: [],
      },
      {
        keepErrors: true,
        keepDirty: true,
        keepTouched: true,
      }
    );
  };

  const inicio = watch('Inicio');
  const fin = watch('Fin');
  const rrule = watch('RRule');

  // =========================
  // SOLICITAR RECURSOS
  // =========================

  const handleSolicitarRecursos = () => {
    if (mostrarSelectorRecursos) {
      setMostrarSelectorRecursos(false);
      return;
    }

    if (!inicio || !fin) {
      notifications.warning(
        'Se requiere seleccionar una fecha para solicitar recursos.'
      );

      return;
    }

    setMostrarSelectorRecursos(true);
  };

  // =========================
  // CONSULTAR DISPONIBILIDAD
  // =========================

  useEffect(() => {
    // No consultamos recursos hasta que el usuario los solicite.
    if (!mostrarSelectorRecursos) {
      return;
    }

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
  }, [inicio, fin, rrule, mostrarSelectorRecursos]);

  // =========================
  // SUBMIT
  // =========================

  const onSubmit = async (data) => {
    const formData = new FormData();

    formData.append('Titulo', data.Titulo);
    formData.append('TipoActividadEducativa', data.TipoActividadEducativa);
    formData.append('ProyectoVinculadaId', data.ProyectoVinculadaId);
    formData.append('InstitucionVinculada', data.InstitucionVinculada);
    formData.append('PublicoObjetivo', data.PublicoObjetivo);
    formData.append('Observaciones', data.Observaciones || '');

    if (data.CantidadAsistentes !== '') {
      formData.append('CantidadAsistentes', String(data.CantidadAsistentes));
    }

    formData.append('Inicio', data.Inicio);
    formData.append('Fin', data.Fin);

    data.SalasIds.forEach((salaId) => {
      formData.append('SalasIds', salaId);
    });

    formData.append('RequiereDifusion', String(data.RequiereDifusion));

    if (data.RRule) {
      formData.append('RRule', data.RRule);
    }

    imagenes.forEach((imagen) => {
      formData.append('imagenes', imagen);
    });

    formData.append(
      'SolicitarAsistenciaDifusion',
      String(data.SolicitarAsistenciaDifusion ?? false)
    );

    data.Recursos.forEach((recurso, index) => {
      formData.append(`Recursos[${index}].RecursoId`, recurso.RecursoId);

      formData.append(
        `Recursos[${index}].CantidadAsignada`,
        String(recurso.CantidadAsignada)
      );
    });

    try {
      const response = await fetch(`${API_URL}/api/v1/ActividadEducativa`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al crear la actividad');
      }

      const createdEvent = await response.json();

      reset();

      notifications.success('Actividad creada correctamente');

      navigate(`/actividades-educativas/${createdEvent.Id}`);
    } catch (error) {
      console.error('Error al crear la actividad:', error);
      notifications.error('No se pudo crear la actividad.');
    }
  };

  // =========================
  // ERROR DE VALIDACIÓN
  // =========================

  const onError = (errors) => {
    console.log('SUBMIT ERROR', errors);
  };

  // =========================
  // RENDER
  // =========================

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1000,
        mx: 'auto',
        px: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit, onError)}
        sx={{
          maxWidth: 700,
          mx: 'auto',
        }}
      >
        <TextField
          label="Titulo de la actividad"
          fullWidth
          margin="normal"
          {...register('Titulo')}
          error={!!errors.Titulo}
          helperText={errors.Titulo?.message}
        />

        <Controller
          name="TipoActividadEducativa"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.TipoActividadEducativa}
            >
              <FormLabel>Tipo de Actividad</FormLabel>

              <Select {...field} value={field.value || ''}>
                <MenuItem value="">
                  <em>Seleccione un tipo</em>
                </MenuItem>

                {tipoActividadEducativa.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                {errors.TipoActividadEducativa?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="ProyectoVinculadaId"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.ProyectoVinculadaId}
              disabled={loadingProyectos}
            >
              <FormLabel>Proyecto Educativo</FormLabel>

              <Select {...field} value={field.value || ''}>
                <MenuItem value="">
                  <em>Seleccione un proyecto</em>
                </MenuItem>

                {proyectosEducativos.map((proyecto) => (
                  <MenuItem
                    key={proyecto.equipoTrabajoResponsable?.[0]?.proyectoId}
                    value={proyecto.equipoTrabajoResponsable?.[0]?.proyectoId}
                  >
                    {proyecto.nombre}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                {errors.ProyectoVinculadaId?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <TextField
          label="Institucion Vinculada"
          fullWidth
          margin="normal"
          {...register('InstitucionVinculada')}
          error={!!errors.InstitucionVinculada}
          helperText={errors.InstitucionVinculada?.message}
        />

        <TextField
          label="Publico"
          fullWidth
          margin="normal"
          {...register('PublicoObjetivo')}
          error={!!errors.PublicoObjetivo}
          helperText={errors.PublicoObjetivo?.message}
        />

        <TextField
          label="Observaciones"
          fullWidth
          margin="normal"
          {...register('Observaciones')}
          error={!!errors.Observaciones}
          helperText={errors.Observaciones?.message}
        />

        <Controller
          name="SalasIds"
          control={control}
          render={({ field }) => (
            <FormControl
              component="fieldset"
              fullWidth
              margin="normal"
              error={!!errors.SalasIds}
            >
              <FormLabel component="legend">Salas</FormLabel>

              <FormGroup>
                {loadingSalas ? (
                  <CircularProgress size={24} />
                ) : (
                  salas.map((sala) => (
                    <FormControlLabel
                      key={sala.id}
                      control={
                        <Checkbox
                          checked={field.value?.includes(sala.id) ?? false}
                          onChange={() => handleSalaChange(field, sala.id)}
                        />
                      }
                      label={`${sala.nombre} - Capacidad: ${sala.capacidad}`}
                    />
                  ))
                )}
              </FormGroup>

              <FormHelperText>{errors.SalasIds?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Seleccione un horario
          </Typography>

          <ActividadEducativaAvailabilityCalendar
            ref={calendarRef}
            salasIds={salasIds}
            onActivityConfigurationChange={
              handleActEducationConfigurationChange
            }
          />

          {errors.Inicio && (
            <FormHelperText error sx={{ mt: 1 }}>
              {errors.Inicio.message}
            </FormHelperText>
          )}
        </Box>

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
              onChange={(e) =>
                setValue('SolicitarAsistenciaDifusion', e.target.checked, {
                  shouldDirty: true,
                })
              }
            />
          }
          label="Solicitar asistencia para la creación del flyer o imagen promocional."
        />

        {/* =========================
            SOLICITUD DE RECURSOS
        ========================= */}

        <Box
          sx={{
            mt: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            width: 'fit-content',
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            },
          }}
          onClick={handleSolicitarRecursos}
        >
          <AddIcon />

          <Typography variant="body1">Solicitar recursos</Typography>
        </Box>

        {mostrarSelectorRecursos && (
          <Box sx={{ mt: 2 }}>
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
          </Box>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Crear actividad educativa'
          )}
        </Button>
      </Box>
    </Box>
  );
}
