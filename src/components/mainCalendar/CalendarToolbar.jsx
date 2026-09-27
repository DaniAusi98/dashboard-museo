import {
  Stack,
  IconButton,
  Button,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function CalendarToolbar({ calendarRef, view, setView, title }) {
  const getApi = () => calendarRef.current?.getApi();

  const handlePrev = () => getApi()?.prev();
  const handleNext = () => getApi()?.next();
  const handleToday = () => getApi()?.today();

  const handleViewChange = (event) => {
    const newView = event.target.value;

    if (!newView) return;

    setView(newView);
    getApi()?.changeView(newView);
  };

  return (
    <Stack spacing={1}>
      {/* TITLE arriba SOLO en mobile */}
      <Typography
        variant="h6"
        sx={{
          fontSize: { xs: "1rem", md: "1.25rem" },
          display: { xs: "block", md: "none" },
        }}
      >
        {title}
      </Typography>

      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* CONTROLES IZQUIERDA */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleToday}
            sx={{
              height: "40px",
              color: "black",
              borderColor: "grey.400",
              "&:hover": {
                borderColor: "black",
                backgroundColor: "transparent",
              },
            }}
          >
            Hoy
          </Button>

          <Stack direction="row" spacing={0} sx={{ alignItems: "center" }}>
            <IconButton size="small" onClick={handlePrev}>
              <ChevronLeftIcon />
            </IconButton>

            <IconButton size="small" onClick={handleNext}>
              <ChevronRightIcon />
            </IconButton>
          </Stack>

          {/* TITLE en desktop */}
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1rem", md: "1.25rem" },
              display: { xs: "none", md: "block" },
            }}
          >
            {title}
          </Typography>
        </Stack>

        {/* SELECT DERECHA */}
        <Select
          size="small"
          value={view}
          onChange={handleViewChange}
          color="inherit"
        >
          <MenuItem value="dayGridMonth">Mes</MenuItem>
          <MenuItem value="timeGridWeek">Semana</MenuItem>
          <MenuItem value="timeGridDay">Día</MenuItem>
        </Select>
      </Stack>
    </Stack>
  );
}
