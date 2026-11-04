import { useCallback, useState } from 'react';

import { getGuidedVisitsReport } from './educationalActivitiesService';
import { getEducActivities } from './educationalActivitiesService';

export function useEducationalActivities() {
  const [guidedVisits, setGuidedVisits] = useState([]);
  const [EducActivities, setEducActivities] = useState([]);

  const [loadingGuided, setLoadingGuided] = useState(false);
  const [loadingEducActivities, setLoadingEducActivities] = useState(false);

  const fetchGuidedVisits = useCallback(async (desde, hasta) => {
    try {
      setLoadingGuided(true);

      const response = await getGuidedVisitsReport(desde, hasta);

      setGuidedVisits(response.items);
    } catch (error) {
      console.error('Error cargando visitas guiadas:', error);
      setGuidedVisits([]);
    } finally {
      setLoadingGuided(false);
    }
  }, []);
  const fetchEducationalActivities = useCallback(async (desde, hasta) => {
    try {
      setLoadingEducActivities(true);

      const response = await getEducActivities(desde, hasta);

      setEducActivities(response.data.items);
    } catch (error) {
      console.error('Error cargando actividades Educ:', error);
      setEducActivities([]);
    } finally {
      setLoadingEducActivities(false);
    }
  }, []);
  const fetchEducActivities = useCallback(
    async (desde, hasta) => {
      await Promise.all([
        fetchGuidedVisits(desde, hasta),
        fetchEducationalActivities(desde, hasta),
      ]);
    },
    [fetchGuidedVisits, fetchEducationalActivities]
  );

  return {
    guidedVisits,
    loadingGuided,
    EducActivities,
    loadingEducActivities,
    fetchEducActivities,
  };
}
