import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

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
      setLoadingSalas(true);

      try {
        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/eventos/salas-disponibles`,
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
  // =========================
  // SELECCIONAR HORARIO
  // =========================
  // este es el nuevo que capas usemos para que le llegen los datos finales
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
    // ◄--- ESTA LÍNEA CORREGIDA (abre el paréntesis y la función)
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
      // CAMBIAMOS ESTA LÍNEA por un fetch nativo estándar
      const response = await fetch(`${API_URL}/api/v1/ActividadEducativa`, {
        method: 'POST',
        body: formData, // Mandamos el formData directo
        // NOTA: Dejamos las headers completamente vacías o no las ponemos.
        // El navegador inyectará el 'multipart/form-data' correcto por sí solo.
      });

      if (!response.ok) {
        throw new Error('Error al crear el evento');
      }

      const createdEvent = await response.json();

      reset();

      notifications.success('Evento creado correctamente');

      navigate(`/eventos/${createdEvent.id}`);
    } catch (error) {
      console.error('Error al crear evento:', error);

      notifications.error('No se pudo crear el evento.');
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

  return(
    
  )
}
