import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

function formatDate(value) {
  return new Date(value).toLocaleDateString("es-AR");
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const columns = [
  {
    field: "fecha",
    headerName: "Fecha",
    width: 120,
    valueGetter: (_, row) => formatDate(row.fechaInicio),
  },
  {
    field: "horario",
    headerName: "Horario",
    width: 140,
    valueGetter: (_, row) =>
      `${formatTime(row.fechaInicio)} - ${formatTime(row.fechaFin)}`,
  },
  {
    field: "tipoEvento",
    headerName: "Tipo",
    width: 140,
  },
  {
    field: "titulo",
    headerName: "Título",
    flex: 1.5,
    minWidth: 220,
  },
  {
    field: "institucion",
    headerName: "Institución",
    flex: 1,
    minWidth: 160,
    valueGetter: (_, row) => row.institucion || "-",
  },
  {
    field: "salas",
    headerName: "Salas",
    flex: 1.2,
    minWidth: 180,
    valueGetter: (_, row) => (row.salas?.length ? row.salas.join(", ") : "-"),
  },
  {
    field: "nombreSolicitante",
    headerName: "Solicitante",
    flex: 1,
    minWidth: 140,
    valueGetter: (_, row) => row.nombreSolicitante || "-",
  },
  {
    field: "cantidadEstimada",
    headerName: "Cantidad",
    width: 110,
    type: "number",
  },
  {
    field: "estado",
    headerName: "Estado",
    width: 120,
  },
];

export default function EventsGrid({ rows, loading }) {
  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        disableRowSelectionOnClick
        autoHeight
        hideFooter
      />
    </Box>
  );
}
