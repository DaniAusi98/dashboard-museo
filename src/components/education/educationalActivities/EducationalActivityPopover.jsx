import { Box, Divider, Popover, Typography } from '@mui/material';

function formatDateTime(value) {
  if (!value) return '-';

  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function EducationalActivityPopover({
  open,
  position,
  actividad,
  onClose,
}) {
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={position ?? undefined}
    >
      <Box sx={{ p: 2, minWidth: { xs: 280, sm: 350 }, maxWidth: 400 }}>
        <Typography variant="h6">
          {actividad?.titulo || 'Actividad educativa'}
        </Typography>

        <Typography>
          Público objetivo: {actividad?.publicoObjetivo || '-'}
        </Typography>

        <Typography>Personas: {actividad?.cantidadPersonas ?? '-'}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Horario</Typography>

        <Typography>
          Inicio: {formatDateTime(actividad?.timeSlot?.inicio)}
        </Typography>

        <Typography>Fin: {formatDateTime(actividad?.timeSlot?.fin)}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Institución</Typography>

        <Typography>{actividad?.institucionVinculada || '-'}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Estado</Typography>

        <Typography>{actividad?.estado || '-'}</Typography>
      </Box>
    </Popover>
  );
}
