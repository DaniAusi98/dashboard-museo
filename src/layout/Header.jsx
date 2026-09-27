import Stack from "@mui/material/Stack";

import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";

import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import MenuButton from "./MenuButton";

export default function Header() {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        display: {
          xs: "none",
          md: "flex",
        },
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        pt: 2,
      }}
    >
      <NavbarBreadcrumbs />

      <Stack direction="row" spacing={1}>
        <MenuButton showBadge aria-label="Notificaciones">
          <NotificationsRoundedIcon />
        </MenuButton>
      </Stack>
    </Stack>
  );
}
