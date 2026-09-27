import { useContext } from "react";

import NotificationsContext from "./NotificationContext";

export default function useNotifications() {
  const notifications = useContext(NotificationsContext);

  if (!notifications) {
    throw new Error("NotificationsProvider no encontrado");
  }

  return notifications;
}
