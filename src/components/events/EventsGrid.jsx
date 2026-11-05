import { Box, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Formatear fecha.
function formatDate(value) {
  if (!value) return '-';

  const fecha = new Date(value);

  if (Number.isNaN(fecha.getTime())) return '-';

  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Formatear hora.
function formatTime(value) {
  if (!value) return '-';

  const fecha = new Date(value);

  if (Number.isNaN(fecha.getTime())) return '-';

  return fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Columnas del DataGrid.
const columns = [
  {
    field: 'fecha',
    headerName: 'Fecha',
    width: 120,
  },
  {
    field: 'horario',
    headerName: 'Horario',
    width: 140,
  },
  {
    field: 'tipoEvento',
    headerName: 'Tipo',
    width: 140,
  },
  {
    field: 'titulo',
    headerName: 'Título',
    flex: 1.5,
    minWidth: 220,
  },
  {
    field: 'salas',
    headerName: 'Salas',
    flex: 1.2,
    minWidth: 180,
  },
  {
    field: 'cantidadPersonas',
    headerName: 'Cantidad de personas',
    width: 160,
    type: 'number',
  },
];

export default function EventsGrid({ rows, loading }) {
  // Adaptar los eventos al formato de filas del DataGrid.
  const filas = rows.map((evento) => {
    const inicio = evento.horario?.inicio;
    const fin = evento.horario?.fin;

    return {
      id: evento.id,
      fecha: formatDate(inicio),

      horario: inicio ? `${formatTime(inicio)} - ${formatTime(fin)} hs` : '-',

      tipoEvento: evento.tipoEvento || '-',
      titulo: evento.titulo || 'Sin título',

      salas:
        evento.salaDtos?.length > 0
          ? evento.salaDtos.map((sala) => sala.nombre).join(', ')
          : 'Sin salas',

      cantidadPersonas: evento.cantidadPersonas ?? '-',

      estadoActividad: evento.estado,
    };
  });

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={filas}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        autoHeight
        hideFooter
        getRowClassName={(params) => {
          switch (params.row.estadoActividad) {
            case 'Activa':
              return 'fila-activa';
            case 'Reprogramada':
              return 'fila-reprogramada';
            case 'Cancelada':
              return 'fila-cancelada';
            default:
              return '';
          }
        }}
        sx={{
          border: 0,

          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
          },

          '& .fila-activa': {
            backgroundColor: '#e8f5e9',
          },

          '& .fila-activa:hover': {
            backgroundColor: '#c8e6c9',
          },

          '& .fila-reprogramada': {
            backgroundColor: '#fff9c4',
          },

          '& .fila-reprogramada:hover': {
            backgroundColor: '#fff176',
          },

          '& .fila-cancelada': {
            backgroundColor: '#ffebee',
          },

          '& .fila-cancelada:hover': {
            backgroundColor: '#ffcdd2',
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
              backgroundColor: '#e8f5e9',
              border: '1px solid #43a047',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Activa
          </Typography>
        </Stack>

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
            Reprogramada
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: 0.5,
              backgroundColor: '#ffebee',
              border: '1px solid #e53935',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Cancelada
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
