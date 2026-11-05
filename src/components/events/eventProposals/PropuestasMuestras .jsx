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

const PropuestasMuestras = () => {
  const notifications = useNotifications();
  const navigate = useNavigate();

  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Navegar al detalle.
  const handleVerDetalle = (id) => {
    navigate(`/muestras/propuestas/detalle/${id}`);
  };

  // Navegar a edición.
  const handleEditar = (id) => {
    navigate(`/muestras/propuestas/editar/${id}`);
  };

  // Crear nueva propuesta.
  const handleCrear = () => {
    navigate('/exhibition-proposal-form');
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
      headerName: 'Muestra',
      flex: 1.2,
      minWidth: 190,
    },
    {
      field: 'responsable',
      headerName: 'Responsable',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'fechaInicio',
      headerName: 'Desde',
      flex: 0.9,
      minWidth: 145,
    },
    {
      field: 'fechaFin',
      headerName: 'Hasta',
      flex: 1,
      minWidth: 165,
    },
    {
      field: 'salas',
      headerName: 'Sala',
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

  // Obtener todas las propuestas de muestras.
  useEffect(() => {
    const obtenerPropuestas = async () => {
      try {
        setCargando(true);
        setError('');

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/PropuestaEvento/get-all-exhibitions?pageIndex=1&pageSize=10`,
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error('No se pudieron cargar las propuestas de muestras.');
        }

        const resultado = await response.json();

        setPropuestas(resultado?.data?.items ?? []);
      } catch (err) {
        setError(err.message || 'Ocurrió un error al cargar las propuestas.');

        notifications.error(
          err.message || 'Error al obtener las propuestas de muestras.'
        );
      } finally {
        setCargando(false);
      }
    };

    obtenerPropuestas();
  }, []);

  // Adaptar las propuestas al formato de filas del DataGrid.
  const filas = propuestas.map((propuesta) => {
    const muestra = propuesta.muestraDto;

    return {
      id: propuesta.muestraTemporalId,
      titulo: muestra?.tituloPropuesta || 'Sin título',

      responsable: muestra?.nombreApellidoResponsable || 'No disponible',

      fechaInicio: formatearFecha(muestra?.horario?.inicio),

      fechaFin: formatearFecha(muestra?.horario?.fin),

      salas:
        muestra?.salaDtos?.length > 0
          ? muestra.salaDtos.map((sala) => sala.nombre).join(', ')
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
            Propuestas de muestras temporales
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
            No hay propuestas de muestras temporales registradas.
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default PropuestasMuestras;
