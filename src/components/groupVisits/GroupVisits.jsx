import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import GroupVisitsCalendar from './GroupVisitsCalendar';
import GroupVisitsGuidedGrid from './GroupVisitsGuidedGrid';
import GroupVisitsSelfGuidedGrid from './GroupVisitsSelfGuidedGrid';
import { useGroupVisits } from './useGroupVisits';

export default function GroupVisits() {
  const navigate = useNavigate();

  const { guidedVisits, selfGuidedVisits, fetchReports } = useGroupVisits();

  const handleDateRangeChange = useCallback(
    async (desde, hasta) => {
      await fetchReports(desde, hasta);
    },
    [fetchReports]
  );

  return (
    <Box>
      {/* ENCABEZADO */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Visitas grupales
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/guidedTourForm')}
        >
          Nueva visita
        </Button>
      </Box>

      <GroupVisitsCalendar onDateRangeChange={handleDateRangeChange} />

      <GroupVisitsGuidedGrid rows={guidedVisits} />

      <GroupVisitsSelfGuidedGrid rows={selfGuidedVisits} />
    </Box>
  );
}
