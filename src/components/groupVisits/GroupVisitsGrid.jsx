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
    field: "tipo",
    headerName: "Tipo",
    flex: 1,
    minWidth: 120,
    valueGetter: (_, row) => row.visit.tipo,
  },
  {
    field: "fecha",
    headerName: "Fecha",
    width: 120,
    valueGetter: (_, row) => formatDate(row.visit.horaInicio),
  },
  {
    field: "horario",
    headerName: "Horario",
    width: 150,
    valueGetter: (_, row) =>
      `${formatTime(row.visit.horaInicio)} - ${formatTime(row.visit.horaFin)}`,
  },
  {
    field: "institucion",
    headerName: "Institución",
    flex: 1.5,
    minWidth: 160,
    valueGetter: (_, row) => row.visit.institucion || "-",
  },
  {
    field: "cantidadPersonas",
    headerName: "Cantidad de personas",
    width: 170,
    type: "number",
    valueGetter: (_, row) => row.visit.cantidadPersonas,
  },
  {
    field: "estado",
    headerName: "Estado",
    flex: 1.2,
    minWidth: 180,
    valueGetter: (_, row) => row.visit.estado || "Pendiente de confirmar",
  },
];

export default function GroupVisitsGrid({ rows, title = "Visitas grupales" }) {
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
