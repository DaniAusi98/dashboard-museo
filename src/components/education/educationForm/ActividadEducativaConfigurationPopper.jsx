import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

import CloseIcon from '@mui/icons-material/Close';

const ActividadEducativaConfigurationPopper = ({
  open,
  onClose,
  position,
  children,
}) => {
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={position ?? undefined}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 700,
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflow: 'auto',
          },
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Actividad Educativa</Typography>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {children}
      </Box>
    </Popover>
  );
};

export default ActividadEducativaConfigurationPopper;
