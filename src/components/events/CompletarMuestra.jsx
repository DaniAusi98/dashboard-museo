import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';

import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';

import { authService } from '../../lib/auth';
import { API_URL } from '../../services/api';
import ImageUpload from '../ImageUpload';
import useNotifications from '../../components/hooks/notification/useNotifications';

// --------------------------------------------------
// VALIDACIÓN
// --------------------------------------------------

const schema = z.object({
  muestraId: z.string().min(1),

  nombreResponsable: z.string(),
  telefonoResponsable: z.string(),
  emailResponsable: z.string(),
  tituloPropuesta: z.string(),

  publico: z.string().trim().min(1, 'Ingresá el público destinatario'),

  descripcionMuestra: z.string().trim().min(1, 'Ingresá la descripción'),

  fundamentacionMuestra: z.string().trim().min(1, 'Ingresá la fundamentación'),

  institucion: z.string(),

  emailInstitucion: z
    .string()
    .refine(
      (valor) => !valor.trim() || z.string().email().safeParse(valor).success,
      'Ingresá un correo electrónico válido'
    ),

  requiereDifusion: z.boolean(),
  solicitarAsistenciaDifusion: z.boolean(),

  horario: z.object({
    inicio: z.string(),
    fin: z.string(),
  }),

  logisticaMuestraTemporal: z.object({
    fechaMontaje: z.string(),
    fechaMontajeHasta: z.string(),
    fechaDesmontaje: z.string(),
    fechaDesmontajeHasta: z.string(),
  }),

  salasIds: z.array(z.string()),
  urlImagenes: z.array(z.string()),
  imagenes: z.array(z.instanceof(File)),
});

// --------------------------------------------------
// VALORES INICIALES
// --------------------------------------------------

const valoresIniciales = {
  muestraId: '',

  nombreResponsable: '',
  telefonoResponsable: '',
  emailResponsable: '',
  tituloPropuesta: '',

  publico: '',
  descripcionMuestra: '',
  fundamentacionMuestra: '',

  institucion: '',
  emailInstitucion: '',

  requiereDifusion: false,
  solicitarAsistenciaDifusion: false,

  horario: {
    inicio: '',
    fin: '',
  },

  logisticaMuestraTemporal: {
    fechaMontaje: '',
    fechaMontajeHasta: '',
    fechaDesmontaje: '',
    fechaDesmontajeHasta: '',
  },

  salasIds: [],
  urlImagenes: [],
  imagenes: [],
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'No especificada';

  return dayjs(fecha).format('DD/MM/YYYY HH:mm');
};

// --------------------------------------------------
// COMPONENTE
// --------------------------------------------------

export default function CompletarMuestraTemporal() {
  const { id } = useParams();

  const { success, error: notificarError } = useNotifications();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);
  const [exito, setExito] = useState(false);

  const [salas, setSalas] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciales,
    mode: 'onChange',
  });

  const muestra = watch();

  // --------------------------------------------------
  // CARGAR MUESTRA
  // --------------------------------------------------

  useEffect(() => {
    const obtenerMuestra = async () => {
      try {
        setCargando(true);
        setErrorCarga(false);

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/Eventos/get-muestra-by?id=${encodeURIComponent(id)}`
        );

        const resultado = await response.json();

        if (!response.ok || !resultado.success) {
          throw new Error(resultado.message || 'No se pudo cargar la muestra.');
        }

        const data = resultado.data;

        setSalas(data.salaDtos ?? []);

        reset({
          muestraId: data.muestraId ?? '',

          nombreResponsable: data.nombreApellidoResponsable ?? '',
          telefonoResponsable: data.telefonoResponsable?.valor ?? '',
          emailResponsable: data.emailResponsable?.valor ?? '',
          tituloPropuesta: data.tituloPropuesta ?? '',

          publico: data.publico ?? '',
          descripcionMuestra: data.descripcionMuestra ?? '',
          fundamentacionMuestra: data.fundamentacionMuestra ?? '',

          institucion: data.institucion ?? '',
          emailInstitucion: data.emailInstitucion?.valor ?? '',

          requiereDifusion: data.requiereDifusion ?? false,
          solicitarAsistenciaDifusion: data.solicitaFlyer ?? false,

          horario: {
            inicio: data.horario?.inicio ?? '',
            fin: data.horario?.fin ?? '',
          },

          logisticaMuestraTemporal: {
            fechaMontaje: data.logisticaMuestraTemporal?.fechaMontaje ?? '',

            fechaMontajeHasta:
              data.logisticaMuestraTemporal?.fechaMontajeHasta ?? '',

            fechaDesmontaje:
              data.logisticaMuestraTemporal?.fechaDesmontaje ?? '',

            fechaDesmontajeHasta:
              data.logisticaMuestraTemporal?.fechaDesmontajeHasta ?? '',
          },

          salasIds: data.salaDtos?.map((sala) => sala.id) ?? [],
          urlImagenes: data.urlImagenes ?? [],
          imagenes: [],
        });

        await trigger();
      } catch (err) {
        setErrorCarga(true);
        notificarError(err.message || 'Ocurrió un error al cargar la muestra.');
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      obtenerMuestra();
    }
  }, [id, reset, trigger, notificarError]);

  // --------------------------------------------------
  // ENVIAR FORMULARIO
  // --------------------------------------------------

  const onSubmit = async (data) => {
    try {
      setGuardando(true);

      const formData = new FormData();

      formData.append('MuestraId', data.muestraId);

      // Datos cargados por Dirección
      formData.append('NombreResponsable', data.nombreResponsable);
      formData.append('TelefonoResponsable', data.telefonoResponsable);
      formData.append('EmailResponsable', data.emailResponsable);
      formData.append('TituloPropuesta', data.tituloPropuesta);

      // Información completada por el responsable
      formData.append('Publico', data.publico);
      formData.append('DescripcionMuestra', data.descripcionMuestra);
      formData.append('FundamentacionMuestra', data.fundamentacionMuestra);

      formData.append('RequiereDifusion', String(data.requiereDifusion));

      formData.append(
        'SolicitarAsistenciaDifusion',
        String(data.solicitarAsistenciaDifusion)
      );

      // Campos opcionales
      if (data.institucion.trim()) {
        formData.append('Institucion', data.institucion.trim());
      }

      if (data.emailInstitucion.trim()) {
        formData.append('EmailInstitucion', data.emailInstitucion.trim());
      }

      // Logística
      formData.append(
        'LogisticaMuestraTemporal.FechaMontaje',
        data.logisticaMuestraTemporal.fechaMontaje
      );

      formData.append(
        'LogisticaMuestraTemporal.FechaMontajeHasta',
        data.logisticaMuestraTemporal.fechaMontajeHasta
      );

      formData.append(
        'LogisticaMuestraTemporal.FechaDesmontaje',
        data.logisticaMuestraTemporal.fechaDesmontaje
      );

      formData.append(
        'LogisticaMuestraTemporal.FechaDesmontajeHasta',
        data.logisticaMuestraTemporal.fechaDesmontajeHasta
      );

      // Salas
      data.salasIds.forEach((salaId) => {
        formData.append('SalasIds', salaId);
      });

      // Imágenes existentes conservadas
      data.urlImagenes.forEach((url) => {
        formData.append('UrlImagenes', url);
      });

      // Imágenes nuevas
      data.imagenes.forEach((imagen) => {
        formData.append('imagenes', imagen);
      });

      const response = await authService.authenticatedFetch(
        `${API_URL}/api/v1/Eventos/completar-propuesta-muestra`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      const resultado = await response.json();

      if (!response.ok || resultado.success === false) {
        throw new Error(
          resultado.message || 'No se pudo completar la muestra.'
        );
      }

      // Limpiar todos los campos y bloquear el formulario
      reset(valoresIniciales);
      setSalas([]);
      setExito(true);

      success('La información de la muestra se envió correctamente.');
    } catch (err) {
      notificarError(err.message || 'Ocurrió un error al guardar la muestra.');
    } finally {
      setGuardando(false);
    }
  };

  // --------------------------------------------------
  // CARGANDO
  // --------------------------------------------------

  if (cargando) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // --------------------------------------------------
  // ERROR DE CARGA
  // --------------------------------------------------

  if (errorCarga) {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
        <Typography color="text.secondary" textAlign="center">
          No se pudo cargar la información de la muestra.
        </Typography>
      </Box>
    );
  }

  // --------------------------------------------------
  // FORMULARIO
  // --------------------------------------------------

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Registro de Evento y Actividades Externas - Muestra y
                Exhibiciones Temporales
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Completá la información solicitada para avanzar con la
                organización de la muestra.
              </Typography>
            </Box>

            <Divider />

            {/* DATOS DE LA PROPUESTA */}

            <Typography variant="h6">Datos de la propuesta</Typography>

            <Typography variant="body2" color="text.secondary">
              Los siguientes datos corresponden a lo acordado previamente con la
              Dirección del Museo para la realización de la muestra.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              En caso de que haya algún error en estos datos, por favor
              contactate con la Dirección del Museo para que puedan corregirlo
              antes de enviar la información.
            </Typography>

            <TextField
              label="Título de la muestra"
              fullWidth
              value={muestra.tituloPropuesta}
              slotProps={{ input: { readOnly: true } }}
              disabled
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Nombre del responsable"
                fullWidth
                value={muestra.nombreResponsable}
                slotProps={{ input: { readOnly: true } }}
                disabled
              />

              <TextField
                label="Teléfono"
                fullWidth
                value={muestra.telefonoResponsable}
                slotProps={{ input: { readOnly: true } }}
                disabled
              />
            </Stack>

            <TextField
              label="Correo electrónico"
              fullWidth
              value={muestra.emailResponsable}
              slotProps={{ input: { readOnly: true } }}
              disabled
            />

            {/* FECHAS DE EXPOSICIÓN */}

            <Typography variant="h6">Fechas de exposición</Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Inicio"
                fullWidth
                value={formatearFecha(muestra.horario?.inicio)}
                slotProps={{ input: { readOnly: true } }}
                disabled
              />

              <TextField
                label="Fin"
                fullWidth
                value={formatearFecha(muestra.horario?.fin)}
                slotProps={{ input: { readOnly: true } }}
                disabled
              />
            </Stack>

            {/* LOGÍSTICA */}

            <Typography variant="h6">
              Logística de montaje y desmontaje
            </Typography>

            <Stack spacing={2}>
              <Typography fontWeight="medium">Montaje</Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Desde"
                  fullWidth
                  value={formatearFecha(
                    muestra.logisticaMuestraTemporal?.fechaMontaje
                  )}
                  slotProps={{ input: { readOnly: true } }}
                  disabled
                />

                <TextField
                  label="Hasta"
                  fullWidth
                  value={formatearFecha(
                    muestra.logisticaMuestraTemporal?.fechaMontajeHasta
                  )}
                  slotProps={{ input: { readOnly: true } }}
                  disabled
                />
              </Stack>

              <Typography fontWeight="medium">Desmontaje</Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Desde"
                  fullWidth
                  value={formatearFecha(
                    muestra.logisticaMuestraTemporal?.fechaDesmontaje
                  )}
                  slotProps={{ input: { readOnly: true } }}
                  disabled
                />

                <TextField
                  label="Hasta"
                  fullWidth
                  value={formatearFecha(
                    muestra.logisticaMuestraTemporal?.fechaDesmontajeHasta
                  )}
                  slotProps={{ input: { readOnly: true } }}
                  disabled
                />
              </Stack>
            </Stack>

            {/* SALAS */}

            <Typography variant="h6">Salas asignadas</Typography>

            <Stack spacing={1}>
              {salas.length > 0 ? (
                salas.map((sala) => (
                  <TextField
                    key={sala.id}
                    value={sala.nombre}
                    fullWidth
                    slotProps={{ input: { readOnly: true } }}
                    disabled
                  />
                ))
              ) : (
                <Typography color="text.secondary">
                  No hay salas asignadas.
                </Typography>
              )}
            </Stack>

            <Divider />

            {/* INFORMACIÓN DE LA MUESTRA */}

            <Typography variant="h6">Información de la muestra</Typography>

            <TextField
              label="Público destinatario"
              fullWidth
              multiline
              minRows={2}
              {...register('publico')}
              error={!!errors.publico}
              helperText={errors.publico?.message}
              disabled={exito}
            />

            <TextField
              label="Descripción de la muestra"
              fullWidth
              multiline
              minRows={4}
              {...register('descripcionMuestra')}
              error={!!errors.descripcionMuestra}
              helperText={errors.descripcionMuestra?.message}
              disabled={exito}
            />

            <TextField
              label="Fundamentación de la muestra"
              fullWidth
              multiline
              minRows={4}
              {...register('fundamentacionMuestra')}
              error={!!errors.fundamentacionMuestra}
              helperText={errors.fundamentacionMuestra?.message}
              disabled={exito}
            />

            <Divider />

            {/* INSTITUCIÓN */}

            <Typography variant="h6">Institución</Typography>

            <TextField
              label="Nombre de la institución"
              fullWidth
              {...register('institucion')}
              disabled={exito}
            />

            <TextField
              label="Correo electrónico de la institución"
              fullWidth
              type="email"
              {...register('emailInstitucion')}
              error={!!errors.emailInstitucion}
              helperText={errors.emailInstitucion?.message}
              disabled={exito}
            />

            {/* DIFUSIÓN */}

            <Typography variant="h6">Difusión</Typography>

            <Controller
              name="requiereDifusion"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={exito}
                    />
                  }
                  label="La muestra requiere difusión"
                />
              )}
            />

            <Controller
              name="solicitarAsistenciaDifusion"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={exito}
                    />
                  }
                  label="Solicitar asistencia del área de difusión para elaborar un flyer"
                />
              )}
            />

            <Divider />

            {/* IMÁGENES */}

            <Typography variant="h6">Imágenes de la muestra</Typography>

            {!exito && (
              <Controller
                name="imagenes"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    imagenes={field.value || []}
                    onChange={(updater) => {
                      const actuales = field.value || [];

                      field.onChange(
                        typeof updater === 'function'
                          ? updater(actuales)
                          : updater
                      );
                    }}
                    imagenesExistentes={muestra.urlImagenes || []}
                    onEliminarExistente={(url) => {
                      const actuales = watch('urlImagenes') || [];

                      setValue(
                        'urlImagenes',
                        actuales.filter((imagen) => imagen !== url),
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        }
                      );
                    }}
                  />
                )}
              />
            )}

            {/* ENVIAR */}

            <Button
              type="button"
              variant="contained"
              size="large"
              fullWidth
              disabled={!isValid || guardando || exito}
              onClick={handleSubmit(onSubmit)}
            >
              {guardando ? (
                <CircularProgress size={24} color="inherit" />
              ) : exito ? (
                'Información enviada'
              ) : (
                'Enviar'
              )}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
