import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import useNotifications from "../hooks/notification/useNotifications";

import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

const EventDateConfiguration = ({
  initialDates,
  onEventConfigurationChange,
  slotsNoDisponibles,
  salasIds,
}) => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaFin, setHoraFin] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const notifications = useNotifications();
  const [todoElDia, setTodoElDia] = useState(false);

  // =========================================================
  // SELECT PRINCIPAL DE REPETICIÓN
  // =========================================================

  const [recurrencia, setRecurrencia] = useState("none");

  // =========================================================
  // CONFIGURACIÓN INTERNA DE RECURRENCIA
  // =========================================================

  const [recurrenceConfig, setRecurrenceConfig] = useState({
    tipo: "daily",
    intervalo: 1,
    diasSemana: [],
    tipoMensual: null,
    finalizacion: "never",
    fechaFin: null,
    cantidadRepeticiones: null,
  });

  // =========================================================
  // INICIALIZAR FECHAS Y HORAS DESDE FULLCALENDAR
  // =========================================================

  useEffect(() => {
    if (!initialDates) {
      return;
    }

    const nuevaFechaInicio = initialDates.fechaInicio
      ? dayjs(initialDates.fechaInicio)
      : null;

    setFechaInicio(nuevaFechaInicio);

    setFechaFin(nuevaFechaInicio);

    setHoraInicio(
      initialDates.horaInicio
        ? dayjs(`2000-01-01T${initialDates.horaInicio}`)
        : null,
    );

    setHoraFin(
      initialDates.horaFin ? dayjs(`2000-01-01T${initialDates.horaFin}`) : null,
    );
  }, [initialDates]);

  // =========================================================
  // CALCULAR HORARIO POR DEFECTO
  // =========================================================

  const obtenerHorarioPorDefecto = () => {
    const ahora = dayjs();

    let horaInicio;

    if (ahora.minute() === 0 || ahora.minute() === 30) {
      horaInicio = ahora;
    } else if (ahora.minute() < 30) {
      horaInicio = ahora.minute(30);
    } else {
      horaInicio = ahora.add(1, "hour").minute(0);
    }

    const horaFin = horaInicio.add(1, "hour");

    return {
      horaInicio,
      horaFin,
    };
  };

  // =========================================================
  // OPCIONES MENSUALES
  // =========================================================

  const obtenerOpcionesMensuales = () => {
    if (!fechaInicio) {
      return [];
    }

    const diaDelMes = fechaInicio.date();
    const diaSemana = fechaInicio.day();

    const diasSemana = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];

    const nombreDia = diasSemana[diaSemana];

    const posicion = Math.ceil(diaDelMes / 7);

    const opciones = [
      {
        value: "dayOfMonth",
        label: `Cada mes el ${diaDelMes}`,
      },
    ];

    // ---------------------------------------------------------
    // PRIMERA, SEGUNDA, TERCERA O CUARTA APARICIÓN
    // ---------------------------------------------------------

    if (posicion >= 1 && posicion <= 4) {
      const posiciones = {
        1: "primer",
        2: "segundo",
        3: "tercer",
        4: "cuarto",
      };

      opciones.push({
        value: "weekdayPosition",
        label: `Cada mes el ${posiciones[posicion]} ${nombreDia}`,
      });
    }

    // ---------------------------------------------------------
    // ÚLTIMA APARICIÓN DEL DÍA DE SEMANA
    // ---------------------------------------------------------

    const siguienteSemana = fechaInicio.add(7, "day");

    const esUltimaAparicion = siguienteSemana.month() !== fechaInicio.month();

    if (esUltimaAparicion) {
      opciones.push({
        value: "lastWeekday",
        label: `Cada mes el último ${nombreDia}`,
      });
    }

    return opciones;
  };

  // =========================================================
  // OPCIONES DEL SELECT PRINCIPAL "REPETICIÓN"
  // =========================================================

  const obtenerOpcionesRepeticion = () => {
    if (!fechaInicio) {
      return [
        {
          value: "none",
          label: "No se repite",
        },
      ];
    }

    const opciones = [
      {
        value: "none",
        label: "No se repite",
      },
      {
        value: "daily",
        label: "Cada día",
      },
    ];

    // ---------------------------------------------------------
    // CADA SEMANA EL DÍA DE LA FECHA DE INICIO
    // ---------------------------------------------------------

    const nombresDias = {
      0: "domingo",
      1: "lunes",
      2: "martes",
      3: "miércoles",
      4: "jueves",
      5: "viernes",
      6: "sábado",
    };

    opciones.push({
      value: "weekly",
      label: `Cada semana el ${nombresDias[fechaInicio.day()]}`,
    });

    // ---------------------------------------------------------
    // OPCIONES MENSUALES
    // ---------------------------------------------------------

    opciones.push(
      ...obtenerOpcionesMensuales().map((opcion) => {
        let value;

        switch (opcion.value) {
          case "dayOfMonth":
            value = "monthly-day";
            break;

          case "weekdayPosition":
            value = "monthly-weekday";
            break;

          case "lastWeekday":
            value = "monthly-last-weekday";
            break;

          default:
            value = opcion.value;
        }

        return {
          value,
          label: opcion.label,
        };
      }),
    );

    return opciones;
  };

  // =========================================================
  // CAMBIO DEL SELECT PRINCIPAL DE REPETICIÓN
  // =========================================================

  const handleRecurrenciaChange = (value) => {
    setRecurrencia(value);

    // ---------------------------------------------------------
    // NO SE REPITE
    // ---------------------------------------------------------

    if (value === "none") {
      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: "daily",
        intervalo: 1,
        diasSemana: [],
        tipoMensual: null,
        finalizacion: "never",
        fechaFin: null,
        cantidadRepeticiones: null,
      }));

      return;
    }

    // ---------------------------------------------------------
    // CADA DÍA
    // ---------------------------------------------------------

    if (value === "daily") {
      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: "daily",
        intervalo: 1,
        diasSemana: [],
        tipoMensual: null,
      }));

      return;
    }

    // ---------------------------------------------------------
    // CADA SEMANA EL DÍA DE INICIO
    // ---------------------------------------------------------

    if (value === "weekly") {
      const diasSemana = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: "weekly",
        intervalo: 1,
        diasSemana: [diasSemana[fechaInicio.day()]],
        tipoMensual: null,
      }));

      return;
    }

    // ---------------------------------------------------------
    // CADA MES EL DÍA DEL MES
    // ---------------------------------------------------------

    if (value === "monthly-day") {
      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: "monthly",
        intervalo: 1,
        diasSemana: [],
        tipoMensual: "dayOfMonth",
      }));

      return;
    }

    // ---------------------------------------------------------
    // CADA MES EL N-ÉSIMO DÍA DE SEMANA
    // ---------------------------------------------------------

    if (value === "monthly-weekday") {
      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: "monthly",
        intervalo: 1,
        diasSemana: [],
        tipoMensual: "weekdayPosition",
      }));

      return;
    }

    // ---------------------------------------------------------
    // CADA MES EL ÚLTIMO DÍA DE SEMANA
    // ---------------------------------------------------------

    if (value === "monthly-last-weekday") {
      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: "monthly",
        intervalo: 1,
        diasSemana: [],
        tipoMensual: "lastWeekday",
      }));
    }
  };

  // =========================================================
  // CONSTRUIR RRULE
  // =========================================================

  const construirRRule = () => {
    if (!fechaInicio || recurrencia === "none") {
      return "";
    }

    const partes = [];

    // ---------------------------------------------------------
    // FRECUENCIA
    // ---------------------------------------------------------

    switch (recurrenceConfig.tipo) {
      case "daily":
        partes.push("FREQ=DAILY");
        break;

      case "weekly":
        partes.push("FREQ=WEEKLY");
        break;

      case "monthly":
        partes.push("FREQ=MONTHLY");
        break;

      default:
        return "";
    }

    // ---------------------------------------------------------
    // INTERVALO
    // ---------------------------------------------------------

    if (recurrenceConfig.intervalo > 1) {
      partes.push(`INTERVAL=${recurrenceConfig.intervalo}`);
    }

    // ---------------------------------------------------------
    // SEMANAL
    // ---------------------------------------------------------

    if (recurrenceConfig.tipo === "weekly") {
      const dias = recurrenceConfig.diasSemana;

      if (dias.length > 0) {
        partes.push(`BYDAY=${dias.join(",")}`);
      }
    }

    // ---------------------------------------------------------
    // MENSUAL
    // ---------------------------------------------------------

    if (recurrenceConfig.tipo === "monthly") {
      if (recurrenceConfig.tipoMensual === "dayOfMonth") {
        partes.push(`BYMONTHDAY=${fechaInicio.date()}`);
      }

      if (recurrenceConfig.tipoMensual === "weekdayPosition") {
        const diasSemana = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

        const codigoDia = diasSemana[fechaInicio.day()];

        const posicion = Math.ceil(fechaInicio.date() / 7);

        partes.push(`BYDAY=${posicion}${codigoDia}`);
      }

      if (recurrenceConfig.tipoMensual === "lastWeekday") {
        const diasSemana = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

        const codigoDia = diasSemana[fechaInicio.day()];

        partes.push(`BYDAY=-1${codigoDia}`);
      }
    }

    // ---------------------------------------------------------
    // FINALIZACIÓN POR FECHA
    // ---------------------------------------------------------

    if (recurrenceConfig.finalizacion === "date" && recurrenceConfig.fechaFin) {
      partes.push(`UNTIL=${recurrenceConfig.fechaFin.format("YYYYMMDD")}`);
    }

    // ---------------------------------------------------------
    // FINALIZACIÓN POR CANTIDAD
    // ---------------------------------------------------------

    if (
      recurrenceConfig.finalizacion === "count" &&
      recurrenceConfig.cantidadRepeticiones
    ) {
      partes.push(`COUNT=${recurrenceConfig.cantidadRepeticiones}`);
    }

    return partes.join(";");
  };
  const validarDisponibilidad = () => {
    if (!fechaInicio || !fechaFin || !horaInicio || !horaFin) {
      notifications.error(
        "Las fechas y horarios seleccionados no son válidos.",
      );

      return false;
    }

    const inicioSeleccionado = dayjs(
      `${fechaInicio.format("YYYY-MM-DD")}T${horaInicio.format("HH:mm")}`,
    );

    const finSeleccionado = dayjs(
      `${fechaFin.format("YYYY-MM-DD")}T${horaFin.format("HH:mm")}`,
    );

    // ---------------------------------------------------------
    // VALIDAR QUE EL INTERVALO SEA CORRECTO
    // ---------------------------------------------------------

    if (!finSeleccionado.isAfter(inicioSeleccionado)) {
      notifications.error(
        "Las fechas y horarios seleccionados no son válidos. " +
          "La fecha y hora de finalización debe ser posterior a la de inicio.",
        {
          autoHideDuration: 5000,
        },
      );

      return false;
    }

    // ---------------------------------------------------------
    // BUSCAR SOLAPAMIENTOS
    // ---------------------------------------------------------

    const conflictos = (slotsNoDisponibles ?? []).filter((slot) => {
      if (!slot.inicio || !slot.fin) {
        return false;
      }

      const inicioSlot = dayjs(slot.inicio);
      const finSlot = dayjs(slot.fin);

      return (
        inicioSeleccionado.isBefore(finSlot) &&
        finSeleccionado.isAfter(inicioSlot)
      );
    });

    if (conflictos.length === 0) {
      return true;
    }

    // ---------------------------------------------------------
    // MOSTRAR CONFLICTOS
    // ---------------------------------------------------------

    const conflicto = conflictos[0];

    const inicioConflicto = dayjs(conflicto.inicio);
    const finConflicto = dayjs(conflicto.fin);

    const fechaConflicto = inicioConflicto.format("DD/MM/YYYY");
    const horarioConflicto = `${inicioConflicto.format(
      "HH:mm",
    )} - ${finConflicto.format("HH:mm")}`;

    const mensajeConflicto =
      conflicto.mensaje || "Existe un período no disponible.";

    notifications.error(
      `Las fechas y horarios seleccionados no son válidos. ` +
        `Conflicto el ${fechaConflicto}, de ${horarioConflicto}. ` +
        `${mensajeConflicto}`,
      {
        autoHideDuration: 7000,
      },
    );

    return false;
  };
  // =========================================================
  // GUARDAR CONFIGURACIÓN
  // =========================================================

  const guardarConfiguracion = () => {
    const disponible = validarDisponibilidad();

    if (!disponible) {
      return;
    }

    const configuracion = {
      fechaInicio: fechaInicio ? fechaInicio.format("YYYY-MM-DD") : null,

      horaInicio: horaInicio ? horaInicio.format("HH:mm") : null,

      horaFin: horaFin ? horaFin.format("HH:mm") : null,

      fechaFin: fechaFin ? fechaFin.format("YYYY-MM-DD") : null,

      recurrencia: construirRRule(),
    };

    console.log("Configuración enviada al padre:", configuracion);

    onEventConfigurationChange(configuracion);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box>
      {/* =====================================================
          FECHAS Y HORARIOS
      ===================================================== */}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          width: "100%",
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
        }}
      >
        {/* FECHA INICIO */}

        <DatePicker
          label="Fecha de inicio"
          value={fechaInicio}
          onChange={(newValue) => {
            setFechaInicio(newValue);
          }}
          sx={{
            width: {
              xs: "100%",
              sm: 212,
            },
          }}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
        />

        {/* HORA INICIO */}

        {!todoElDia && (
          <TimePicker
            value={horaInicio}
            onChange={(newValue) => {
              setHoraInicio(newValue);
            }}
            ampm={false}
            format="HH:mm"
            slots={{
              openPickerIcon: () => null,
            }}
            slotProps={{
              field: {
                sx: {
                  width: "120px",
                },
              },
              textField: {
                placeholder: "HH:mm",
              },
            }}
          />
        )}

        {/* HORA FIN */}

        {!todoElDia && (
          <TimePicker
            value={horaFin}
            onChange={(newValue) => {
              setHoraFin(newValue);
            }}
            ampm={false}
            format="HH:mm"
            slots={{
              openPickerIcon: () => null,
            }}
            slotProps={{
              field: {
                sx: {
                  width: "120px",
                },
              },
              textField: {
                placeholder: "HH:mm",
              },
            }}
          />
        )}

        {/* FECHA FIN */}

        <DatePicker
          label="Fecha de fin"
          value={fechaFin}
          onChange={(newValue) => {
            setFechaFin(newValue);
          }}
          sx={{
            width: {
              xs: "100%",
              sm: 212,
            },
          }}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
        />
      </Stack>

      {/* =====================================================
          TODO EL DÍA
      ===================================================== */}

      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={todoElDia}
              onChange={(event) => {
                const checked = event.target.checked;

                setTodoElDia(checked);

                if (checked) {
                  setHoraInicio(dayjs("2000-01-01T00:00"));
                  setHoraFin(dayjs("2000-01-01T23:59"));
                } else {
                  const { horaInicio, horaFin } = obtenerHorarioPorDefecto();

                  setHoraInicio(horaInicio);
                  setHoraFin(horaFin);
                }
              }}
            />
          }
          label="Todo el día"
        />
      </Box>

      {/* =====================================================
          SELECT PRINCIPAL: REPETICIÓN
      ===================================================== */}

      <FormControl fullWidth sx={{ mt: 1 }}>
        <InputLabel id="recurrencia-label">Repetición</InputLabel>

        <Select
          labelId="recurrencia-label"
          value={recurrencia}
          label="Repetición"
          onChange={(event) => {
            handleRecurrenciaChange(event.target.value);
          }}
        >
          {obtenerOpcionesRepeticion().map((opcion) => (
            <MenuItem key={opcion.value} value={opcion.value}>
              {opcion.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* =====================================================
          CONFIGURACIÓN DE RECURRENCIA
      ===================================================== */}

      {recurrencia !== "none" && (
        <>
          {/* =================================================
              INTERVALO + TIPO
          ================================================= */}

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              mt: 2,
            }}
          >
            <Typography>Repetir cada</Typography>

            <TextField
              type="number"
              value={recurrenceConfig.intervalo}
              onChange={(e) => {
                const valor = Number(e.target.value);

                setRecurrenceConfig((prev) => ({
                  ...prev,
                  intervalo: Math.max(1, valor),
                }));
              }}
              slotProps={{
                htmlInput: {
                  min: 1,
                  step: 1,
                },
              }}
              sx={{
                width: 90,
              }}
            />

            <FormControl
              sx={{
                minWidth: 120,
              }}
            >
              <Select
                value={recurrenceConfig.tipo}
                onChange={(e) => {
                  setRecurrenceConfig((prev) => ({
                    ...prev,
                    tipo: e.target.value,
                    diasSemana: [],
                    tipoMensual: null,
                  }));
                }}
              >
                <MenuItem value="daily">Día</MenuItem>

                <MenuItem value="weekly">Semana</MenuItem>

                <MenuItem value="monthly">Mes</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* =================================================
              CONFIGURACIÓN SEMANAL
          ================================================= */}

          {recurrenceConfig.tipo === "weekly" && (
            <Box sx={{ mt: 2 }}>
              <ToggleButtonGroup
                value={recurrenceConfig.diasSemana}
                onChange={(event, nuevosDias) => {
                  setRecurrenceConfig((prev) => ({
                    ...prev,
                    diasSemana: nuevosDias,
                  }));
                }}
                aria-label="Días de la semana"
              >
                <ToggleButton value="MO">L</ToggleButton>

                <ToggleButton value="TU">M</ToggleButton>

                <ToggleButton value="WE">X</ToggleButton>

                <ToggleButton value="TH">J</ToggleButton>

                <ToggleButton value="FR">V</ToggleButton>

                <ToggleButton value="SA">S</ToggleButton>

                <ToggleButton value="SU">D</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          {/* =================================================
              CONFIGURACIÓN MENSUAL
          ================================================= */}

          {recurrenceConfig.tipo === "monthly" && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="tipo-mensual-label">
                  Repetición mensual
                </InputLabel>

                <Select
                  labelId="tipo-mensual-label"
                  value={recurrenceConfig.tipoMensual ?? ""}
                  label="Repetición mensual"
                  onChange={(event) => {
                    setRecurrenceConfig((prev) => ({
                      ...prev,
                      tipoMensual: event.target.value,
                    }));
                  }}
                >
                  {obtenerOpcionesMensuales().map((opcion) => (
                    <MenuItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* =================================================
              FINALIZACIÓN
          ================================================= */}

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Termina
            </Typography>

            <Stack spacing={1}>
              {/* NUNCA */}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={recurrenceConfig.finalizacion === "never"}
                    onChange={() => {
                      setRecurrenceConfig((prev) => ({
                        ...prev,
                        finalizacion: "never",
                        fechaFin: null,
                        cantidadRepeticiones: null,
                      }));
                    }}
                  />
                }
                label="Nunca"
              />

              {/* FECHA */}

              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={recurrenceConfig.finalizacion === "date"}
                      onChange={() => {
                        setRecurrenceConfig((prev) => ({
                          ...prev,
                          finalizacion: "date",
                          cantidadRepeticiones: null,
                        }));
                      }}
                    />
                  }
                  label="El"
                />

                <DatePicker
                  value={recurrenceConfig.fechaFin}
                  onChange={(newValue) => {
                    setRecurrenceConfig((prev) => ({
                      ...prev,
                      fechaFin: newValue,
                    }));
                  }}
                  disabled={recurrenceConfig.finalizacion !== "date"}
                  slotProps={{
                    textField: {
                      size: "small",
                    },
                  }}
                />
              </Stack>

              {/* CANTIDAD DE REPETICIONES */}

              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={recurrenceConfig.finalizacion === "count"}
                      onChange={() => {
                        setRecurrenceConfig((prev) => ({
                          ...prev,
                          finalizacion: "count",
                          fechaFin: null,
                        }));
                      }}
                    />
                  }
                  label="Después de"
                />

                <TextField
                  type="number"
                  value={recurrenceConfig.cantidadRepeticiones ?? ""}
                  onChange={(event) => {
                    const valor = event.target.value;

                    setRecurrenceConfig((prev) => ({
                      ...prev,
                      cantidadRepeticiones: valor === "" ? null : Number(valor),
                    }));
                  }}
                  disabled={recurrenceConfig.finalizacion !== "count"}
                  size="small"
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      step: 1,
                    },
                  }}
                  sx={{
                    width: 100,
                  }}
                />

                <Typography sx={{ ml: 1 }}>repeticiones</Typography>
              </Stack>
            </Stack>
          </Box>
        </>
      )}

      {/* =====================================================
          GUARDAR
      ===================================================== */}

      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button variant="contained" onClick={guardarConfiguracion}>
          Guardar
        </Button>
      </Box>
    </Box>
  );
};

export default EventDateConfiguration;
