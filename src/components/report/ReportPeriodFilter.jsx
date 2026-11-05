import { useState } from 'react';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function ReportPeriodFilter({
  fechaDesdeInicial = dayjs().startOf('month'),
  fechaHastaInicial = null,
  onAplicar,
}) {
  const [fechaDesde, setFechaDesde] = useState(fechaDesdeInicial);
  const [fechaHasta, setFechaHasta] = useState(fechaHastaInicial);

  const aplicarPeriodo = () => {
    if (!fechaDesde || !fechaDesde.isValid()) return;

    if (fechaHasta && !fechaHasta.isValid()) return;

    if (fechaHasta && fechaDesde.isAfter(fechaHasta)) return;

    onAplicar(fechaDesde, fechaHasta);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', sm: 'flex-end' },
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      <DatePicker
        label="Fecha"
        value={fechaDesde}
        onChange={(newValue) => {
          setFechaDesde(newValue);

          if (fechaHasta && newValue && newValue.isAfter(fechaHasta)) {
            setFechaHasta(null);
          }
        }}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            size: 'small',
            sx: { width: 160 },
          },
        }}
      />

      <Typography>-</Typography>

      <DatePicker
        label=" Fecha hasta"
        value={fechaHasta}
        disabled={!fechaDesde || !fechaDesde.isValid()}
        onChange={setFechaHasta}
        minDate={fechaDesde}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            size: 'small',
            sx: { width: 160 },
          },
        }}
      />

      <Button
        variant="contained"
        size="small"
        onClick={aplicarPeriodo}
        disabled={!fechaDesde || !fechaDesde.isValid()}
        sx={{
          height: 34,
          fontSize: '0.8rem',
        }}
      >
        Aplicar
      </Button>
    </Box>
  );
}
