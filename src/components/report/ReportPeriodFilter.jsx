import { useState } from "react";
import dayjs from "dayjs";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function ReportPeriodFilter({
  fechaDesdeInicial = dayjs().startOf("month"),
  fechaHastaInicial = dayjs().endOf("month"),
  onAplicar,
}) {
  const [fechaDesde, setFechaDesde] = useState(fechaDesdeInicial);
  const [fechaHasta, setFechaHasta] = useState(fechaHastaInicial);

  const aplicarPeriodo = () => {
    if (
      !fechaDesde ||
      !fechaHasta ||
      !fechaDesde.isValid() ||
      !fechaHasta.isValid()
    ) {
      return;
    }

    if (fechaDesde.isAfter(fechaHasta)) {
      return;
    }

    onAplicar(fechaDesde, fechaHasta);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: {
          xs: "flex-start",
          sm: "flex-end",
        },
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      <DatePicker
        value={fechaDesde}
        onChange={(newValue) => setFechaDesde(newValue)}
        maxDate={fechaHasta}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            size: "small",
            sx: {
              width: 160,
              "& .MuiInputBase-input": {
                fontSize: "0.8rem",
                py: 0.7,
              },
            },
          },
        }}
      />

      <Typography>-</Typography>

      <DatePicker
        value={fechaHasta}
        onChange={(newValue) => setFechaHasta(newValue)}
        minDate={fechaDesde}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            size: "small",
            sx: {
              width: 160,
              "& .MuiInputBase-input": {
                fontSize: "0.8rem",
                py: 0.7,
              },
            },
          },
        }}
      />

      <Button
        variant="contained"
        size="small"
        onClick={aplicarPeriodo}
        sx={{
          height: 34,
          fontSize: "0.8rem",
        }}
      >
        Aplicar
      </Button>
    </Box>
  );
}
