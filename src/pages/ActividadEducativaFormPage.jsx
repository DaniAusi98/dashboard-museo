import { Box, Typography, Paper } from '@mui/material';
import FormularioActividadEducativa from '../components/education/educationForm/EducationalActivityForm';

export default function ActividadEducativaFormPage() {
  return (
    <Box sx={{ width: '100%', p: { xs: 2, md: 3 } }}>
      <Paper
        elevation={2}
        sx={{
          maxWidth: 1100,
          mx: 'auto',
          p: { xs: 2, md: 4 },
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          Nueva actividad educativa
        </Typography>

        <FormularioActividadEducativa />
      </Paper>
    </Box>
  );
}
