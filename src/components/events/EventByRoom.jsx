import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-AR');
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const columns = [
  {
    field: 'salas',
    headerName: 'Sala',
    flex: 1.2,
    minWidth: 220,
    renderCell: (params) => (
      <Box sx={{ py: 1 }}>
        {params.value?.map((sala, index) => (
          <div key={index}>{sala}</div>
        ))}
      </Box>
    ),
  },
  {
    field: 'fecha',
    headerName: 'Fecha',
    width: 120,
    valueGetter: (_, row) => formatDate(row.fechaInicio),
  },
  {
    field: 'horario',
    headerName: 'Horario',
    width: 140,
    valueGetter: (_, row) =>
      `${formatTime(row.fechaInicio)} - ${formatTime(row.fechaFin)}`,
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
    field: 'tipoPublico',
    headerName: 'Público',
    flex: 1,
    minWidth: 140,
    renderCell: (params) =>
      params.value?.length ? params.value.join(', ') : '-',
  },
  {
    field: 'cantidadPersonas',
    headerName: 'Personas',
    width: 110,
    type: 'number',
  },
  {
    field: 'recursos',
    headerName: 'Recursos',
    flex: 1.5,
    minWidth: 220,
    renderCell: (params) => (
      <Box sx={{ py: 1 }}>
        {params.value?.length
          ? params.value.map((recurso, index) => (
              <div key={index}>{recurso}</div>
            ))
          : '-'}
      </Box>
    ),
  },
];

export default function EventsByRoomGrid({ rows, loading }) {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        disableRowSelectionOnClick
        autoHeight
        hideFooter
        getRowHeight={() => 'auto'}
      />
    </Box>
  );
}
