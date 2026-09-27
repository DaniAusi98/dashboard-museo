import { useCallback, useMemo, useState } from "react";

import DialogsContext from "./DialogsContext";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

export default function DialogsProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        message,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    dialog.resolve(true);
    setDialog(null);
  };

  const handleCancel = () => {
    dialog.resolve(false);
    setDialog(null);
  };

  const value = useMemo(
    () => ({
      confirm,
    }),
    [confirm],
  );

  return (
    <DialogsContext.Provider value={value}>
      {children}

      <Dialog open={!!dialog} onClose={handleCancel} maxWidth="xs" fullWidth>
        <DialogTitle>{dialog?.options?.title ?? "Confirmar"}</DialogTitle>

        <DialogContent>{dialog?.message}</DialogContent>

        <DialogActions>
          <Button onClick={handleCancel}>
            {dialog?.options?.cancelText ?? "Cancelar"}
          </Button>

          <Button onClick={handleConfirm} color={dialog?.options?.severity}>
            {dialog?.options?.okText ?? "Aceptar"}
          </Button>
        </DialogActions>
      </Dialog>
    </DialogsContext.Provider>
  );
}
