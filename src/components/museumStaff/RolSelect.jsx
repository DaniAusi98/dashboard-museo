import { useEffect, useState } from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;

export default function RolSelect({ value, onChange, error, helperText }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/Usuario/getAllRoles`);

        if (!response.ok) {
          throw new Error('Error al obtener los roles');
        }

        const result = await response.json();
        setRoles(result.data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <FormControl fullWidth error={error}>
      <FormLabel sx={{ mb: 1 }}>Rol</FormLabel>

      <Select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        displayEmpty
        disabled={loading}
      >
        <MenuItem value="" disabled>
          {loading ? 'Cargando roles...' : 'Seleccioná un rol'}
        </MenuItem>

        {roles.map((rol) => (
          <MenuItem key={rol.id} value={rol.id}>
            {rol.name}
          </MenuItem>
        ))}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
