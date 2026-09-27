import { useCallback } from "react";

import GroupVisitsCalendar from "./GroupVisitsCalendar";
import GroupVisitsGuidedGrid from "./GroupVisitsGuidedGrid";
import GroupVisitsSelfGuidedGrid from "./GroupVisitsSelfGuidedGrid";
import { useGroupVisits } from "./useGroupVisits";

export default function GroupVisits() {
  const { guidedVisits, selfGuidedVisits, fetchReports } = useGroupVisits();

  const handleDateRangeChange = useCallback(
    async (desde, hasta) => {
      await fetchReports(desde, hasta);
    },
    [fetchReports],
  );

  return (
    <>
      <GroupVisitsCalendar onDateRangeChange={handleDateRangeChange} />

      <GroupVisitsGuidedGrid rows={guidedVisits} />
      <GroupVisitsSelfGuidedGrid rows={selfGuidedVisits} />
    </>
  );
}
