import { Box, Divider, Popover, Typography } from "@mui/material";

function formatDateTime(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function GroupVisitPopover({ open, position, visit, onClose }) {
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={position ?? undefined}
    >
      <Box sx={{ p: 2, minWidth: { xs: 280, sm: 350 }, maxWidth: 400 }}>
        <Typography variant="h6">Visita grupal {visit?.tipo ?? ""}</Typography>
        <Typography>Institución: {visit?.institucion || "-"}</Typography>
        <Typography>Personas: {visit?.cantidadPersonas ?? "-"}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Ubicación</Typography>
        <Typography>Provincia: {visit?.provincia || "-"}</Typography>
        <Typography>Departamento: {visit?.departamento || "-"}</Typography>
        <Typography>Localidad: {visit?.localidad || "-"}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Horario</Typography>
        <Typography>Inicio: {formatDateTime(visit?.horaInicio)}</Typography>
        <Typography>Fin: {formatDateTime(visit?.horaFin)}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography fontWeight="bold">Diversidad funcional</Typography>
        <Typography>
          {visit?.diversidadFuncional || "Sin información"}
        </Typography>
      </Box>
    </Popover>
  );
}
