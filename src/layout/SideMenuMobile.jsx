import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";

import MenuButton from "./MenuButton";
import MenuContent from "./MenuContent";

export default function SideMenuMobile({ open, toggleDrawer }) {
  const handleNavigate = (event) => {
    const path = event.currentTarget.getAttribute("href");

    if (!path?.startsWith("/reports")) {
      toggleDrawer(false)();
    }
  };

  return (
    <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
      <Stack
        sx={{
          width: 280,
          height: "100%",
        }}
      >
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
          }}
        >
          <Stack
            direction="row"
            sx={{
              gap: 1,
              alignItems: "center",
              flexGrow: 1,
            }}
          >
            <Avatar
              sx={{
                width: 24,
                height: 24,
              }}
            />

            <Typography variant="h6">Usuario</Typography>
          </Stack>

          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>

        <Divider />

        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent onNavigate={handleNavigate} />
        </Stack>

        <Divider />

        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
          >
            Cerrar sesión
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
