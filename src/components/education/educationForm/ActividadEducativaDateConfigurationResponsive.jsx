import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import ActividadEducativaConfigurationModal from './ActividadEducativaConfigurationModal';

import ActividadEducativaConfigurationPopper from './ActividadEducativaConfigurationPopper';

import ActividadEducativaDateConfiguration from './ActividadEducativaDateConfiguration';

const ActividadEducativaDateConfigurationResponsive = ({
  open,
  onClose,
  position,
  initialDates,
  onActivityConfigurationChange,
  slotsNoDisponibles,
  salasIds,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const configuration = (
    <ActividadEducativaDateConfiguration
      initialDates={initialDates}
      onActivityConfigurationChange={onActivityConfigurationChange}
      slotsNoDisponibles={slotsNoDisponibles}
      salasIds={salasIds}
      onClose={onClose}
    />
  );

  if (isMobile) {
    return (
      <ActividadEducativaConfigurationModal open={open} onClose={onClose}>
        {configuration}
      </ActividadEducativaConfigurationModal>
    );
  }

  return (
    <ActividadEducativaConfigurationPopper
      open={open}
      onClose={onClose}
      position={position}
    >
      {configuration}
    </ActividadEducativaConfigurationPopper>
  );
};

export default ActividadEducativaDateConfigurationResponsive;
