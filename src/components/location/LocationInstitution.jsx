import * as React from 'react';
import { useState, useEffect, useImperativeHandle } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/material';

const API_URL = 'https://api.countrystatecity.in/v1';

const API_KEY = import.meta.env.VITE_COUNTRYSTATECITY_API_KEY;

export default function UbicacionInstitucion({ onChange, resetRef, errors }) {
  const [paises, setPaises] = React.useState([]);
  const [provincias, setProvincias] = React.useState([]);
  const [localidades, setLocalidades] = React.useState([]);

  const [pais, setPais] = React.useState(null);
  const [provincia, setProvincia] = React.useState(null);
  const [localidad, setLocalidad] = React.useState('');

  const [loadingPaises, setLoadingPaises] = React.useState(false);

  const [loadingProvincias, setLoadingProvincias] = React.useState(false);

  const [loadingLocalidades, setLoadingLocalidades] = React.useState(false);

  // ============================
  // INFORMAR AL PADRE
  // ============================

  useEffect(() => {
    onChange?.({
      pais: pais?.name || '',
      provincia: provincia?.name || '',
      localidad,
    });
  }, [pais, provincia, localidad, onChange]);

  // ============================
  // RESET DESDE EL PADRE
  // ============================

  useImperativeHandle(
    resetRef,
    () => ({
      reset: () => {
        setPais(null);
        setProvincia(null);
        setLocalidad('');

        setProvincias([]);
        setLocalidades([]);
      },
    }),
    []
  );

  // ============================
  // CARGAR PAÍSES
  // ============================

  useEffect(() => {
    const cargarPaises = async () => {
      try {
        setLoadingPaises(true);

        const response = await fetch(`${API_URL}/countries`, {
          headers: {
            'X-CSCAPI-KEY': API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar países');
        }

        const data = await response.json();

        console.log('PAÍSES:', data);

        setPaises(data);
      } catch (error) {
        console.error('Error cargando países:', error);

        setPaises([]);
      } finally {
        setLoadingPaises(false);
      }
    };

    cargarPaises();
  }, []);

  // ============================
  // CARGAR PROVINCIAS / ESTADOS
  // ============================

  useEffect(() => {
    if (!pais) {
      setProvincias([]);
      setProvincia(null);
      setLocalidades([]);
      setLocalidad('');

      return;
    }

    const cargarProvincias = async () => {
      try {
        setLoadingProvincias(true);

        setProvincia(null);
        setLocalidades([]);
        setLocalidad('');

        const response = await fetch(
          `${API_URL}/countries/${pais.iso2}/states`,
          {
            headers: {
              'X-CSCAPI-KEY': API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Error al cargar provincias/estados');
        }

        const data = await response.json();

        console.log('PROVINCIAS / ESTADOS:', data);

        setProvincias(data);
      } catch (error) {
        console.error('Error cargando provincias/estados:', error);

        setProvincias([]);
      } finally {
        setLoadingProvincias(false);
      }
    };

    cargarProvincias();
  }, [pais]);

  // ============================
  // CARGAR CIUDADES / LOCALIDADES
  // ============================

  useEffect(() => {
    if (!pais || !provincia) {
      setLocalidades([]);
      setLocalidad('');

      return;
    }

    const cargarLocalidades = async () => {
      try {
        setLoadingLocalidades(true);

        setLocalidad('');

        const response = await fetch(
          `${API_URL}/countries/${pais.iso2}/states/${provincia.iso2}/cities`,
          {
            headers: {
              'X-CSCAPI-KEY': API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Error al cargar localidades');
        }

        const data = await response.json();

        console.log('LOCALIDADES:', data);

        setLocalidades(data);
      } catch (error) {
        console.error('Error cargando localidades:', error);

        setLocalidades([]);
      } finally {
        setLoadingLocalidades(false);
      }
    };

    cargarLocalidades();
  }, [pais, provincia]);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* ============================ */}
      {/* PAÍS */}
      {/* ============================ */}

      <FormControl fullWidth margin="normal" error={!!errors?.pais}>
        <FormLabel sx={{ mb: 1 }}>País</FormLabel>

        <Autocomplete
          options={paises}
          value={pais}
          loading={loadingPaises}
          onChange={(event, newValue) => {
            setPais(newValue);
          }}
          getOptionLabel={(option) => option.name || ''}
          isOptionEqualToValue={(option, value) => option.iso2 === value.iso2}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Seleccione un país"
              error={!!errors?.pais}
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps.input,
                  endAdornment: (
                    <>
                      {loadingPaises ? <CircularProgress size={20} /> : null}

                      {params.slotProps.input.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
        />

        {errors?.pais && <FormHelperText>{errors.pais.message}</FormHelperText>}
      </FormControl>

      {/* ============================ */}
      {/* PROVINCIA / ESTADO */}
      {/* ============================ */}

      <FormControl fullWidth margin="normal" error={!!errors?.provincia}>
        <FormLabel sx={{ mb: 1 }}>Provincia / Estado</FormLabel>

        <Autocomplete
          options={provincias}
          value={provincia}
          loading={loadingProvincias}
          disabled={!pais}
          onChange={(event, newValue) => {
            setProvincia(newValue);
          }}
          getOptionLabel={(option) => option.name || ''}
          isOptionEqualToValue={(option, value) => option.iso2 === value.iso2}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Seleccione una provincia"
              error={!!errors?.provincia}
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps.input,
                  endAdornment: (
                    <>
                      {loadingProvincias ? (
                        <CircularProgress size={20} />
                      ) : null}

                      {params.slotProps.input.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
        />

        {errors?.provincia && (
          <FormHelperText>{errors.provincia.message}</FormHelperText>
        )}
      </FormControl>

      {/* ============================ */}
      {/* LOCALIDAD */}
      {/* ============================ */}

      <FormControl fullWidth margin="normal" error={!!errors?.localidad}>
        <FormLabel sx={{ mb: 1 }}>Localidad / Ciudad</FormLabel>

        <Autocomplete
          freeSolo
          options={localidades}
          disabled={!provincia}
          value={
            localidades.find((item) => item.name === localidad) || localidad
          }
          onChange={(event, newValue) => {
            if (typeof newValue === 'string') {
              setLocalidad(newValue);
            } else {
              setLocalidad(newValue?.name || '');
            }
          }}
          onInputChange={(event, newInputValue) => {
            setLocalidad(newInputValue);
          }}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : option.name || ''
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Buscar o escribir..."
              error={!!errors?.localidad}
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps.input,
                  endAdornment: (
                    <>
                      {loadingLocalidades ? (
                        <CircularProgress size={20} />
                      ) : null}

                      {params.slotProps.input.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
        />

        {errors?.localidad && (
          <FormHelperText>{errors.localidad.message}</FormHelperText>
        )}
      </FormControl>
    </Box>
  );
}
