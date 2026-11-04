import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;

// DayOfWeek de C#:
// Domingo = 0, Lunes = 1, ..., Sábado = 6.
const diasSemana = [
  { nombre: 'Lunes', valor: 1 },
  { nombre: 'Martes', valor: 2 },
  { nombre: 'Miércoles', valor: 3 },
  { nombre: 'Jueves', valor: 4 },
  { nombre: 'Viernes', valor: 5 },
  { nombre: 'Sábado', valor: 6 },
  { nombre: 'Domingo', valor: 0 },
];

const esquemaGuia = z.object({
  nombre: z.string().trim().min(1, 'Ingresá el nombre'),
  apellido: z.string().trim().min(1, 'Ingresá el apellido'),
  email: z.string().trim().email('Ingresá un email válido'),
  telefono: z.string().trim().min(1, 'Ingresá el teléfono'),
});

const crearHorariosIniciales = () =>
  diasSemana.map((dia) => ({
    diaAsignado: dia.valor,
    habilitado: dia.valor >= 1 && dia.valor <= 5,
    horaInicio: '09:00',
    horaFin: '13:00',
  }));

export default function RegistrarGuia() {
  const [horarios, setHorarios] = useState(crearHorariosIniciales);
  const [turno, setTurno] = useState('manana');
  const [errorApi, setErrorApi] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaGuia),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
    },
  });

  const actualizarHorario = (indice, propiedad, valor) => {
    setHorarios((actuales) =>
      actuales.map((horario, i) =>
        i === indice ? { ...horario, [propiedad]: valor } : horario
      )
    );
  };

  const aplicarTurno = (nuevoTurno) => {
    setTurno(nuevoTurno);

    const horaInicio =
      nuevoTurno === 'manana' ? '09:00' : nuevoTurno === 'tarde' ? '14:00' : '';

    const horaFin =
      nuevoTurno === 'manana' ? '13:00' : nuevoTurno === 'tarde' ? '18:00' : '';

    setHorarios((actuales) =>
      actuales.map((horario) => {
        // La configuración rápida solo afecta lunes a viernes.
        if (horario.diaAsignado < 1 || horario.diaAsignado > 5) {
          return horario;
        }

        return {
          ...horario,
          habilitado: true,
          horaInicio,
          horaFin,
        };
      })
    );
  };

  const validarHorarios = () => {
    const activos = horarios.filter((h) => h.habilitado);

    if (activos.length === 0) {
      return 'Seleccioná al menos un día laboral.';
    }

    for (const horario of activos) {
      const dia = diasSemana.find((d) => d.valor === horario.diaAsignado);

      if (!horario.horaInicio || !horario.horaFin) {
        return `Completá las horas del ${dia.nombre}.`;
      }

      if (horario.horaInicio >= horario.horaFin) {
        return `La hora de inicio debe ser anterior a la hora de fin del ${dia.nombre}.`;
      }
    }

    return '';
  };

  const onSubmit = async (datos) => {
    setErrorApi('');
    setMensaje('');

    const errorHorario = validarHorarios();

    if (errorHorario) {
      setErrorApi(errorHorario);
      return;
    }

    const payload = {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: datos.email.trim(),
      telefono: datos.telefono.trim(),
      horarios: horarios
        .filter((h) => h.habilitado)
        .map(({ diaAsignado, horaInicio, horaFin }) => ({
          diaAsignado,
          horaInicio: `${horaInicio}:00`,
          horaFin: `${horaFin}:00`,
        })),
    };

    try {
      setGuardando(true);

      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/v1/Guia/Crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const texto = await response.text();
        throw new Error(
          texto || `Error al registrar el guía (${response.status})`
        );
      }

      setMensaje('Guía registrado correctamente.');
      reset();
      setHorarios(crearHorariosIniciales());
      setTurno('manana');
    } catch (error) {
      setErrorApi(error.message || 'No se pudo registrar el guía.');
    } finally {
      setGuardando(false);
    }
  };

  const limpiarFormulario = () => {
    reset();
    setHorarios(crearHorariosIniciales());
    setTurno('manana');
    setErrorApi('');
    setMensaje('');
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Registrar guía
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Completá los datos personales y configurá sus horarios laborales.
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Datos personales
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              label="Nombre"
              {...register('nombre')}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
              fullWidth
            />

            <TextField
              label="Apellido"
              {...register('apellido')}
              error={!!errors.apellido}
              helperText={errors.apellido?.message}
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />

            <TextField
              label="Teléfono"
              {...register('telefono')}
              error={!!errors.telefono}
              helperText={errors.telefono?.message}
              fullWidth
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Horarios laborales
          </Typography>

          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            Seleccioná un turno para completar los días hábiles o elegí
            personalizado para ingresar los horarios manualmente.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              select
              label="Configuración rápida de horarios"
              value={turno}
              onChange={(e) => aplicarTurno(e.target.value)}
              fullWidth
              helperText="Podés modificar individualmente cada horario después de seleccionarlo."
            >
              <MenuItem value="manana">Turno mañana (09:00–13:00)</MenuItem>

              <MenuItem value="tarde">Turno tarde (14:00–18:00)</MenuItem>

              <MenuItem value="personalizado">
                Personalizado (completar horarios manualmente)
              </MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {diasSemana.map((dia, indice) => {
              const horario = horarios[indice];

              return (
                <Box
                  key={dia.valor}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr 1fr',
                      sm: 'minmax(130px, 1fr) minmax(120px, 1fr) 24px minmax(120px, 1fr)',
                    },
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: horario.habilitado
                      ? 'primary.light'
                      : 'divider',
                    borderRadius: 2,
                    bgcolor: horario.habilitado
                      ? 'action.hover'
                      : 'transparent',
                  }}
                >
                  <FormControlLabel
                    sx={{
                      m: 0,
                      gridColumn: { xs: '1 / -1', sm: 'auto' },
                    }}
                    control={
                      <Checkbox
                        checked={horario.habilitado}
                        onChange={(e) =>
                          actualizarHorario(
                            indice,
                            'habilitado',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label={dia.nombre}
                  />

                  <TextField
                    label="Desde"
                    type="time"
                    size="small"
                    value={horario.horaInicio}
                    onChange={(e) =>
                      actualizarHorario(indice, 'horaInicio', e.target.value)
                    }
                    disabled={!horario.habilitado}
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                  />

                  <Typography
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      textAlign: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    a
                  </Typography>

                  <TextField
                    label="Hasta"
                    type="time"
                    size="small"
                    value={horario.horaFin}
                    onChange={(e) =>
                      actualizarHorario(indice, 'horaFin', e.target.value)
                    }
                    disabled={!horario.habilitado}
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                  />
                </Box>
              );
            })}
          </Box>

          {errorApi && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {errorApi}
            </Alert>
          )}

          {mensaje && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {mensaje}
            </Alert>
          )}

          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={2}
            sx={{ mt: 3, justifyContent: 'flex-end' }}
          >
            <Button
              variant="outlined"
              color="inherit"
              disabled={guardando}
              onClick={limpiarFormulario}
            >
              Limpiar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={guardando}
              startIcon={guardando ? <CircularProgress size={18} /> : null}
            >
              {guardando ? 'Guardando...' : 'Registrar guía'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
