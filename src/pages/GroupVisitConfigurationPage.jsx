import GuidedVisitsConfiguration from '../components/education/groupVisitConfiguration/GroupVisitConfiguration';
import SelfGuidedVisitsConfiguration from '../components/education/groupVisitConfiguration/Self-GuidedVisitConfiguration';
import { Stack } from '@mui/material';

export default function GroupVisitConfigurationPage() {
  return (
    <>
      <Stack sx={{ gap: 6 }}>
        <GuidedVisitsConfiguration />
        <SelfGuidedVisitsConfiguration />
      </Stack>
    </>
  );
}
