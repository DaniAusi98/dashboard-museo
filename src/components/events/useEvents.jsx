import { useCallback, useState } from 'react';
import { getEventsReport, getEventsByRoomReport } from './eventsService';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventsByRoom, setEventsByRoom] = useState([]);

  const fetchEvents = useCallback(async (desde, hasta) => {
    try {
      setLoading(true);

      const response = await getEventsReport(desde, hasta);

      setEvents(response.data.items);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchEventsByRoom = useCallback(async (desde, hasta) => {
    try {
      setLoading(true);

      const response = await getEventsByRoomReport(desde, hasta);

      setEventsByRoom(
        response.data.items.map((item, index) => ({
          ...item,
          id: index,
        }))
      );
    } catch (error) {
      console.error('Error cargando eventos por sala:', error);
      setEventsByRoom([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    eventsByRoom,
    loading,
    fetchEvents,
    fetchEventsByRoom,
  };
}
