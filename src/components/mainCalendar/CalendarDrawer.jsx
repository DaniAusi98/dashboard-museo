import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { Box, IconButton, Typography, Stack } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function CalendarDrawer({ calendarRef }) {
  const getApi = () => calendarRef.current?.getApi();

  const handlePrev = () => getApi()?.prev();
  const handleNext = () => getApi()?.next();

  const handleDateClick = (info) => {
    getApi()?.gotoDate(info.date);
  };

  const currentMonthLabel = getApi()?.getDate()?.toLocaleString("es-AR", {
    month: "long",
    year: "numeric",
  });
  return (
    <Box sx={{ width: 280, borderRight: "1px solid #eee", p: 1 }}>
      {/* HEADER MINI (MUI STYLE) */}
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <IconButton size="small" onClick={handlePrev}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        <Typography
          variant="subtitle2"
          sx={{ textTransform: "capitalize", fontWeight: 600 }}
        >
          {currentMonthLabel}
        </Typography>

        <IconButton size="small" onClick={handleNext}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* MINI CALENDAR */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        height="auto"
        contentHeight="auto"
        fixedWeekCount={false}
        dateClick={handleDateClick}
      />
    </Box>
  );
}
