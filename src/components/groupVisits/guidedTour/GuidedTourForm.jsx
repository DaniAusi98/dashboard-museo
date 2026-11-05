import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { useRef } from 'react';

import useNotifications from '../../hooks/notification/useNotifications';
import { API_URL } from '../../../services/api';

import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  FormHelperText,
  FormControl,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import GuidedVisitsAvailabilityCalendar from './GuidedVisitsAvailabilityCalendar';
import TematicasSelector from './TopicsSelector';
import UbicacionInstitucion from '../../location/LocationInstitution';

export const FormularioVisitasGuiadas = () => {
  const schema = z
    .object({
      solicitanteNombre: z.string().min(2, 'Ingresá el nombre'),
      solicitanteApellido: z.string().min(2, 'Ingresá el apellido'),
      solicitanteEmail: z.email('Formato inválido'),
      solicitanteTelefono: z
        .string()
        .min(10, 'Ingresá al menos 10 caracteres')
        .max(15, 'Máximo 15 caracteres'),

      institucionNombre: z.string().min(3, 'Mínimo 3 caracteres'),

      institucionTelefono: z
        .string()
        .min(10, 'Mínimo 10 caracteres')
        .max(15, 'Máximo 15 caracteres'),

      institucionEmail: z.email('Formato inválido'),

      // UBICACIÓN
      pais: z.string().min(1, 'Seleccione un país'),
      provincia: z.string().min(1, 'Seleccione una provincia'),
      localidad: z.string().min(1, 'Seleccione una localidad'),

      esEducativa: z.boolean(),

      nivelEducativo: z
        .string()
        .optional()
        .transform((val) =>
          val === '' || val === undefined ? undefined : Number(val)
        ),

      anioGrado: z.string().optional(),

      cantidadPersonas: z.coerce
        .number()
        .positive('La cantidad debe ser mayor a 0')
        .int('La cantidad debe ser un número entero')
        .min(10, 'Debe ser mayor a 10')
        .max(50, 'Debe ser menor o igual a 50'),

      diversidadFuncionalDescripcion: z.string().optional(),
      motivoRelacionVisita: z.string().optional(),
      observaciones: z.string().optional(),

      preferredStartDateTime: z.string().min(1, 'Seleccione un horario'),
      preferredEndDateTime: z.string().min(1, 'Seleccione un horario'),

      tematicasIds: z
        .array(z.string())
        .min(1, 'Seleccione al menos una temática'),
    })
    .check((ctx) => {
      const data = ctx.value;

      if (data.esEducativa) {
        if (data.nivelEducativo === undefined) {
          ctx.issues.push({
            code: 'custom',
            path: ['nivelEducativo'],
            message: 'Seleccione un nivel educativo',
          });
        }

        if (!data.anioGrado) {
          ctx.issues.push({
            code: 'custom',
            path: ['anioGrado'],
            message: 'Indique una sala/grado/año',
          });
        }
      }
    });

  const notifications = useNotifications();

  const calendarRef = useRef(null);
  const ubicacionRef = useRef(null);

  const {
    register,
    control,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),

    mode: 'onSubmit',
    reValidateMode: 'onChange',

    defaultValues: {
      solicitanteNombre: '',
      solicitanteApellido: '',
      solicitanteEmail: '',
      solicitanteTelefono: '',

      institucionNombre: '',
      institucionEmail: '',
      institucionTelefono: '',

      pais: '',
      provincia: '',
      localidad: '',

      esEducativa: false,
      nivelEducativo: '',
      anioGrado: '',

      cantidadPersonas: '',

      diversidadFuncionalDescripcion: '',
      motivoRelacionVisita: '',
      observaciones: '',

      preferredStartDateTime: '',
      preferredEndDateTime: '',

      tematicasIds: [],
    },
  });

  const esEducativa = watch('esEducativa');
  const selectedStart = watch('preferredStartDateTime');
  const selectedEnd = watch('preferredEndDateTime');
  const tematicasIds = watch('tematicasIds');

  // UBICACIÓN
  const handleUbicacionChange = React.useCallback(
    ({ pais, provincia, localidad }) => {
      setValue('pais', pais);
      setValue('provincia', provincia);
      setValue('localidad', localidad);
    },
    [setValue]
  );

  // SUBMIT
  const onSubmit = async (data) => {
    const payload = {
      // Identificador temporal para las cargas de Recepción
      UsuarioVisitanteId: 'RECEPCION',

      NombreSolicitante: data.solicitanteNombre,
      ApellidoSolicitante: data.solicitanteApellido,
      EmailSolicitante: data.solicitanteEmail,
      TelefonoSolicitante: data.solicitanteTelefono,

      Institucion: data.institucionNombre,
      TelefonoInstitucion: data.institucionTelefono,
      EmailInstitucion: data.institucionEmail,

      PaisInstitucion: data.pais,
      ProvinciaInstitucion: data.provincia,
      LocalidadInstitucion: data.localidad,

      Inicio: data.preferredStartDateTime,
      Fin: data.preferredEndDateTime,

      NivelEducativo: data.esEducativa ? Number(data.nivelEducativo) : null,

      AnioGrado: data.esEducativa ? data.anioGrado : null,

      DiversidadFuncionalDescripcion: data.diversidadFuncionalDescripcion,

      MotivoRelacionVisita: data.motivoRelacionVisita,

      Observaciones: data.observaciones,

      CantidadPersonas: data.cantidadPersonas,

      TematicasIds: data.tematicasIds,
    };

    console.log('PAYLOAD:', payload);

    try {
      const response = await fetch(`${API_URL}/api/v1/VisitasGuiadas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error('Error al crear la visita');
      }

      // Actualizar disponibilidad
      await calendarRef.current?.refreshAvailability();

      // Limpiar formulario
      reset();
      ubicacionRef.current?.reset();

      // Notificación
      notifications.showAction(
        'Reserva creada exitosamente',
        'La visita guiada fue registrada correctamente.',
        {
          severity: 'success',
          actionText: 'Aceptar',
          onAction: () => {},
        }
      );
    } catch (error) {
      console.error(error);
      notifications.error('Error al crear la visita.');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1000,
        margin: '0 auto',
        px: {
          xs: 2,
          sm: 3,
        },
        mt: 4,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(
          (data) => {
            console.log('SUBMIT OK', data);
            onSubmit(data);
          },
          (errors) => {
            console.log('SUBMIT ERROR', errors);
          }
        )}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          maxWidth: 600,
          boxShadow: 3,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          p: {
            xs: 2,
            sm: 4,
          },
        }}
      >
        <Typography variant="h4" sx={{ width: '100%' }}>
          Formulario de Reserva de Visita Guiada
        </Typography>

        <Typography variant="subtitle1" sx={{ width: '100%' }}>
          Complete el formulario para registrar una visita guiada.
        </Typography>

        {/* DATOS DEL SOLICITANTE */}

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>Nombre del solicitante</FormLabel>
          <TextField
            fullWidth
            error={!!errors.solicitanteNombre}
            helperText={errors.solicitanteNombre?.message}
            {...register('solicitanteNombre')}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>Apellido del solicitante</FormLabel>
          <TextField
            fullWidth
            error={!!errors.solicitanteApellido}
            helperText={errors.solicitanteApellido?.message}
            {...register('solicitanteApellido')}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>Email del solicitante</FormLabel>
          <TextField
            fullWidth
            error={!!errors.solicitanteEmail}
            helperText={errors.solicitanteEmail?.message}
            {...register('solicitanteEmail')}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>Teléfono del solicitante</FormLabel>
          <TextField
            fullWidth
            type="tel"
            error={!!errors.solicitanteTelefono}
            helperText={errors.solicitanteTelefono?.message}
            {...register('solicitanteTelefono')}
          />
        </FormControl>

        {/* DATOS DE LA INSTITUCIÓN */}

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>Nombre de la institución</FormLabel>
          <TextField
            fullWidth
            error={!!errors.institucionNombre}
            helperText={errors.institucionNombre?.message}
            {...register('institucionNombre')}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>Email de la institución</FormLabel>
          <TextField
            fullWidth
            error={!!errors.institucionEmail}
            helperText={errors.institucionEmail?.message}
            {...register('institucionEmail')}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>Teléfono de la institución</FormLabel>
          <TextField
            fullWidth
            error={!!errors.institucionTelefono}
            helperText={errors.institucionTelefono?.message}
            {...register('institucionTelefono')}
          />
        </FormControl>

        {/* UBICACIÓN */}

        <UbicacionInstitucion
          resetRef={ubicacionRef}
          onChange={handleUbicacionChange}
          errors={errors}
        />

        {/* INSTITUCIÓN EDUCATIVA */}

        <Controller
          name="esEducativa"
          control={control}
          render={({ field }) => (
            <FormControl>
              <FormLabel>¿La institución es educativa?</FormLabel>

              <RadioGroup
                row
                value={field.value ? 'true' : 'false'}
                onChange={(e) => field.onChange(e.target.value === 'true')}
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

        {/* NIVEL EDUCATIVO */}

        <Controller
          name="nivelEducativo"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.nivelEducativo}>
              <FormLabel sx={{ mb: 1 }}>Nivel educativo</FormLabel>

              <Select
                {...field}
                disabled={!esEducativa}
                value={field.value ?? ''}
              >
                <MenuItem value="">
                  <em>Seleccione</em>
                </MenuItem>

                <MenuItem value="0">Nivel Inicial</MenuItem>
                <MenuItem value="1">Nivel Primario</MenuItem>
                <MenuItem value="2">Nivel Secundario</MenuItem>
                <MenuItem value="3">Nivel Superior No Universitario</MenuItem>
                <MenuItem value="4">Nivel Superior Universitario</MenuItem>
                <MenuItem value="5">Otro</MenuItem>
              </Select>

              <FormHelperText>{errors.nivelEducativo?.message}</FormHelperText>
            </FormControl>
          )}
        />

        {/* AÑO / GRADO */}

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>
            Indique una sala/grado/año. (Solo para instituciones educativas)
          </FormLabel>

          <TextField
            multiline
            rows={4}
            fullWidth
            error={!!errors.anioGrado}
            helperText={errors.anioGrado?.message}
            {...register('anioGrado')}
          />
        </FormControl>

        {/* CANTIDAD */}

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>Cantidad de personas</FormLabel>

          <TextField
            type="number"
            fullWidth
            error={!!errors.cantidadPersonas}
            helperText={errors.cantidadPersonas?.message}
            {...register('cantidadPersonas')}
          />
        </FormControl>

        {/* DIVERSIDAD FUNCIONAL */}

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>
            ¿Existen personas con diversidad funcional en el grupo?
            <br />
            En caso afirmativo, describa brevemente.
          </FormLabel>

          <TextField
            multiline
            rows={4}
            fullWidth
            error={!!errors.diversidadFuncionalDescripcion}
            helperText={errors.diversidadFuncionalDescripcion?.message}
            {...register('diversidadFuncionalDescripcion')}
          />
        </FormControl>

        {/* PROYECTO ÁULICO */}

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>
            ¿La visita se encuentra vinculada a un proyecto áulico?
            <br />
            Describa brevemente.
          </FormLabel>

          <TextField
            multiline
            rows={4}
            fullWidth
            error={!!errors.motivoRelacionVisita}
            helperText={errors.motivoRelacionVisita?.message}
            {...register('motivoRelacionVisita')}
          />
        </FormControl>

        {/* OBSERVACIONES */}

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 1 }}>Observaciones</FormLabel>

          <TextField
            multiline
            rows={4}
            fullWidth
            error={!!errors.observaciones}
            helperText={errors.observaciones?.message}
            {...register('observaciones')}
          />
        </FormControl>

        {/* TEMÁTICAS */}

        <TematicasSelector name="tematicasIds" control={control} />

        {/* CALENDARIO */}

        <GuidedVisitsAvailabilityCalendar
          ref={calendarRef}
          selectedStart={selectedStart}
          tematicasIds={tematicasIds}
          onTimeSelect={(inicio, fin) => {
            setValue('preferredStartDateTime', inicio || '', {
              shouldValidate: true,
            });

            setValue('preferredEndDateTime', fin || '', {
              shouldValidate: true,
            });
          }}
        />

        {selectedStart && selectedEnd && (
          <Typography sx={{ mt: 2 }}>
            Seleccionado: {dayjs(selectedStart).format('DD/MM/YYYY HH:mm')}
            {' - '}
            {dayjs(selectedEnd).format('HH:mm')}
          </Typography>
        )}

        {errors.preferredStartDateTime && (
          <Typography color="error">
            {errors.preferredStartDateTime.message}
          </Typography>
        )}

        {errors.preferredEndDateTime && (
          <Typography color="error">
            {errors.preferredEndDateTime.message}
          </Typography>
        )}

        {/* ENVIAR */}

        <Button type="submit" variant="contained">
          Registrar visita guiada
        </Button>
      </Box>
    </Box>
  );
};
