import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";

import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";

import MenuButton from "./MenuButton";
import MenuContent from "./MenuContent";
import UserMenu from "./UserMenu";

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
          <UserMenu compact onAction={() => toggleDrawer(false)()} />

          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>

        <Divider />

        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent onNavigate={handleNavigate} />
        </Stack>
      </Stack>
    </Drawer>
  );
}
