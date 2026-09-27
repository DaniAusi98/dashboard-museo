import { Popover, Box, Typography, Divider, Button } from "@mui/material";

export default function ActivityPopover({
  open,
  position,
  activity,
  slot,
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
          minWidth: 350,
        }}
      >
        <Typography variant="h6">{activity?.tipoActividad}</Typography>

        <Typography>Estado: {activity?.estado}</Typography>

        <Typography>Personas: {activity?.cantidadPersonas}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Horario</Typography>

        <Typography>Inicio: {slot?.inicio}</Typography>

        <Typography>Fin: {slot?.fin}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Salas</Typography>

        {activity?.salas?.length > 0 ? (
          activity.salas.map((sala) => (
            <Typography key={sala.salaId}>• {sala.nombreSala}</Typography>
          ))
        ) : (
          <Typography color="text.secondary">Sin salas asignadas</Typography>
        )}

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Recursos</Typography>

        {activity?.recursos?.length > 0 ? (
          activity.recursos.map((recurso) => (
            <Typography key={recurso.recursoId}>
              • {recurso.nombreRecurso}
              {recurso.cantidadAsignada ? ` (${recurso.cantidadAsignada})` : ""}
            </Typography>
          ))
        ) : (
          <Typography color="text.secondary">Sin recursos asignados</Typography>
        )}

        <Button fullWidth sx={{ mt: 2 }}>
          Ver detalles
        </Button>
      </Box>
    </Popover>
  );
}
