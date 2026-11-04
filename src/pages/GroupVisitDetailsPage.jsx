import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { API_URL } from '../services/api';
import { authService } from '../lib/auth';

function DetailItem({ label, children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'minmax(220px, 1fr) 2fr',
        },
        gap: { xs: 0.25, sm: 2 },
        px: 2,
        py: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>

      <Typography sx={{ overflowWrap: 'anywhere' }}>
        {children ?? '-'}
      </Typography>
    </Box>
  );
}

function DetailSection({ title, children }) {
  return (
    <Box component="section" sx={{ py: 1 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ px: 2, pt: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('es-AR') : '-';
}

function formatTime(value) {
  return value
    ? new Date(value).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '-';
}

export default function GroupVisitDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReservation() {
      try {
        setLoading(true);
        setError('');

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/VisitasGuiadas/${id}`
        );

        if (!response.ok) {
          throw new Error('No se pudo obtener el detalle de la visita.');
        }

        const data = await response.json();
        setReservation(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Ocurrió un error al cargar la visita.');
      } finally {
        setLoading(false);
      }
    }

    loadReservation();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !reservation) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error || 'No se encontró la visita.'}</Alert>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/groupVisits')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Volver a visitas
        </Button>
      </Stack>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Detalle de visita guiada
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          maxWidth: 900,
          mx: 'auto',
          overflow: 'hidden',
          borderRadius: 2,
          '& > section + section': {
            borderTop: 1,
            borderColor: 'divider',
          },
        }}
      >
        <DetailSection title="Datos de la visita">
          <DetailItem label="Fecha">
            {formatDate(reservation.fechaInicio)}
          </DetailItem>
          <DetailItem label="Horario">
            {formatTime(reservation.fechaInicio)} -{' '}
            {formatTime(reservation.fechaFin)}
          </DetailItem>
          <DetailItem label="Estado">{reservation.estado || '-'}</DetailItem>
          <DetailItem label="Confirmación">
            {reservation.estadoConfirmacion || '-'}
          </DetailItem>
        </DetailSection>

        <DetailSection title="Datos de la institución">
          <DetailItem label="Institución">{reservation.institucion}</DetailItem>
          <DetailItem label="País">{reservation.paisInstitucion}</DetailItem>
          <DetailItem label="Provincia">
            {reservation.provinciaInstitucion}
          </DetailItem>
          <DetailItem label="Localidad">
            {reservation.ciudadInstitucion}
          </DetailItem>
          <DetailItem label="Email">{reservation.emailInstitucion}</DetailItem>
          <DetailItem label="Teléfono">
            {reservation.telefonoInstitucion}
          </DetailItem>
        </DetailSection>

        <DetailSection title="Datos del solicitante y del grupo">
          <DetailItem label="Nombre">
            {reservation.nombreSolicitante}
          </DetailItem>
          <DetailItem label="Apellido">
            {reservation.apellidoSolicitante}
          </DetailItem>
          <DetailItem label="Email">
            {reservation.emailSolicitante?.valor}
          </DetailItem>
          <DetailItem label="Teléfono">
            {reservation.telefonoSolicitante?.valor}
          </DetailItem>
          <DetailItem label="Nivel educativo">
            {reservation.nivelCurso}
          </DetailItem>
          <DetailItem label="Sala / grado / año">
            {reservation.anioCurso}
          </DetailItem>
          <DetailItem label="Cantidad de personas">
            {reservation.cantidadPersonas}
          </DetailItem>
          <DetailItem label="Temáticas">
            {reservation.tematicasDto?.length
              ? reservation.tematicasDto.map((t) => t.nombre).join(', ')
              : '-'}
          </DetailItem>
        </DetailSection>

        <DetailSection title="Información adicional">
          <DetailItem label="Discapacidad o diversidad funcional">
            {reservation.descripcionDiscapacidad}
          </DetailItem>
          <DetailItem label="Motivo de la visita">
            {reservation.motivoVisita}
          </DetailItem>
          <DetailItem label="Observaciones">
            {reservation.observaciones}
          </DetailItem>
        </DetailSection>
      </Paper>

      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/groupVisits')}
        >
          Volver a visitas
        </Button>
      </Box>
    </Box>
  );
}
