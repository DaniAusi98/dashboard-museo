import { memo, useEffect, useState } from "react";

import GuidedVisitsDataGrid from "./GuidedVisitsDataGrid";
import SelfGuidedVisitsDataGrid from "./SelfGuidedVisitsDataGrid";

import {
  getGuidedVisitsReport,
  getSelfGuidedVisitsReport,
} from "./groupVisitsReportService";

import Stack from "@mui/material/Stack";

function GroupVisitsByTypeReport({ fechaDesde, fechaHasta }) {
  const [guidedData, setGuidedData] = useState(null);
  const [selfGuidedData, setSelfGuidedData] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      if (!fechaDesde || !fechaHasta) {
        return;
      }

      try {
        const [guidedResponse, selfGuidedResponse] = await Promise.all([
          getGuidedVisitsReport(
            fechaDesde.format("YYYY-MM-DD"),
            fechaHasta.format("YYYY-MM-DD"),
          ),

          getSelfGuidedVisitsReport(
            fechaDesde.format("YYYY-MM-DD"),
            fechaHasta.format("YYYY-MM-DD"),
          ),
        ]);

        setGuidedData(guidedResponse.data);
        setSelfGuidedData(selfGuidedResponse.data);
      } catch (error) {
        console.error(
          "Error al cargar los reportes de visitas grupales:",
          error,
        );
      }
    };

    loadReports();
  }, [fechaDesde, fechaHasta]);

  return (
    <Stack spacing={2}>
      <GuidedVisitsDataGrid data={guidedData} />

      <SelfGuidedVisitsDataGrid data={selfGuidedData} />
    </Stack>
  );
}

export default memo(GroupVisitsByTypeReport);
