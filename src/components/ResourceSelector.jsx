import React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Divider,
  Stack,
} from '@mui/material';

const TIPOS_RECURSO = [
  { value: 'Mobiliario', label: 'Mobiliario' },
  { value: 'Tecnologico', label: 'Tecnológico' },
  { value: 'Audiovisual', label: 'Audiovisual' },
];

const EventResourceSelector = ({ recursos = [], value = [], onChange }) => {
  console.log('RENDER RECURSOS');

  const recursosSeleccionados = value || [];

  const estaSeleccionado = (recursoId) =>
    recursosSeleccionados.some((recurso) => recurso.RecursoId === recursoId);

  const obtenerCantidad = (recursoId) => {
    const recursoSeleccionado = recursosSeleccionados.find(
      (recurso) => recurso.RecursoId === recursoId
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
        (item) => item.RecursoId !== recurso.recursoId
      )
    );
  };

  const handleCantidadChange = (recurso, valorTexto) => {
    if (valorTexto === '') {
      onChange(
        recursosSeleccionados.map((item) =>
          item.RecursoId === recurso.recursoId
            ? {
                ...item,
                CantidadAsignada: 0,
              }
            : item
        )
      );

      return;
    }

    const cantidadInput = Number(valorTexto);

    const nuevaCantidad = Math.min(cantidadInput, recurso.cantidadDisponible);

    onChange(
      recursosSeleccionados.map((item) =>
        item.RecursoId === recurso.recursoId
          ? {
              ...item,
              CantidadAsignada: nuevaCantidad,
            }
          : item
      )
    );
  };

  const recursosPorTipo = (tipo) =>
    recursos.filter((recurso) => recurso.tipo === tipo);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Seleccione los recursos e indique la cantidad solicitada.
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        p: 1,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <FormControlLabel
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
                              Disponible: {recurso.cantidadDisponible}
                            </Typography>
                          </Box>
                        }
                      />

                      <TextField
                        label="Cantidad"
                        type="number"
                        size="small"
                        value={
                          seleccionado
                            ? cantidadActual === 0
                              ? ''
                              : cantidadActual
                            : ''
                        }
                        disabled={!seleccionado}
                        onChange={(e) =>
                          handleCantidadChange(recurso, e.target.value)
                        }
                        sx={{ width: 110 }}
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

export default React.memo(EventResourceSelector);
