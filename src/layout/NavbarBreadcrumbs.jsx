import { useLocation } from "react-router-dom";

import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";

import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
}));

const routeNames = {
  "/": "Calendario General",
  "/groupVisits": "Visitas Guiadas",
  "/eventsActivities": "Eventos y Actividades",
  "/education": "Educación",
  "/eventProposals": "Propuestas de Eventos",
};

export default function NavbarBreadcrumbs() {
  const location = useLocation();

  const currentPage = routeNames[location.pathname] || "Página";

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">Dashboard</Typography>

      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {currentPage}
      </Typography>
    </StyledBreadcrumbs>
  );
}
