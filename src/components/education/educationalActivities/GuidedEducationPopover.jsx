import { Box, Divider, Popover, Typography } from '@mui/material';

function formatDateTime(value) {
  if (!value) return '-';

  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function GuidedEducationPopover({
  open,
  position,
  visit,
  onClose,
}) {
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={position ?? undefined}
    >
      <Box
        sx={{
          p: 2,
          minWidth: { xs: 280, sm: 350 },
          maxWidth: 400,
        }}
      >
        <Typography variant="h6">Visita guiada</Typography>

        <Typography>Institución: {visit?.institucion || '-'}</Typography>

        <Typography>Personas: {visit?.cantidadPersonas ?? '-'}</Typography>

        <Typography>Nivel: {visit?.nivelCurso || '-'}</Typography>

        <Typography>Año: {visit?.anioCurso || '-'}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Ubicación</Typography>

        <Typography>País: {visit?.paisInstitucion || '-'}</Typography>

        <Typography>Provincia: {visit?.provinciaInstitucion || '-'}</Typography>

        <Typography>Ciudad: {visit?.ciudadInstitucion || '-'}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Horario</Typography>

        <Typography>Inicio: {formatDateTime(visit?.fechaInicio)}</Typography>

        <Typography>Fin: {formatDateTime(visit?.fechaFin)}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Temáticas</Typography>

        {visit?.tematicasDto?.length ? (
          visit.tematicasDto.map((tematica) => (
            <Typography key={tematica.id}>• {tematica.nombre}</Typography>
          ))
        ) : (
          <Typography>-</Typography>
        )}

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Estado</Typography>

        <Typography>{visit?.estado || '-'}</Typography>

        <Typography>
          Confirmación: {visit?.estadoConfirmacion || '-'}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Observaciones</Typography>

        <Typography>{visit?.observaciones || '-'}</Typography>
      </Box>
    </Popover>
  );
}
