import dayjs from 'dayjs';
import { API_URL } from '../../../services/api';
import { authService } from '../../../lib/auth';

export async function getGuideAvailability(fechaDesde, fechaHasta) {
  const params = new URLSearchParams({
    fechaDesde: dayjs(fechaDesde).format('YYYY-MM-DD'),
    fechaHasta: dayjs(fechaHasta).format('YYYY-MM-DD'),
  });

  const response = await authService.authenticatedFetch(
    `${API_URL}/api/v1/Guia/DisponibilidadGuias?${params.toString()}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    throw new Error('Error al obtener la disponibilidad de los guías');
  }

  const result = await response.json();

  return (
    result?.data ?? {
      desde: null,
      hasta: null,
      guiasDisponible: [],
    }
  );
}
