import { useEffect, useState } from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;

export default function AreaPuestoSelect({
  value,
  onChange,
  error,
  helperText,
}) {
  const [areas, setAreas] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [areaId, setAreaId] = useState('');
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingPuestos, setLoadingPuestos] = useState(false);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/PersonalMuseo/GetAllAreas`
        );

        if (!response.ok) {
          throw new Error('Error al obtener las áreas');
        }

        const result = await response.json();
        setAreas(result.data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAreas(false);
      }
    };

    fetchAreas();
  }, []);

  useEffect(() => {
    if (!areaId) {
      setPuestos([]);
      return;
    }

    const fetchPuestos = async () => {
      try {
        setLoadingPuestos(true);

        const response = await fetch(
          `${API_URL}/api/v1/PersonalMuseo/puestos-area?areaId=${areaId}`
        );

        if (!response.ok) {
          throw new Error('Error al obtener los puestos');
        }

        const result = await response.json();
        setPuestos(result.data.items);
      } catch (err) {
        console.error(err);
        setPuestos([]);
      } finally {
        setLoadingPuestos(false);
      }
    };

    fetchPuestos();
  }, [areaId]);

  const handleAreaChange = (event) => {
    setAreaId(event.target.value);
    setPuestos([]);
    onChange('');
  };

  return (
    <>
      <FormControl fullWidth>
        <FormLabel sx={{ mb: 1 }}>Área</FormLabel>

        <Select
          value={areaId}
          onChange={handleAreaChange}
          displayEmpty
          disabled={loadingAreas}
        >
          <MenuItem value="" disabled>
            {loadingAreas ? 'Cargando áreas...' : 'Seleccioná un área'}
          </MenuItem>

          {areas.map((area) => (
            <MenuItem key={area.areaId} value={area.areaId}>
              {area.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth error={error}>
        <FormLabel sx={{ mb: 1 }}>Puesto</FormLabel>

        <Select
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          displayEmpty
          disabled={!areaId || loadingPuestos}
        >
          <MenuItem value="" disabled>
            {!areaId
              ? 'Primero seleccioná un área'
              : loadingPuestos
                ? 'Cargando puestos...'
                : 'Seleccioná un puesto'}
          </MenuItem>

          {puestos.map((item) => (
            <MenuItem key={item.areaPuestoId} value={item.areaPuestoId}>
              {item.puesto.nombre}
            </MenuItem>
          ))}
        </Select>

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </>
  );
}
