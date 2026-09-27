import { memo, useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

import SummaryCard from "./SummaryCard";
import { getGroupVisitsSummary } from "./groupVisitsReportService";

function GroupVisitsSummaryCards({ fechaDesde, fechaHasta }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      if (!fechaDesde || !fechaHasta) {
        return;
      }

      try {
        const response = await getGroupVisitsSummary(
          fechaDesde.format("YYYY-MM-DD"),
          fechaHasta.format("YYYY-MM-DD"),
        );

        setData(response.data);
      } catch (error) {
        console.error("Error al cargar el resumen de visitas grupales:", error);
      }
    };

    loadSummary();
  }, [fechaDesde, fechaHasta]);

  if (!data) {
    return null;
  }

  const cards = [
    {
      title: "Reservas totales",
      value: data.reservasTotales,
    },
    {
      title: "Visitantes totales",
      value: data.visitanteTotales,
    },
    {
      title: "Visitas confirmadas",
      value: data.visitasConfirmadas,
    },
    {
      title: "Visitas canceladas",
      value: data.visitasCanceladas,
    },
    {
      title: "Visitas reprogramadas",
      value: data.reprogramadas,
    },
    {
      title: "Visitas pendientes",
      value: data.pendientes,
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={1} columns={12}>
        {cards.map((card) => (
          <Grid
            key={card.title}
            size={{
              xs: 12,
              sm: 6,
              md: 2,
            }}
          >
            <SummaryCard title={card.title} value={card.value} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default memo(GroupVisitsSummaryCards);
