import { Box, Typography } from "@mui/material";
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
    width: 150,
    valueGetter: (_, row) =>
      `${formatTime(row.fechaInicio)} - ${formatTime(row.fechaFin)}`,
  },
  {
    field: "institucion",
    headerName: "Institución",
    flex: 1.5,
    minWidth: 160,
    valueGetter: (_, row) => row.institucion || "-",
  },
  {
    field: "paisInstitucion",
    headerName: "País",
    flex: 1,
    minWidth: 120,
    valueGetter: (_, row) => row.paisInstitucion || "-",
  },
  {
    field: "provinciaInstitucion",
    headerName: "Provincia",
    flex: 1,
    minWidth: 130,
    valueGetter: (_, row) => row.provinciaInstitucion || "-",
  },
  {
    field: "ciudadInstitucion",
    headerName: "Ciudad",
    flex: 1,
    minWidth: 130,
    valueGetter: (_, row) => row.ciudadInstitucion || "-",
  },
  {
    field: "cantidadPersonas",
    headerName: "Personas",
    width: 110,
    type: "number",
  },
  {
    field: "estadoConfirmacion",
    headerName: "Confirmación",
    flex: 1.2,
    minWidth: 170,
    valueGetter: (_, row) => row.estadoConfirmacion || "-",
  },
  {
    field: "estado",
    headerName: "Estado",
    flex: 1,
    minWidth: 120,
    valueGetter: (_, row) => row.estado || "-",
  },
];

export default function GroupVisitsSelfGuidedGrid({
  rows,
  title = "Visitas autoguiadas",
}) {
  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        {title}
      </Typography>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        autoHeight
        hideFooter
      />
    </Box>
  );
}
