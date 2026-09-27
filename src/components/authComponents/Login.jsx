import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { styled } from "@mui/material/styles";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Stack,
  TextField,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import ForgotPassword from "./forgotPassword";
import { Link as RouterLink } from "react-router-dom";
import MuiCard from "@mui/material/Card";
import { useAuth } from "../../auth/AuthContext";
const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2),
  background: "#f5f7fa",

  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));
export const SignInCard = styled(MuiCard)({
  width: "100%",
  maxWidth: 450,
  padding: 32,
  display: "flex",
  flexDirection: "column",
  gap: 16,
});
const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const Login = () => {
  const { login: loginUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      await loginUser(data.email, data.password);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignInContainer
      direction="column"
      sx={{ justifyContent: "space-between" }}
    >
      <SignInCard>
        <Typography variant="h5" align="center" gutterBottom>
          Iniciar Sesión
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
        >
          <FormControl fullWidth margin="normal">
            <FormLabel>Email</FormLabel>
            <TextField
              {...register("email")}
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              id="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              required
              fullWidth
              variant="outlined"
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <FormLabel>Contraseña</FormLabel>
            <TextField
              {...register("password")}
              type="password"
              error={!!errors.password}
              helperText={errors.password?.message}
              name="password"
              placeholder="••••••"
              id="password"
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
            />
          </FormControl>

          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <ForgotPassword open={open} handleClose={handleClose} />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
          <Link
            component="button"
            type="button"
            onClick={handleClickOpen}
            variant="body2"
            sx={{ alignSelf: "center" }}
          >
            Forgot your password?
          </Link>
        </Box>
        {/*<Divider>or</Divider>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => alert("Sign in with Google")}
            startIcon={<GoogleIcon />}
          >
            Sign in with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => alert("Sign in with Facebook")}
            startIcon={<FacebookIcon />}
          >
            Sign in with Facebook
          </Button>
          </Box>
            */}

        <Typography sx={{ textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <Link component={RouterLink} to="/signUp" variant="body2">
            Sign up
          </Link>
        </Typography>
      </SignInCard>
    </SignInContainer>
  );
};
