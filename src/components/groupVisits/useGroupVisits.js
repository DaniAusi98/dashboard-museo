import { useCallback, useState } from "react";
import {
  getGuidedVisitsReport,
  getSelfGuidedVisitsReport,
} from "./groupVisitsService";

export function useGroupVisits() {
  const [guidedVisits, setGuidedVisits] = useState([]);
  const [selfGuidedVisits, setSelfGuidedVisits] = useState([]);

  const [loadingGuided, setLoadingGuided] = useState(false);
  const [loadingSelfGuided, setLoadingSelfGuided] = useState(false);

  const fetchGuidedVisits = useCallback(async (desde, hasta) => {
    try {
      setLoadingGuided(true);
      const response = await getGuidedVisitsReport(desde, hasta);
      setGuidedVisits(response.items);
    } catch (error) {
      console.error("Error cargando visitas guiadas:", error);
      setGuidedVisits([]);
    } finally {
      setLoadingGuided(false);
    }
  }, []);

  const fetchSelfGuidedVisits = useCallback(async (desde, hasta) => {
    try {
      setLoadingSelfGuided(true);
      const response = await getSelfGuidedVisitsReport(desde, hasta);
      setSelfGuidedVisits(response.items);
    } catch (error) {
      console.error("Error cargando visitas autoguiadas:", error);
      setSelfGuidedVisits([]);
    } finally {
      setLoadingSelfGuided(false);
    }
  }, []);

  const fetchReports = useCallback(
    async (desde, hasta) => {
      await Promise.all([
        fetchGuidedVisits(desde, hasta),
        fetchSelfGuidedVisits(desde, hasta),
      ]);
    },
    [fetchGuidedVisits, fetchSelfGuidedVisits],
  );

  return {
    guidedVisits,
    selfGuidedVisits,
    loadingGuided,
    loadingSelfGuided,
    fetchReports,
  };
}
