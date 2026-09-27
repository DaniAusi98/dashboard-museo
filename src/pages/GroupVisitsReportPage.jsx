import { useState } from "react";
import dayjs from "dayjs";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import ReportPeriodFilter from "../components/report/ReportPeriodFilter";

import GroupVisitsSummaryCards from "../components/report/GroupVisitsSummaryCards";
import GroupVisitsByTypeReport from "../components/report/GroupVisitsByTypeReport";
import GroupTourTableReport from "../components/report/GroupTourTableReport";
import VisitorsByRoomReport from "../components/report/VisitorsByRoomReport";

export default function GroupVisitsReportPage() {
  const [fechaDesdeAplicada, setFechaDesdeAplicada] = useState(
    dayjs().startOf("month"),
  );

  const [fechaHastaAplicada, setFechaHastaAplicada] = useState(
    dayjs().endOf("month"),
  );

  const aplicarPeriodo = (fechaDesde, fechaHasta) => {
    setFechaDesdeAplicada(fechaDesde);
    setFechaHastaAplicada(fechaHasta);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: "100%",
          maxWidth: {
            sm: "100%",
            md: "1700px",
          },
        }}
      >
        {/* Encabezado y período */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            mb: 3,

            flexDirection: {
              xs: "column",
              sm: "row",
            },

            alignItems: {
              xs: "stretch",
              sm: "center",
            },
          }}
        >
          <Typography component="h2" variant="h6">
            Reporte de Visitas Grupales
          </Typography>

          <ReportPeriodFilter onAplicar={aplicarPeriodo} />
        </Box>

        <Grid container spacing={2} columns={12}>
          {/* Resumen general */}
          <Grid size={{ xs: 12 }}>
            <GroupVisitsSummaryCards
              fechaDesde={fechaDesdeAplicada}
              fechaHasta={fechaHastaAplicada}
            />
          </Grid>

          {/* Reporte por tipo */}
          <Grid size={{ xs: 12 }}>
            <GroupVisitsByTypeReport
              fechaDesde={fechaDesdeAplicada}
              fechaHasta={fechaHastaAplicada}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <GroupTourTableReport
              fechaDesde={fechaDesdeAplicada}
              fechaHasta={fechaHastaAplicada}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <VisitorsByRoomReport
              fechaDesde={fechaDesdeAplicada}
              fechaHasta={fechaHastaAplicada}
            />
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
