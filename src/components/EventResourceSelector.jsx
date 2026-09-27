import React from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Divider,
  Stack,
} from "@mui/material";

const TIPOS_RECURSO = [
  {
    value: "Mobiliario",
    label: "Mobiliario",
  },
  {
    value: "Tecnologico",
    label: "Tecnológico",
  },
  {
    value: "Audiovisual",
    label: "Audiovisual",
  },
];

const EventResourceSelector = ({ recursos = [], value = [], onChange }) => {
  const recursosSeleccionados = value || [];

  const estaSeleccionado = (recursoId) => {
    return recursosSeleccionados.some(
      (recurso) => recurso.RecursoId === recursoId,
    );
  };

  const obtenerCantidad = (recursoId) => {
    const recursoSeleccionado = recursosSeleccionados.find(
      (recurso) => recurso.RecursoId === recursoId,
    );

    return recursoSeleccionado?.CantidadAsignada ?? 1;
  };

  const handleCheckboxChange = (recurso, checked) => {
    if (checked) {
      onChange([
        ...recursosSeleccionados,
        {
          RecursoId: recurso.recursoId,
          CantidadAsignada: 1,
        },
      ]);

      return;
    }

    onChange(
      recursosSeleccionados.filter(
        (item) => item.RecursoId !== recurso.recursoId,
      ),
    );
  };

  const handleCantidadChange = (recurso, valorTexto) => {
    // Si borra el input por completo, le mandamos un 0 provisorio al padre
    // para cumplir con la restricción numérica, pero permitimos limpiar la pantalla.
    if (valorTexto === "") {
      onChange(
        recursosSeleccionados.map((item) =>
          item.RecursoId === recurso.recursoId
            ? { ...item, CantidadAsignada: 0 }
            : item,
        ),
      );
      return;
    }

    const cantidadInput = Number(valorTexto);

    // Limitamos únicamente la cantidad máxima según la disponibilidad real
    const nuevaCantidad = Math.min(cantidadInput, recurso.cantidadDisponible);

    onChange(
      recursosSeleccionados.map((item) =>
        item.RecursoId === recurso.recursoId
          ? {
              ...item,
              CantidadAsignada: nuevaCantidad,
            }
          : item,
      ),
    );
  };

  const recursosPorTipo = (tipo) =>
    recursos.filter((recurso) => recurso.tipo === tipo);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        mt: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Recursos del evento
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Seleccioná los recursos que necesitás para el evento y la cantidad.
        <br />
        (Se requiere seleccionar la fecha del evento para ver la disponibilidad
        de los recursos)
      </Typography>

      <Stack spacing={2}>
        {TIPOS_RECURSO.map((tipo, index) => {
          const recursosDelTipo = recursosPorTipo(tipo.value);

          if (recursosDelTipo.length === 0) {
            return null;
          }

          return (
            <Box key={tipo.value}>
              {index > 0 && <Divider sx={{ mb: 2 }} />}

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                {tipo.label}
              </Typography>

              <Stack spacing={1}>
                {recursosDelTipo.map((recurso) => {
                  const seleccionado = estaSeleccionado(recurso.recursoId);
                  const cantidadActual = obtenerCantidad(recurso.recursoId);

                  return (
                    <Box
                      key={recurso.recursoId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        p: 1,
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <FormControlLabel
                        sx={{ m: 0, flex: 1 }}
                        control={
                          <Checkbox
                            checked={seleccionado}
                            onChange={(e) =>
                              handleCheckboxChange(recurso, e.target.checked)
                            }
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">
                              {recurso.nombre}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Disponibles: {recurso.cantidadDisponible}
                            </Typography>
                          </Box>
                        }
                      />

                      <TextField
                        label="Cantidad"
                        type="number"
                        size="small"
                        // Si el valor es 0, mostramos vacío en pantalla para que el usuario pueda escribir de cero limpiamente
                        value={
                          seleccionado
                            ? cantidadActual === 0
                              ? ""
                              : cantidadActual
                            : ""
                        }
                        disabled={!seleccionado}
                        onChange={(e) =>
                          handleCantidadChange(recurso, e.target.value)
                        }
                        sx={{
                          width: 110,
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default EventResourceSelector;
