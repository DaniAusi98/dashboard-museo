import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';

import EditIcon from '@mui/icons-material/Edit';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AddIcon from '@mui/icons-material/Add';

import { authService } from '../../../lib/auth';
import useNotifications from '../../hooks/notification/useNotifications';
import { API_URL } from '../../../services/api';

// Formatear fecha.
const formatearFecha = (fecha) => {
  if (!fecha) return 'No disponible';

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) return 'No disponible';

  return valor.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Formatear hora.
const formatearHora = (fecha) => {
  if (!fecha) return '';

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) return '';

  return valor.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const PropuestasEventos = () => {
  const notifications = useNotifications();
  const navigate = useNavigate();

  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Navegar al detalle.
  const handleVerDetalle = (id) => {
    navigate(`/eventos/propuestas/detalle/${id}`);
  };

  // Navegar a edición.
  const handleEditar = (id) => {
    navigate(`/eventos/propuestas/editar/${id}`);
  };

  // Crear nueva propuesta.
  const handleCrear = () => {
    navigate('/eventProposalForm');
  };

  // Eliminar propuesta.
  const handleEliminar = (id) => {
    // Pendiente de conectar con el endpoint de eliminación.
    notifications.info(
      'Falta conectar el endpoint para eliminar la propuesta.'
    );
  };

  // Columnas del DataGrid.
  const columnas = [
    {
      field: 'titulo',
      headerName: 'Evento',
      flex: 1.2,
      minWidth: 170,
    },
    {
      field: 'tipoEvento',
      headerName: 'Tipo',
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: 'fechaHorario',
      headerName: 'Fecha y horario',
      flex: 1.2,
      minWidth: 190,
    },
    {
      field: 'salas',
      headerName: 'Salas',
      flex: 1.4,
      minWidth: 200,
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      minWidth: 110,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{ height: '100%' }}
        >
          <Tooltip title="Editar propuesta">
            <IconButton
              size="small"
              color="primary"
              onClick={(event) => {
                event.stopPropagation();
                handleEditar(params.row.id);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar propuesta">
            <IconButton
              size="small"
              color="error"
              onClick={(event) => {
                event.stopPropagation();
                handleEliminar(params.row.id);
              }}
            >
              <EventBusyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // Obtener todas las propuestas.
  useEffect(() => {
    const obtenerPropuestas = async () => {
      try {
        setCargando(true);
        setError('');

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/PropuestaEvento/get-all`,
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error('No se pudieron cargar las propuestas.');
        }

        const resultado = await response.json();

        setPropuestas(resultado?.data?.items ?? []);
      } catch (err) {
        setError(err.message || 'Ocurrió un error al cargar las propuestas.');

        notifications.error(err.message || 'Error al obtener las propuestas.');
      } finally {
        setCargando(false);
      }
    };

    obtenerPropuestas();
  }, []);

  // Adaptar las propuestas al formato de filas del DataGrid.
  const filas = propuestas.map((propuesta) => {
    const evento = propuesta.evento;

    const inicio = evento?.horario?.inicio;
    const fin = evento?.horario?.fin;

    return {
      id: propuesta.eventoId,
      titulo: evento?.titulo || 'Sin título',
      tipoEvento: evento?.tipoEvento || 'Sin tipo',

      fechaHorario: inicio
        ? `${formatearFecha(inicio)} | ${formatearHora(inicio)} – ${formatearHora(fin)} hs`
        : 'No disponible',

      salas:
        evento?.salaDtos?.length > 0
          ? evento.salaDtos.map((sala) => sala.nombre).join(', ')
          : 'Sin salas',

      formularioCompletado: propuesta.formularioCompletado,
    };
  });

  if (cargando) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 4,
        }}
      >
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
    <Box
      sx={{
        maxWidth: 1400,
        mx: 'auto',
        p: { xs: 2, md: 4 },
      }}
    >
      <Stack spacing={3}>
        {/* Título y botón de creación */}
        <Stack
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Propuestas de eventos
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCrear}
          >
            Nueva propuesta
          </Button>
        </Stack>

        {filas.length > 0 ? (
          <Card variant="outlined">
            <CardContent>
              <DataGrid
                rows={filas}
                columns={columnas}
                autoHeight
                density="standard"
                rowHeight={56}
                disableRowSelectionOnClick={false}
                onRowClick={(params) => handleVerDetalle(params.row.id)}
                pageSizeOptions={[10, 25, 50, 100]}
                getRowClassName={(params) =>
                  params.row.formularioCompletado
                    ? 'fila-completada'
                    : 'fila-pendiente'
                }
                initialState={{
                  pagination: {
                    paginationModel: {
                      page: 0,
                      pageSize: 10,
                    },
                  },
                }}
                sx={{
                  border: 0,

                  '& .MuiDataGrid-columnHeaders': {
                    fontWeight: 600,
                  },

                  '& .MuiDataGrid-cell': {
                    display: 'flex',
                    alignItems: 'center',
                  },

                  '& .MuiDataGrid-row': {
                    cursor: 'pointer',
                  },

                  '& .fila-pendiente': {
                    backgroundColor: '#fff9c4',
                  },

                  '& .fila-pendiente:hover': {
                    backgroundColor: '#fff176',
                  },

                  '& .fila-completada': {
                    backgroundColor: '#e8f5e9',
                  },

                  '& .fila-completada:hover': {
                    backgroundColor: '#c8e6c9',
                  },
                }}
              />

              {/* Referencias de colores */}
              <Stack
                direction="row"
                spacing={3}
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 0.5,
                      backgroundColor: '#fff9c4',
                      border: '1px solid #fbc02d',
                    }}
                  />

                  <Typography variant="caption" color="text.secondary">
                    Formulario pendiente
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 0.5,
                      backgroundColor: '#e8f5e9',
                      border: '1px solid #43a047',
                    }}
                  />

                  <Typography variant="caption" color="text.secondary">
                    Formulario completado
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info">
            No hay propuestas de eventos registradas.
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default PropuestasEventos;
