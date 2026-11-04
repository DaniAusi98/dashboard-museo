import { NavLink, useLocation } from 'react-router-dom';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

const mainListItems = [
  {
    text: 'Calendario General',
    path: '/',
    icon: <CalendarMonthRoundedIcon />,
  },
  {
    text: 'Visitas Grupales',
    path: '/groupVisits',
    icon: <GroupsRoundedIcon />,
  },
  {
    text: 'Eventos y Actividades',
    path: '/eventsActivities',
    icon: <EventRoundedIcon />,
  },
  {
    text: 'Educación',
    path: '/education',
    icon: <SchoolRoundedIcon />,
  },
  {
    text: 'Configuracion de Horario',
    path: '/museumHours',
    icon: <SettingsRoundedIcon />,
  },
  {
    text: 'Reportes',
    path: '/reports',
    icon: <AssessmentRoundedIcon />,
  },
];

const educationListItems = [
  {
    text: 'Actividades educativas',
    path: '/education',
    icon: <SchoolRoundedIcon />,
  },
  {
    text: 'Disponibilidad de guías',
    path: '/guideAvailability',
    icon: <CalendarMonthRoundedIcon />,
  },
  {
    text: 'Configuración de visitas grupales',
    path: '/groupVisitConfiguration',
    icon: <SettingsRoundedIcon />,
  },
];

const eventsListItems = [
  {
    text: 'Eventos',
    path: '/eventsActivities',
    icon: <EventRoundedIcon />,
  },
  {
    text: 'Propuestas de eventos',
    path: '/eventProposal',
    icon: <DescriptionRoundedIcon />,
  },
  {
    text: 'Calendario y disponibilidad',
    path: '/eventsCalendar',
    icon: <CalendarMonthRoundedIcon />,
  },
];

const secondaryListItems = [
  {
    text: 'Configuración',
    path: '/settings',
    icon: <SettingsRoundedIcon />,
  },
];

const reportsListItems = [
  {
    text: 'Visitas Grupales',
    path: '/reports/groupVisits',
    icon: <GroupsRoundedIcon />,
  },
  {
    text: 'Eventos',
    path: '/reports/events',
    icon: <EventRoundedIcon />,
  },
];

export default function MenuContent({ onNavigate }) {
  const location = useLocation();

  const isReportsMenu = location.pathname.startsWith('/reports');

  const isEducationMenu =
    location.pathname.startsWith('/education') ||
    location.pathname.startsWith('/guideAvailability') ||
    location.pathname.startsWith('/groupVisitConfiguration');

  const isEventsMenu =
    location.pathname.startsWith('/eventsActivities') ||
    location.pathname.startsWith('/eventProposal') ||
    location.pathname.startsWith('/eventsCalendar');

  const listItems = isReportsMenu
    ? reportsListItems
    : isEducationMenu
      ? educationListItems
      : isEventsMenu
        ? eventsListItems
        : mainListItems;

  const isSubMenu = isReportsMenu || isEducationMenu || isEventsMenu;

  return (
    <Stack
      sx={{
        flexGrow: 1,
        p: 1,
        justifyContent: 'space-between',
      }}
    >
      <List dense>
        {isSubMenu && (
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={NavLink} to="/" onClick={onNavigate}>
              <ListItemIcon>
                <ArrowBackRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Volver" />
            </ListItemButton>
          </ListItem>
        )}

        {listItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={onNavigate}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        {secondaryListItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={onNavigate}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
