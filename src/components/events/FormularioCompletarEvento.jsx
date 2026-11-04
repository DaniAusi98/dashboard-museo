import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
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
} from '@mui/material';

import { authService } from '../../lib/auth';
import useNotifications from '../hooks/notification/useNotifications';
import { API_URL } from '../../services/api';
import EventResourceSelector from '../ResourceSelector';

const FormularioCompletarEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const [eventoId, setEventoId] = useState('');

  const [horarioOriginal, setHorarioOriginal] = useState({
    inicio: '',
    fin: '',
  });

  const [tipoEventoOriginal, setTipoEventoOriginal] = useState('0');
  const [salas, setSalas] = useState([]);
  const [rrule, setRrule] = useState(null);

  const [recursosDisponibles, setRecursosDisponibles] = useState([]);
  const [recursosSeleccionados, setRecursosSeleccionados] = useState([]);

  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]);

  const [formulario, setFormulario] = useState({
    NombreyApellidoSolicitante: '',
    TelefonoSolicitante: '',
    EmailSolicitante: '',
    Institucion: '',
    TituloEvento: '',
    DescripcionEvento: '',
    FundamentacionEvento: '',
    TipoPublico: '',
    ConcurrenciaEstimada: '',
    RequiereDifusion: false,
    SolicitarAsistenciaDifusion: false,
  });

  const actualizarCampo = (campo, valor) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  // Cargar los datos de la actividad creada por Dirección.
  useEffect(() => {
    const obtenerEvento = async () => {
      try {
        setCargando(true);
        setError('');

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/Eventos/get-by?id=${id}`,
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error('No se pudo cargar el evento.');
        }

        const resultado = await response.json();
        const evento = resultado?.data;

        if (!evento) {
          throw new Error('No se encontró el evento.');
        }

        setEventoId(evento.id);

        setFormulario({
          NombreyApellidoSolicitante: evento.nombreyApellidoResponsable ?? '',
          TelefonoSolicitante: evento.telefonoResponsable?.valor ?? '',
          EmailSolicitante: evento.emailResponsable?.valor ?? '',
          Institucion: evento.institucion ?? '',
          TituloEvento: evento.titulo ?? '',
          DescripcionEvento: evento.descripcionEvento ?? '',
          FundamentacionEvento: evento.fundamentacionEvento ?? '',
          TipoPublico: evento.tipoPublico ?? '',
          ConcurrenciaEstimada: evento.cantidadEstimada ?? '',
          RequiereDifusion: evento.requiereDifusion ?? false,
          SolicitarAsistenciaDifusion: evento.solicitaFlyer ?? false,
        });

        // Fechas acordadas con Dirección.
        setHorarioOriginal({
          inicio: evento.horario?.inicio ?? '',
          fin: evento.horario?.fin ?? '',
        });

        setTipoEventoOriginal(String(evento.tipoEvento ?? 0));
        setSalas(evento.salaDtos ?? []);
        setRrule(evento.rRule ?? null);
        setImagenesExistentes(evento.urlImagenes ?? []);

        setRecursosSeleccionados(evento.recursos ?? []);
      } catch (err) {
        setError(err.message || 'Ocurrió un error al cargar el evento.');
      } finally {
        setCargando(false);
      }
    };

    if (id) obtenerEvento();
  }, [id]);

  // Consultar recursos disponibles para el horario acordado.
  useEffect(() => {
    const obtenerRecursos = async () => {
      if (!horarioOriginal.inicio || !horarioOriginal.fin) {
        setRecursosDisponibles([]);
        return;
      }

      try {
        const params = new URLSearchParams({
          inicio: horarioOriginal.inicio,
          fin: horarioOriginal.fin,
        });

        if (rrule) {
          params.append('rrule', rrule);
        }

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/Recurso/disponibilidad?${params.toString()}`,
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error('No se pudieron consultar los recursos.');
        }

        const resultado = await response.json();
        setRecursosDisponibles(resultado?.data ?? []);
      } catch (err) {
        setRecursosDisponibles([]);
        notifications.error(
          err.message || 'Error al consultar los recursos disponibles.'
        );
      }
    };

    if (!cargando) obtenerRecursos();
  }, [horarioOriginal, rrule, cargando]);

  const agregarImagenes = (event) => {
    const archivos = Array.from(event.target.files ?? []);

    setImagenesNuevas((actuales) => [...actuales, ...archivos]);
    event.target.value = '';
  };

  const eliminarImagenExistente = (url) => {
    setImagenesExistentes((actuales) =>
      actuales.filter((imagen) => imagen !== url)
    );
  };

  const eliminarImagenNueva = (indice) => {
    setImagenesNuevas((actuales) => actuales.filter((_, i) => i !== indice));
  };

  const enviarFormulario = async (event) => {
    event.preventDefault();

    if (!horarioOriginal.inicio || !horarioOriginal.fin) {
      notifications.error('El evento no tiene un horario válido.');
      return;
    }

    if (!formulario.NombreyApellidoSolicitante.trim()) {
      notifications.error('Ingresá el nombre y apellido del responsable.');
      return;
    }

    if (!formulario.EmailSolicitante.trim()) {
      notifications.error('Ingresá el correo electrónico.');
      return;
    }

    try {
      setGuardando(true);

      const formData = new FormData();

      formData.append('EventoId', eventoId);
      formData.append(
        'NombreyApellidoSolicitante',
        formulario.NombreyApellidoSolicitante
      );
      formData.append('TelefonoSolicitante', formulario.TelefonoSolicitante);
      formData.append('EmailSolicitante', formulario.EmailSolicitante);
      formData.append('Institucion', formulario.Institucion);
      formData.append('TipoEvento', tipoEventoOriginal);
      formData.append('TituloEvento', formulario.TituloEvento);
      formData.append('DescripcionEvento', formulario.DescripcionEvento);
      formData.append('FundamentacionEvento', formulario.FundamentacionEvento);
      formData.append('TipoPublico', formulario.TipoPublico);
      formData.append(
        'ConcurrenciaEstimada',
        String(formulario.ConcurrenciaEstimada)
      );
      formData.append('RequiereDifusion', String(formulario.RequiereDifusion));
      formData.append(
        'SolicitarAsistenciaDifusion',
        String(formulario.SolicitarAsistenciaDifusion)
      );

      // Mantener las fechas acordadas con Dirección.
      formData.append('Inicio', horarioOriginal.inicio);
      formData.append('Fin', horarioOriginal.fin);

      // Mantener las salas asignadas.
      salas.forEach((sala) => {
        formData.append('SalasIds', sala.id);
      });

      // Mantener las imágenes existentes que no se quitaron.
      imagenesExistentes.forEach((url) => {
        formData.append('UrlImagenes', url);
      });

      // Adjuntar imágenes nuevas.
      imagenesNuevas.forEach((imagen) => {
        formData.append('imagenes', imagen);
      });

      // Eliminar recursos duplicados antes de enviarlos.
      const recursosUnicos = new Map();

      recursosSeleccionados.forEach((recurso) => {
        const recursoId = recurso.RecursoId ?? recurso.recursoId ?? recurso.id;

        if (!recursoId) return;

        recursosUnicos.set(recursoId, {
          RecursoId: recursoId,
          CantidadAsignada:
            recurso.CantidadAsignada ?? recurso.cantidadAsignada ?? 1,
        });
      });

      // Enviar cada RecursoId una sola vez.
      Array.from(recursosUnicos.values()).forEach((recurso, index) => {
        formData.append(`Recursos[${index}].RecursoId`, recurso.RecursoId);

        formData.append(
          `Recursos[${index}].CantidadAsignada`,
          String(recurso.CantidadAsignada)
        );
      });

      const response = await authService.authenticatedFetch(
        `${API_URL}/api/v1/Eventos/update-evento`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'No se pudo guardar el evento.');
      }

      notifications.success('El formulario se completó correctamente.');
      navigate('/');
    } catch (err) {
      notifications.error(
        err.message || 'Ocurrió un error al guardar el formulario.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) return fecha;

    return valor.toLocaleString('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Completar formulario del evento
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Completá los datos solicitados. La fecha, el horario y las salas
            fueron acordados previamente con Dirección.
          </Typography>

          <Box component="form" onSubmit={enviarFormulario}>
            <Stack spacing={2.5}>
              <Typography variant="h6">Datos del responsable</Typography>

              <TextField
                label="Nombre y apellido"
                value={formulario.NombreyApellidoSolicitante}
                onChange={(e) =>
                  actualizarCampo('NombreyApellidoSolicitante', e.target.value)
                }
                required
                fullWidth
              />

              <TextField
                label="Teléfono"
                value={formulario.TelefonoSolicitante}
                onChange={(e) =>
                  actualizarCampo('TelefonoSolicitante', e.target.value)
                }
                fullWidth
              />

              <TextField
                label="Correo electrónico"
                type="email"
                value={formulario.EmailSolicitante}
                onChange={(e) =>
                  actualizarCampo('EmailSolicitante', e.target.value)
                }
                required
                fullWidth
              />

              <TextField
                label="Institución"
                value={formulario.Institucion}
                onChange={(e) => actualizarCampo('Institucion', e.target.value)}
                fullWidth
              />

              <Typography variant="h6">Datos del evento</Typography>

              <TextField
                label="Título del evento"
                value={formulario.TituloEvento}
                onChange={(e) =>
                  actualizarCampo('TituloEvento', e.target.value)
                }
                required
                fullWidth
              />

              <TextField
                label="Descripción"
                value={formulario.DescripcionEvento}
                onChange={(e) =>
                  actualizarCampo('DescripcionEvento', e.target.value)
                }
                multiline
                minRows={3}
                fullWidth
              />

              <TextField
                label="Fundamentación"
                value={formulario.FundamentacionEvento}
                onChange={(e) =>
                  actualizarCampo('FundamentacionEvento', e.target.value)
                }
                multiline
                minRows={3}
                fullWidth
              />

              <TextField
                label="Tipo de público"
                value={formulario.TipoPublico}
                onChange={(e) => actualizarCampo('TipoPublico', e.target.value)}
                fullWidth
              />

              <TextField
                label="Concurrencia estimada"
                type="number"
                value={formulario.ConcurrenciaEstimada}
                onChange={(e) =>
                  actualizarCampo('ConcurrenciaEstimada', e.target.value)
                }
                inputProps={{ min: 1 }}
                required
                fullWidth
              />

              <Typography variant="h6">Fecha y horario acordados</Typography>

              <TextField
                label="Inicio"
                value={formatearFecha(horarioOriginal.inicio)}
                InputProps={{ readOnly: true }}
                fullWidth
              />

              <TextField
                label="Fin"
                value={formatearFecha(horarioOriginal.fin)}
                InputProps={{ readOnly: true }}
                fullWidth
              />

              <Typography variant="h6">Salas asignadas</Typography>

              {salas.length > 0 ? (
                <Stack spacing={1}>
                  {salas.map((sala) => (
                    <Alert severity="info" key={sala.id}>
                      {sala.nombre}
                    </Alert>
                  ))}
                </Stack>
              ) : (
                <Alert severity="warning">
                  No hay salas asignadas en los datos recibidos.
                </Alert>
              )}

              <Typography variant="h6">Recursos</Typography>

              <EventResourceSelector
                recursos={recursosDisponibles}
                value={recursosSeleccionados}
                onChange={setRecursosSeleccionados}
              />

              <Typography variant="h6">Imágenes del evento</Typography>

              {imagenesExistentes.length > 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr 1fr',
                      sm: 'repeat(3, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  {imagenesExistentes.map((url) => (
                    <Box key={url}>
                      <Box
                        component="img"
                        src={url}
                        alt="Imagen existente del evento"
                        sx={{
                          width: '100%',
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                      <Button
                        color="error"
                        size="small"
                        onClick={() => eliminarImagenExistente(url)}
                      >
                        Quitar imagen
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}

              <Button component="label" variant="outlined">
                Agregar imágenes
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={agregarImagenes}
                />
              </Button>

              {imagenesNuevas.map((imagen, index) => (
                <Box
                  key={`${imagen.name}-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {imagen.name}
                  </Typography>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => eliminarImagenNueva(index)}
                  >
                    Quitar
                  </Button>
                </Box>
              ))}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formulario.RequiereDifusion}
                    onChange={(e) =>
                      actualizarCampo('RequiereDifusion', e.target.checked)
                    }
                  />
                }
                label="Requiere difusión"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formulario.SolicitarAsistenciaDifusion}
                    onChange={(e) =>
                      actualizarCampo(
                        'SolicitarAsistenciaDifusion',
                        e.target.checked
                      )
                    }
                  />
                }
                label="Solicitar asistencia para la difusión"
              />

              <Button
                type="submit"
                variant="contained"
                disabled={guardando}
                fullWidth
              >
                {guardando ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Guardar formulario'
                )}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FormularioCompletarEvento;
