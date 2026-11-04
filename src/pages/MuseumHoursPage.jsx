import { Stack } from '@mui/material';
import HorariosMuseo from '../components/museumHours/museumHours';
import ClosyngDayList from '../components/museumHours/ClosingDaysList';

export default function MuseumHoursPage() {
  return (
    <Stack sx={{ gap: 5 }}>
      <HorariosMuseo />
      <ClosyngDayList />
    </Stack>
  );
}
