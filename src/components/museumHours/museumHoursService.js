import { API_URL } from '../../services/api';

import authService from '../../lib/auth';

const response = await authService.authenticatedFetch(
  `${API_URL}/api/v1/ConfiguracionHorarioMuseo/set-museum-hours`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  }
);

if (!response.ok) {
  throw new Error('No se pudo guardar la configuración.');
}

const resultado = await response.json();
