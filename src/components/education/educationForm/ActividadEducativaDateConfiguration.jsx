import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import useNotifications from '../../hooks/notification/useNotifications';

const diasSemana = [
  { value: 'MO', label: 'Lun' },
  { value: 'TU', label: 'Mar' },
  { value: 'WE', label: 'Mié' },
  { value: 'TH', label: 'Jue' },
  { value: 'FR', label: 'Vie' },
  { value: 'SA', label: 'Sáb' },
  { value: 'SU', label: 'Dom' },
];

const ActividadEducativaDateConfiguration = ({
  initialDates,
  onActivityConfigurationChange,
  slotsNoDisponibles = [],
  salasIds = [],
  onClose,
}) => {
  const notifications = useNotifications();

  const [fechaInicio, setFechaInicio] = useState(null);
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaFin, setHoraFin] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  const [todoElDia, setTodoElDia] = useState(false);

  // =========================================================
  // SELECT PRINCIPAL DE REPETICIÓN
  // =========================================================

  const [recurrencia, setRecurrencia] = useState('none');

  // =========================================================
  // CONFIGURACIÓN INTERNA DE RECURRENCIA
  // =========================================================

  const [recurrenceConfig, setRecurrenceConfig] = useState({
    tipo: 'daily',
    intervalo: 1,
    diasSemana: [],
    tipoMensual: null,
    finalizacion: 'never',
    fechaFin: null,
    cantidadRepeticiones: null,
  });

  const [error, setError] = useState('');

  // =========================================================
  // HORARIO POR DEFECTO
  // =========================================================

  const obtenerHorarioPorDefecto = () => {
    const ahora = dayjs();

    let nuevaHoraInicio;

    if (ahora.minute() === 0 || ahora.minute() === 30) {
      nuevaHoraInicio = ahora;
    } else if (ahora.minute() < 30) {
      nuevaHoraInicio = ahora.minute(30);
    } else {
      nuevaHoraInicio = ahora.add(1, 'hour').minute(0);
    }

    const nuevaHoraFin = nuevaHoraInicio.add(1, 'hour');

    return {
      horaInicio: nuevaHoraInicio,
      horaFin: nuevaHoraFin,
    };
  };

  // =========================================================
  // INICIALIZAR FECHAS Y HORAS
  // =========================================================

  useEffect(() => {
    if (!initialDates) {
      return;
    }

    const nuevaFechaInicio = initialDates.fechaInicio
      ? dayjs(initialDates.fechaInicio)
      : null;

    const nuevaFechaFin = initialDates.fechaFin
      ? dayjs(initialDates.fechaFin)
      : nuevaFechaInicio;

    let nuevaHoraInicio = null;
    let nuevaHoraFin = null;

    if (initialDates.horaInicio && initialDates.horaFin) {
      nuevaHoraInicio = dayjs(`2000-01-01T${initialDates.horaInicio}`);

      nuevaHoraFin = dayjs(`2000-01-01T${initialDates.horaFin}`);
    } else if (nuevaFechaInicio) {
      const horario = obtenerHorarioPorDefecto();

      nuevaHoraInicio = horario.horaInicio;
      nuevaHoraFin = horario.horaFin;
    }

    setFechaInicio(nuevaFechaInicio);
    setFechaFin(nuevaFechaFin);
    setHoraInicio(nuevaHoraInicio);
    setHoraFin(nuevaHoraFin);

    setError('');
  }, [initialDates]);

  // =========================================================
  // OPCIONES MENSUALES
  // =========================================================

  const obtenerOpcionesMensuales = () => {
    if (!fechaInicio) {
      return [];
    }

    const diaDelMes = fechaInicio.date();
    const diaSemana = fechaInicio.day();

    const nombresDias = [
      'domingo',
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
    ];

    const nombreDia = nombresDias[diaSemana];

    const posicion = Math.ceil(diaDelMes / 7);

    const opciones = [
      {
        value: 'dayOfMonth',
        label: `Cada mes el ${diaDelMes}`,
      },
    ];

    if (posicion >= 1 && posicion <= 4) {
      const posiciones = {
        1: 'primer',
        2: 'segundo',
        3: 'tercer',
        4: 'cuarto',
      };

      opciones.push({
        value: 'weekdayPosition',
        label: `Cada mes el ${posiciones[posicion]} ${nombreDia}`,
      });
    }

    const siguienteSemana = fechaInicio.add(7, 'day');

    const esUltimaAparicion = siguienteSemana.month() !== fechaInicio.month();

    if (esUltimaAparicion) {
      opciones.push({
        value: 'lastWeekday',
        label: `Cada mes el último ${nombreDia}`,
      });
    }

    return opciones;
  };

  // =========================================================
  // OPCIONES DEL SELECT PRINCIPAL
  // =========================================================

  const obtenerOpcionesRepeticion = () => {
    if (!fechaInicio) {
      return [
        {
          value: 'none',
          label: 'No se repite',
        },
      ];
    }

    const nombresDias = {
      0: 'domingo',
      1: 'lunes',
      2: 'martes',
      3: 'miércoles',
      4: 'jueves',
      5: 'viernes',
      6: 'sábado',
    };

    const opciones = [
      {
        value: 'none',
        label: 'No se repite',
      },
      {
        value: 'daily',
        label: 'Cada día',
      },
      {
        value: 'weekly',
        label: `Cada semana el ${nombresDias[fechaInicio.day()]}`,
      },
    ];

    opciones.push(
      ...obtenerOpcionesMensuales().map((opcion) => {
        let value;

        switch (opcion.value) {
          case 'dayOfMonth':
            value = 'monthly-day';
            break;

          case 'weekdayPosition':
            value = 'monthly-weekday';
            break;

          case 'lastWeekday':
            value = 'monthly-last-weekday';
            break;

          default:
            value = opcion.value;
        }

        return {
          value,
          label: opcion.label,
        };
      })
    );

    opciones.push({
      value: 'custom',
      label: 'Personalizar',
    });

    return opciones;
  };

  // =========================================================
  // CAMBIO DEL SELECT PRINCIPAL
  // =========================================================

  const handleRecurrenciaChange = (value) => {
    setRecurrencia(value);

    if (value === 'none') {
      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: 'daily',
        intervalo: 1,
        diasSemana: [],
        tipoMensual: null,
        finalizacion: 'never',
        fechaFin: null,
        cantidadRepeticiones: null,
      }));

      return;
    }

    if (value === 'daily') {
      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: 'daily',
        intervalo: 1,
        diasSemana: [],
        tipoMensual: null,
      }));

      return;
    }

    if (value === 'weekly') {
      const dias = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: 'weekly',
        intervalo: 1,
        diasSemana: fechaInicio ? [dias[fechaInicio.day()]] : [],
        tipoMensual: null,
      }));

      return;
    }

    if (value === 'monthly-day') {
      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: 'monthly',
        intervalo: 1,
        diasSemana: [],
        tipoMensual: 'dayOfMonth',
      }));

      return;
    }

    if (value === 'monthly-weekday') {
      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: 'monthly',
        intervalo: 1,
        diasSemana: [],
        tipoMensual: 'weekdayPosition',
      }));

      return;
    }

    if (value === 'monthly-last-weekday') {
      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: 'monthly',
        intervalo: 1,
        diasSemana: [],
        tipoMensual: 'lastWeekday',
      }));

      return;
    }

    if (value === 'custom') {
      setRecurrenceConfig((prev) => ({
        ...prev,
        tipo: 'daily',
        intervalo: 1,
        diasSemana: [],
        tipoMensual: null,
      }));
    }
  };

  // =========================================================
  // CONSTRUIR RRULE
  // =========================================================

  const construirRRule = () => {
    if (!fechaInicio || recurrencia === 'none') {
      return null;
    }

    if (recurrencia === 'daily') {
      return 'FREQ=DAILY';
    }

    if (recurrencia === 'weekly') {
      const dia = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][fechaInicio.day()];

      return `FREQ=WEEKLY;BYDAY=${dia}`;
    }

    if (recurrencia === 'monthly-day') {
      return `FREQ=MONTHLY;BYMONTHDAY=${fechaInicio.date()}`;
    }

    if (recurrencia === 'monthly-weekday') {
      const dia = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][fechaInicio.day()];

      const posicion = Math.ceil(fechaInicio.date() / 7);

      return `FREQ=MONTHLY;BYDAY=${posicion}${dia}`;
    }

    if (recurrencia === 'monthly-last-weekday') {
      const dia = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][fechaInicio.day()];

      return `FREQ=MONTHLY;BYDAY=-1${dia}`;
    }

    if (recurrencia === 'custom') {
      const reglas = [];

      switch (recurrenceConfig.tipo) {
        case 'daily':
          reglas.push('FREQ=DAILY');
          break;

        case 'weekly':
          reglas.push('FREQ=WEEKLY');
          break;

        case 'monthly':
          reglas.push('FREQ=MONTHLY');
          break;

        default:
          return null;
      }

      if (recurrenceConfig.intervalo > 1) {
        reglas.push(`INTERVAL=${recurrenceConfig.intervalo}`);
      }

      if (recurrenceConfig.tipo === 'weekly') {
        if (recurrenceConfig.diasSemana.length > 0) {
          reglas.push(`BYDAY=${recurrenceConfig.diasSemana.join(',')}`);
        }
      }

      if (recurrenceConfig.tipo === 'monthly') {
        if (recurrenceConfig.tipoMensual === 'dayOfMonth') {
          reglas.push(`BYMONTHDAY=${fechaInicio.date()}`);
        }

        if (recurrenceConfig.tipoMensual === 'weekdayPosition') {
          const dias = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

          const codigoDia = dias[fechaInicio.day()];
          const posicion = Math.ceil(fechaInicio.date() / 7);

          reglas.push(`BYDAY=${posicion}${codigoDia}`);
        }

        if (recurrenceConfig.tipoMensual === 'lastWeekday') {
          const dias = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

          const codigoDia = dias[fechaInicio.day()];

          reglas.push(`BYDAY=-1${codigoDia}`);
        }
      }

      if (
        recurrenceConfig.finalizacion === 'date' &&
        recurrenceConfig.fechaFin
      ) {
        reglas.push(`UNTIL=${recurrenceConfig.fechaFin.format('YYYYMMDD')}`);
      }

      if (
        recurrenceConfig.finalizacion === 'count' &&
        recurrenceConfig.cantidadRepeticiones
      ) {
        reglas.push(`COUNT=${recurrenceConfig.cantidadRepeticiones}`);
      }

      return reglas.join(';');
    }

    return null;
  };

  // =========================================================
  // VALIDAR DISPONIBILIDAD
  // =========================================================

  const validarDisponibilidad = () => {
    if (!fechaInicio) {
      setError('Seleccione una fecha de inicio');
      return false;
    }

    if (!fechaFin) {
      setError('Seleccione una fecha de finalización');
      return false;
    }

    if (!todoElDia && (!horaInicio || !horaFin)) {
      setError('Seleccione un horario');
      return false;
    }

    let inicio;
    let fin;

    if (todoElDia) {
      inicio = fechaInicio.startOf('day');
      fin = fechaFin.endOf('day');
    } else {
      inicio = fechaInicio
        .hour(horaInicio.hour())
        .minute(horaInicio.minute())
        .second(0);

      fin = fechaFin.hour(horaFin.hour()).minute(horaFin.minute()).second(0);
    }

    if (!fin.isAfter(inicio)) {
      setError('La fecha y hora de finalización debe ser posterior al inicio');

      return false;
    }

    const conflicto = slotsNoDisponibles.find((slot) => {
      if (!slot.inicio || !slot.fin) {
        return false;
      }

      const slotInicio = dayjs(slot.inicio);
      const slotFin = dayjs(slot.fin);

      return inicio.isBefore(slotFin) && fin.isAfter(slotInicio);
    });

    if (conflicto) {
      const fechaConflicto = dayjs(conflicto.inicio).format('DD/MM/YYYY');

      const horarioConflicto = `${dayjs(conflicto.inicio).format(
        'HH:mm'
      )} - ${dayjs(conflicto.fin).format('HH:mm')}`;

      const mensajeConflicto =
        conflicto.mensaje || 'Existe un período no disponible.';

      setError(
        `El horario no está disponible. ` +
          `Conflicto el ${fechaConflicto}, ` +
          `de ${horarioConflicto}. ` +
          mensajeConflicto
      );

      return false;
    }

    setError('');

    return true;
  };

  // =========================================================
  // GUARDAR CONFIGURACIÓN
  // =========================================================

  const guardarConfiguracion = () => {
    if (!validarDisponibilidad()) {
      return;
    }

    const configuracion = {
      fechaInicio: fechaInicio ? fechaInicio.format('YYYY-MM-DD') : null,

      horaInicio: todoElDia
        ? '00:00'
        : horaInicio
          ? horaInicio.format('HH:mm')
          : null,

      horaFin: todoElDia ? '23:59' : horaFin ? horaFin.format('HH:mm') : null,

      fechaFin: fechaFin ? fechaFin.format('YYYY-MM-DD') : null,

      recurrencia: construirRRule(),
    };

    console.log('Configuración enviada al padre:', configuracion);

    onActivityConfigurationChange(configuracion);
    onClose?.();
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          width: '100%',
          alignItems: {
            xs: 'stretch',
            sm: 'center',
          },
        }}
      >
        <DatePicker
          label="Fecha de inicio"
          value={fechaInicio}
          onChange={(newValue) => {
            setFechaInicio(newValue);

            if (!fechaFin || newValue?.isAfter(fechaFin, 'day')) {
              setFechaFin(newValue);
            }
          }}
          sx={{
            width: {
              xs: '100%',
              sm: 212,
            },
          }}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
        />

        {!todoElDia && (
          <TimePicker
            value={horaInicio}
            onChange={setHoraInicio}
            ampm={false}
            format="HH:mm"
            slots={{
              openPickerIcon: () => null,
            }}
            sx={{
              width: {
                xs: '100%',
                sm: 120,
              },
            }}
            slotProps={{
              field: {
                sx: {
                  width: '120px',
                },
              },
              textField: {
                placeholder: 'HH:mm',
              },
            }}
          />
        )}

        {!todoElDia && (
          <TimePicker
            value={horaFin}
            onChange={setHoraFin}
            ampm={false}
            format="HH:mm"
            slots={{
              openPickerIcon: () => null,
            }}
            sx={{
              width: {
                xs: '100%',
                sm: 120,
              },
            }}
            slotProps={{
              field: {
                sx: {
                  width: '120px',
                },
              },
              textField: {
                placeholder: 'HH:mm',
              },
            }}
          />
        )}

        <DatePicker
          label="Fecha de finalización"
          value={fechaFin}
          minDate={fechaInicio || undefined}
          onChange={setFechaFin}
          sx={{
            width: {
              xs: '100%',
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

      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={todoElDia}
              onChange={(event) => {
                const checked = event.target.checked;

                setTodoElDia(checked);

                if (checked) {
                  setHoraInicio(dayjs('2000-01-01T00:00'));

                  setHoraFin(dayjs('2000-01-01T23:59'));
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

      <FormControl fullWidth>
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

      {recurrencia === 'custom' && (
        <>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
            }}
          >
            <Typography>Repetir cada</Typography>

            <TextField
              type="number"
              value={recurrenceConfig.intervalo}
              onChange={(event) => {
                const valor = Number(event.target.value);

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
                onChange={(event) => {
                  setRecurrenceConfig((prev) => ({
                    ...prev,
                    tipo: event.target.value,
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

          {recurrenceConfig.tipo === 'weekly' && (
            <Box>
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
                {diasSemana.map((dia) => (
                  <ToggleButton key={dia.value} value={dia.value}>
                    {dia.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          )}

          {recurrenceConfig.tipo === 'monthly' && (
            <FormControl fullWidth>
              <InputLabel id="tipo-mensual-label">
                Repetición mensual
              </InputLabel>

              <Select
                labelId="tipo-mensual-label"
                value={recurrenceConfig.tipoMensual ?? ''}
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
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Termina
            </Typography>

            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={recurrenceConfig.finalizacion === 'never'}
                    onChange={() => {
                      setRecurrenceConfig((prev) => ({
                        ...prev,
                        finalizacion: 'never',
                        fechaFin: null,
                        cantidadRepeticiones: null,
                      }));
                    }}
                  />
                }
                label="Nunca"
              />

              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={recurrenceConfig.finalizacion === 'date'}
                      onChange={() => {
                        setRecurrenceConfig((prev) => ({
                          ...prev,
                          finalizacion: 'date',
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
                  disabled={recurrenceConfig.finalizacion !== 'date'}
                  minDate={fechaInicio || undefined}
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                />
              </Stack>

              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={recurrenceConfig.finalizacion === 'count'}
                      onChange={() => {
                        setRecurrenceConfig((prev) => ({
                          ...prev,
                          finalizacion: 'count',
                          fechaFin: null,
                        }));
                      }}
                    />
                  }
                  label="Después de"
                />

                <TextField
                  type="number"
                  value={recurrenceConfig.cantidadRepeticiones ?? ''}
                  onChange={(event) => {
                    const valor = event.target.value;

                    setRecurrenceConfig((prev) => ({
                      ...prev,
                      cantidadRepeticiones: valor === '' ? null : Number(valor),
                    }));
                  }}
                  disabled={recurrenceConfig.finalizacion !== 'count'}
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

      {error && <FormHelperText error>{error}</FormHelperText>}

      <Box
        sx={{
          mt: 1,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button variant="contained" onClick={guardarConfiguracion}>
          Guardar
        </Button>
      </Box>
    </Stack>
  );
};

export default ActividadEducativaDateConfiguration;
