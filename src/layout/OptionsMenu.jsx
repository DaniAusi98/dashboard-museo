import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

import { useAuth } from '../auth/AuthContext';
import MenuButton from './MenuButton';

export default function OptionsMenu({ onAction }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAuthAction = () => {
    handleClose();
    if (isAuthenticated) {
      logout();
    }
    onAction?.();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <MenuButton aria-label="Abrir menú de usuario" onClick={handleClick}>
        <MoreVertRoundedIcon />
      </MenuButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {isAuthenticated && (
          <>
            <MenuItem onClick={handleClose}>Perfil</MenuItem>

            <MenuItem onClick={handleClose}>Mi cuenta</MenuItem>

            <Divider />

            <MenuItem onClick={handleClose}>Configuración</MenuItem>

            <Divider />
          </>
        )}

        <MenuItem onClick={handleAuthAction}>
          <ListItemText>
            {isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión'}
          </ListItemText>

          <ListItemIcon>
            {isAuthenticated ? (
              <LogoutRoundedIcon fontSize="small" />
            ) : (
              <LoginRoundedIcon fontSize="small" />
            )}
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  );
}
