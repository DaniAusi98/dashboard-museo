import { useCallback, useMemo, useState } from "react";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import NotificationsContext from "./NotificationContext";

export default function NotificationsProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const [actionAlert, setActionAlert] = useState(null);

  // --------------------------------------------------
  // NOTIFICACIONES TEMPORALES
  // --------------------------------------------------

  const show = useCallback((message, options = {}) => {
    setNotification({
      message,
      severity: options.severity ?? "info",
      autoHideDuration: options.autoHideDuration ?? 3000,
    });
  }, []);

  const close = useCallback(() => {
    setNotification(null);
  }, []);

  const success = useCallback(
    (message, options = {}) => {
      show(message, {
        ...options,
        severity: "success",
      });
    },
    [show],
  );

  const error = useCallback(
    (message, options = {}) => {
      show(message, {
        ...options,
        severity: "error",
      });
    },
    [show],
  );

  const warning = useCallback(
    (message, options = {}) => {
      show(message, {
        ...options,
        severity: "warning",
      });
    },
    [show],
  );

  const info = useCallback(
    (message, options = {}) => {
      show(message, {
        ...options,
        severity: "info",
      });
    },
    [show],
  );

  // --------------------------------------------------
  // ALERTA PERSISTENTE CON ACCIÓN
  // --------------------------------------------------

  const showAction = useCallback((title, message, options = {}) => {
    setActionAlert({
      title,
      message,
      severity: options.severity ?? "success",
      actionText: options.actionText,
      onAction: options.onAction,
    });
  }, []);

  const closeAction = useCallback(() => {
    setActionAlert(null);
  }, []);

  const handleAction = useCallback(() => {
    if (actionAlert?.onAction) {
      actionAlert.onAction();
    }

    closeAction();
  }, [actionAlert, closeAction]);

  // --------------------------------------------------
  // CONTEXTO
  // --------------------------------------------------

  const value = useMemo(
    () => ({
      show,
      success,
      error,
      warning,
      info,
      close,

      showAction,
      closeAction,
    }),
    [show, success, error, warning, info, close, showAction, closeAction],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}

      {/* NOTIFICACIÓN TEMPORAL */}
      <Snackbar
        open={!!notification}
        autoHideDuration={notification?.autoHideDuration}
        onClose={close}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={notification?.severity}
          onClose={close}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>

      {/* ALERTA PERSISTENTE CON ACCIÓN */}
      {actionAlert && (
        <Box
          sx={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: (theme) => theme.zIndex.snackbar + 1,

            width: {
              xs: "calc(100% - 32px)",
              sm: 400,
            },
          }}
        >
          <Alert
            severity={actionAlert.severity}
            variant="filled"
            onClose={closeAction}
            sx={{
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                {actionAlert.title}
              </Typography>

              <Typography variant="body2">{actionAlert.message}</Typography>

              {actionAlert.actionText && (
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  onClick={handleAction}
                  sx={{
                    mt: 2,
                  }}
                >
                  {actionAlert.actionText}
                </Button>
              )}
            </Box>
          </Alert>
        </Box>
      )}
    </NotificationsContext.Provider>
  );
}
