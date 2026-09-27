import React from "react";
import { useMediaQuery, useTheme } from "@mui/material";

import EventConfigurationPopper from "./EventConfigurationPopper";
import EventConfigurationModal from "./EventConfigurationModal";
import EventDateConfiguration from "./EventDateConfiguration";

const EventDateConfigurationResponsive = ({
  open,
  position,
  onClose,
  initialDates,
  onEventConfigurationChange,
  slotsNoDisponibles,
  salasIds,
}) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const configuration = (
    <EventDateConfiguration
      initialDates={initialDates}
      onEventConfigurationChange={onEventConfigurationChange}
      slotsNoDisponibles={slotsNoDisponibles}
      salasIds={salasIds}
    />
  );

  if (isMobile) {
    return (
      <EventConfigurationModal open={open} onClose={onClose}>
        {configuration}
      </EventConfigurationModal>
    );
  }

  return (
    <EventConfigurationPopper open={open} position={position} onClose={onClose}>
      {configuration}
    </EventConfigurationPopper>
  );
};

export default EventDateConfigurationResponsive;
