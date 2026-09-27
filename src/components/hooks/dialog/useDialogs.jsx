import { useContext } from "react";

import DialogsContext from "./DialogsContext";

export default function useDialogs() {
  const dialogs = useContext(DialogsContext);

  if (!dialogs) {
    throw new Error("useDialogs debe utilizarse dentro de DialogsProvider");
  }

  return dialogs;
}
