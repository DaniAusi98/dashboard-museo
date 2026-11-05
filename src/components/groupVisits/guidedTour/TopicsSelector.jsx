import { useEffect, useState } from 'react';
import { useController } from 'react-hook-form';

import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';

export default function TematicasSelector({ name, control }) {
  const [tematicas, setTematicas] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    field: { value = [], onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: [],
  });

  useEffect(() => {
    const obtenerTematicas = async () => {
      try {
        const response = await fetch(
          'https://localhost:7204/api/v1/VisitasGuiadas/TematicasDisponibles'
        );

        const data = await response.json();

        setTematicas(data.items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    obtenerTematicas();
  }, []);

  const handleToggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography variant="h6">Temáticas</Typography>

      <FormGroup>
        {tematicas.map((tematica) => (
          <FormControlLabel
            key={tematica.id}
            control={
              <Checkbox
                checked={value.includes(tematica.id)}
                onChange={() => handleToggle(tematica.id)}
              />
            }
            label={tematica.nombre}
          />
        ))}
      </FormGroup>

      {error && (
        <Typography color="error" variant="body2">
          {error.message}
        </Typography>
      )}
    </>
  );
}
