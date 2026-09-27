import { useCallback, useState } from "react";
import { getEventsReport } from "./eventsService";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async (desde, hasta) => {
    try {
      setLoading(true);

      const response = await getEventsReport(desde, hasta);

      setEvents(response.data.items);
    } catch (error) {
      console.error("Error cargando eventos:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    loading,
    fetchEvents,
  };
}
