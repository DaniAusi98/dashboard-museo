import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
export default function SelfGuidedVisitsDataGrid({ data }) {
  if (!data) {
    return null;
  }

  const rows = [
    {
      id: 1,
      reservasTotales: data.reservasTotales,
      visitanteTotales: data.visitanteTotales,
      visitasConfirmadas: data.visitasConfirmadas,
      visitasCanceladas: data.visitasCanceladas,
      reprogramadas: data.reprogramadas,
      pendientes: data.pendientes,
      tasaOcupacion: data.tasaOcupacion,
    },
  ];

  const columns = [
    {
      field: "reservasTotales",
      headerName: "Reservas totales",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "visitanteTotales",
      headerName: "Visitantes totales",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "visitasConfirmadas",
      headerName: "Confirmadas",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "visitasCanceladas",
      headerName: "Canceladas",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "reprogramadas",
      headerName: "Reprogramadas",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "pendientes",
      headerName: "Pendientes",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "tasaOcupacion",
      headerName: "Tasa de ocupación",
      flex: 1,
      minWidth: 150,
      valueFormatter: (value) => `${Number(value).toFixed(2)}%`,
    },
  ];

  return (
    <Box>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Visitas Autoguiadas
      </Typography>

      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick
        hideFooter
        sx={{
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
          },
        }}
      />
    </Box>
  );
}
