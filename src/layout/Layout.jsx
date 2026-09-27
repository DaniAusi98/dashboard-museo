import { Box, Stack } from "@mui/material";
import { Outlet } from "react-router-dom";

import Typography from "@mui/material/Typography";

import SideMenu from "./SideMenu";
import AppNavbar from "./AppNavbarMobile";
import Header from "./Header";

export default function DashboardLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <SideMenu />
      <AppNavbar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        <Stack
          spacing={2}
          sx={{
            mx: {
              xs: 1,
              sm: 2,
              md: 3,
            },
            pb: 5,
            mt: {
              xs: 8,
              md: 0,
            },
          }}
        >
          <Header />

          <Outlet />
        </Stack>
      </Box>
    </Box>
  );
}
