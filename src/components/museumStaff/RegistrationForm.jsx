import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Stack,
  TextField,
  Typography,
  Card,
} from '@mui/material';
import RolSelect from './RolSelect';

import { styled } from '@mui/material/styles';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';

import dayjs from 'dayjs';

import { useAuth } from '../../auth/AuthContext';
import useNotifications from '../../components/hooks/notification/useNotifications';

import { useForm, Controller } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const FormContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const FormCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 500,
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
}));

const schema = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio'),

    apellido: z.string().trim().min(1, 'El apellido es obligatorio'),

    dni: z.string().trim().min(1, 'El DNI es obligatorio'),

    email: z.string().email('Email inválido'),

    telefono: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),

    fechaNacimiento: z
      .any()
      .refine(
        (date) =>
          date &&
          dayjs.isDayjs(date) &&
          date.isValid() &&
          !date.isAfter(dayjs(), 'day'),
        'Ingresá una fecha de nacimiento válida'
      ),

    rolUsuarioId: z.string().min(1, 'Seleccioná un rol'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .regex(/[A-Z]/, 'Debe contener una mayúscula')
      .regex(/[a-z]/, 'Debe contener una minúscula')
      .regex(/[0-9]/, 'Debe contener un número')
      .regex(/[^A-Za-z0-9]/, 'Debe contener un carácter especial'),

    confirmPassword: z
      .string()
      .min(6, 'La confirmación debe tener al menos 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const SignUpStaffMuseum = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useNotifications();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      fechaNacimiento: null,
      rolUsuarioId: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const { confirmPassword, ...personal } = data;

      await registerUser({
        ...personal,
        fechaNacimiento: personal.fechaNacimiento.format('YYYY-MM-DD'),
      });

      success('Personal registrado correctamente');

      navigate('/SignIn');
    } catch (err) {
      console.error(err);
      error('No se pudo registrar el personal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormContainer>
        <FormCard elevation={3}>
          <Typography component="h1" variant="h4">
            Registro de usuario
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Nombre</FormLabel>
              <TextField
                {...register('nombre')}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Apellido</FormLabel>
              <TextField
                {...register('apellido')}
                error={!!errors.apellido}
                helperText={errors.apellido?.message}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>DNI</FormLabel>
              <TextField
                {...register('dni')}
                error={!!errors.dni}
                helperText={errors.dni?.message}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Fecha de nacimiento</FormLabel>

              <Controller
                name="fechaNacimiento"
                control={control}
                render={({ field }) => (
                  <DateField
                    value={field.value}
                    onChange={field.onChange}
                    format="DD/MM/YYYY"
                    maxDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.fechaNacimiento,
                        helperText: errors.fechaNacimiento?.message,
                      },
                    }}
                  />
                )}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Email</FormLabel>
              <TextField
                {...register('email')}
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Teléfono</FormLabel>
              <TextField
                {...register('telefono')}
                error={!!errors.telefono}
                helperText={errors.telefono?.message}
              />
            </FormControl>

            <Controller
              name="rolUsuarioId"
              control={control}
              render={({ field }) => (
                <RolSelect
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.rolUsuarioId}
                  helperText={errors.rolUsuarioId?.message}
                />
              )}
            />

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Contraseña</FormLabel>
              <TextField
                type="password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Confirmar contraseña</FormLabel>
              <TextField
                type="password"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            </FormControl>

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </Box>
        </FormCard>
      </FormContainer>
    </LocalizationProvider>
  );
};
