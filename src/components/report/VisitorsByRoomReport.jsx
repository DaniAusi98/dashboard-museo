import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import { BarChart } from "@mui/x-charts/BarChart";

import { getVisitorsByRoom } from "./groupVisitsReportService";

export default function VisitorsByRoomReport({ fechaDesde, fechaHasta }) {
  const [data, setData] = useState([]);

  const isMobile = useMediaQuery("(max-width:600px)");

  const axisWidth = isMobile ? 80 : 140;

  useEffect(() => {
    const loadReport = async () => {
      if (!fechaDesde || !fechaHasta) {
        return;
      }

      try {
        const response = await getVisitorsByRoom(
          fechaDesde.format("YYYY-MM-DD"),
          fechaHasta.format("YYYY-MM-DD"),
        );

        setData(response.data);
      } catch (error) {
        console.error(
          "Error al cargar el reporte de visitantes por sala:",
          error,
        );
      }
    };

    loadReport();
  }, [fechaDesde, fechaHasta]);

  const salasConVisitantes = data.filter((sala) => sala.cantidadVisitantes > 0);

  if (!data.length) {
    return null;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Visitantes por sala
      </Typography>

      <BarChart
        dataset={salasConVisitantes}
        layout="horizontal"
        height={600}
        margin={{
          left: 0,
          right: 0,
        }}
        yAxis={[
          {
            scaleType: "band",
            dataKey: "nombreSala",
            width: axisWidth,
          },
        ]}
        xAxis={[
          {
            min: 0,
            max: 2000,
            tickMinStep: 200,
          },
        ]}
        series={[
          {
            dataKey: "cantidadVisitantes",
            label: "Visitantes",
          },
        ]}
      />
    </Box>
  );
}
