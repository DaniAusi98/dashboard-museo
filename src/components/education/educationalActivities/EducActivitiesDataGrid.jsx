import { Box, Typography } from '@mui/material';
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
    field: 'fecha',
    headerName: 'Fecha',
    width: 120,
    valueGetter: (_, row) => formatDate(row.timeSlot.inicio),
  },
  {
    field: 'horario',
    headerName: 'Horario',
    width: 150,
    valueGetter: (_, row) =>
      `${formatTime(row.timeSlot.inicio)} - ${formatTime(row.timeSlot.fin)}`,
  },
  {
    field: 'titulo',
    headerName: 'Título',
    flex: 1.5,
    minWidth: 180,
    valueGetter: (_, row) => row.titulo || '-',
  },
  {
    field: 'tipoActividadEducativa',
    headerName: 'Tipo',
    flex: 1,
    minWidth: 130,
    valueGetter: (_, row) => row.tipoActividadEducativa ?? '-',
  },
  {
    field: 'institucionVinculada',
    headerName: 'Institución',
    flex: 1.3,
    minWidth: 160,
    valueGetter: (_, row) => row.institucionVinculada || '-',
  },
  {
    field: 'publicoObjetivo',
    headerName: 'Público objetivo',
    flex: 1.2,
    minWidth: 160,
    valueGetter: (_, row) => row.publicoObjetivo || '-',
  },
  {
    field: 'salas',
    headerName: 'Salas',
    flex: 1.5,
    minWidth: 200,
    renderCell: (params) => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          py: 1,
          width: '100%',
        }}
      >
        {params.row.salas?.length
          ? params.row.salas.map((sala) => (
              <Typography key={sala.salaId} variant="body2">
                {sala.nombreSala}
              </Typography>
            ))
          : '-'}
      </Box>
    ),
  },
  {
    field: 'recursos',
    headerName: 'Recursos',
    flex: 1.8,
    minWidth: 250,
    renderCell: (params) => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          py: 1,
          width: '100%',
        }}
      >
        {params.row.recursos?.length
          ? params.row.recursos.map((recurso) => (
              <Typography key={recurso.recursoId} variant="body2">
                {recurso.nombreRecurso} ({recurso.cantidadAsignada})
              </Typography>
            ))
          : '-'}
      </Box>
    ),
  },
  {
    field: 'cantidadPersonas',
    headerName: 'Personas',
    width: 110,
    type: 'number',
    valueGetter: (_, row) => row.cantidadPersonas ?? '-',
  },
  {
    field: 'estado',
    headerName: 'Estado',
    flex: 1,
    minWidth: 120,
    valueGetter: (_, row) => row.estado || '-',
  },
];

export default function EducActivitiesDataGrid({
  rows,
  title = 'Actividades Educativas',
}) {
  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        {title}
      </Typography>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => `${row.id}-${row.timeSlot.inicio}`}
        disableRowSelectionOnClick
        autoHeight
        hideFooter
        getRowHeight={() => 'auto'}
      />
    </Box>
  );
}
