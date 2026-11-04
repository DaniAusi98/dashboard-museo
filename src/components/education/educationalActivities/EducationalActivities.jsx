import { useCallback } from 'react';

import EducationalActivitiesCalendar from './EducationalActivitiesCalendar';
import GroupVisitsGuidedGrid from '../../groupVisits/GroupVisitsGuidedGrid';
import { useEducationalActivities } from '../educationalActivities/useEducationalActivities';
import EducActivitiesDataGrid from '../educationalActivities/EducActivitiesDataGrid';

export default function EducationalActivities() {
  const { guidedVisits, EducActivities, fetchEducActivities } =
    useEducationalActivities();

  const onDateRangeChange = useCallback(
    async (desde, hasta) => {
      await fetchEducActivities(desde, hasta);
    },
    [fetchEducActivities]
  );

  return (
    <>
      <EducationalActivitiesCalendar onDateRangeChange={onDateRangeChange} />
      <EducActivitiesDataGrid rows={EducActivities} />
      <GroupVisitsGuidedGrid rows={guidedVisits} />
    </>
  );
}
