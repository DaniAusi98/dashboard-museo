import React from "react";
import { Box, Divider, IconButton, Popover, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const EventConfigurationPopper = ({ open, position, onClose, children }) => {
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={position ?? undefined}
      anchorOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
    >
      <Box
        sx={{
          width: 700,
          maxHeight: "80vh",
          overflow: "auto",
          borderRadius: 2,
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography variant="h6">Configurar evento</Typography>

          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* CONTENIDO */}

        <Box sx={{ px: 2, pb: 2 }}>{children}</Box>
      </Box>
    </Popover>
  );
};

export default EventConfigurationPopper;
