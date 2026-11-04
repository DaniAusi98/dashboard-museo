import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { authService } from '../../lib/auth';
import useNotifications from '../hooks/notification/useNotifications';
import { API_URL } from '../../services/api';

const CompletarMuestraTemporal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const [muestraId, setMuestraId] = useState('');
};
