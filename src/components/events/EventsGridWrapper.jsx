import { useEffect, useState } from "react";
import dayjs from "dayjs";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import ReportPeriodFilter from "../report/ReportPeriodFilter";
import EventsGrid from "./EventsGrid";
import { useEvents } from "./useEvents";

export default function EventsGridWrapper() {
  const [fechaDesde, setFechaDesde] = useState(dayjs().startOf("month"));

  const [fechaHasta, setFechaHasta] = useState(dayjs().endOf("month"));

  const { events, loading, fetchEvents } = useEvents();

  useEffect(() => {
    fetchEvents(
      fechaDesde.format("YYYY-MM-DD"),
      fechaHasta.format("YYYY-MM-DD"),
    );
  }, [fechaDesde, fechaHasta, fetchEvents]);

  const aplicarPeriodo = (desde, hasta) => {
    setFechaDesde(desde);
    setFechaHasta(hasta);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Eventos y Actividades Externas
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <ReportPeriodFilter
              fechaDesdeInicial={fechaDesde}
              fechaHastaInicial={fechaHasta}
              onAplicar={aplicarPeriodo}
            />
          </Box>
        </Box>

        <EventsGrid rows={events} loading={loading} />
      </Box>
    </LocalizationProvider>
  );
}
