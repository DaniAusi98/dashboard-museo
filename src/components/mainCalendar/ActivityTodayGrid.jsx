import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMemo } from "react";

export default function ActivityTodayGrid({ rows, loading }) {
  const todayRows = useMemo(() => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    return rows.filter((row) => row.start.slice(0, 10) === todayKey);
  }, [rows]);

  const columns = useMemo(
    () => [
      {
        field: "actividad",
        headerName: "Actividad",
        flex: 1.5,
        valueGetter: (_, row) => row.actividad.tipoActividad,
      },
      {
        field: "horario",
        headerName: "Horario",
        width: 180,
        valueGetter: (_, row) => {
          const inicio = new Date(row.start).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          const fin = new Date(row.end).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          return `${inicio} - ${fin}`;
        },
      },
      {
        field: "cantidadPersonas",
        headerName: "Personas",
        width: 120,
        type: "number",
        valueGetter: (_, row) => row.actividad.cantidadPersonas,
      },
      {
        field: "salas",
        headerName: "Salas",
        flex: 1.5,
        valueGetter: (_, row) => {
          const salas = row.actividad?.salas;

          if (!salas || salas.length === 0) return "-";

          return salas.map((s) => s.nombreSala).join(", ");
        },
      },
      {
        field: "recursos",
        headerName: "Recursos necesarios",
        flex: 2,
        valueGetter: (_, row) => {
          const recursos = row.actividad?.recursos;

          if (!recursos || recursos.length === 0) return "-";

          return recursos
            .map((r) => `${r.nombreRecurso} (${r.cantidadAsignada})`)
            .join(", ");
        },
      },
    ],
    [],
  );

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Typography
        variant="h6"
        sx={{
          mt: 4,
          mb: 2,
        }}
      >
        Actividades de hoy
      </Typography>
      <DataGrid
        rows={todayRows}
        columns={columns}
        getRowId={(row) => row.id} // o el campo que tengas
        disableRowSelectionOnClick
        loading={loading}
        hideFooter
      />
    </Box>
  );
}
