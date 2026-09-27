import { useState } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";

import SideMenuMobile from "./SideMenuMobile";
import MenuButton from "./MenuButton";

export default function AppNavbar() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          display: { xs: "flex", md: "none" },
        }}
      >
        <Toolbar>
          <Stack
            direction="row"
            sx={{
              width: "100%",
              alignItems: "center",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                mr: "auto",
              }}
            >
              <CustomIcon />

              <Typography variant="h6" component="h1">
                Museo
              </Typography>
            </Stack>

            <MenuButton aria-label="Abrir menú" onClick={toggleDrawer(true)}>
              <MenuRoundedIcon />
            </MenuButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <SideMenuMobile open={open} toggleDrawer={toggleDrawer} />
    </>
  );
}

function CustomIcon() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <DashboardRoundedIcon />
    </Box>
  );
}
