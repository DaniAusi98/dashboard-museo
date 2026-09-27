import { useState } from "react";

import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import MenuButton from "./MenuButton";

export default function OptionsMenu() {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <MenuButton aria-label="Open menu" onClick={handleClick}>
        <MoreVertRoundedIcon />
      </MenuButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleClose}>Perfil</MenuItem>

        <MenuItem onClick={handleClose}>Mi cuenta</MenuItem>

        <Divider />

        <MenuItem onClick={handleClose}>Configuración</MenuItem>

        <Divider />

        <MenuItem onClick={handleClose}>
          <ListItemText>Cerrar sesión</ListItemText>

          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  );
}
