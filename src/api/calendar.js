import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
// utils
import { fetcher, endpoints } from 'src/utils/axios';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
import calendarioMethods from 'src/sections/calendario/calendario-repository';
import { formatISO } from 'date-fns';

// ----------------------------------------------------------------------

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetEvents() {
  const { data, isLoading, error, isValidating } = useSWR(
    endpoints.calendar.list,
    fetcher,
    options
  );

  const memoizedValue = useMemo(() => {
    // console.table(data);
    const events = (data?.events ?? data)?.map((event) => {
      if (event.ano) {
        // console.table(event);
        return convertToEvent(event);
      }
      return event;
    });

    return {
      events: events || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !data?.length,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

function convertToEvent(event) {
  let data_inicio = new Date(event.data_inicio);
  let data_final = new Date(event.data_final);
  let itsAllDay = data_inicio.getHours() == 3;
  return {
    id: event.id,
    title: event.titulo ?? '_titulo_',
    tipo: event.tipo,
    allDay: itsAllDay,
    start: data_inicio,
    end: data_final,
    description: event.descricao,
    // COLOR
    color: CALENDAR_COLOR_OPTIONS[0],
    textColor: CALENDAR_COLOR_OPTIONS[0],
  };
}

// ----------------------------------------------------------------------

export async function createEvent(eventData) {
  const payload = {
    titulo: eventData.title,
    tipo: eventData.tipo,
    data_inicio: formatISO(eventData.start),
    data_final: formatISO(eventData.end),
    descricao: eventData.description,
    ano_id: eventData.ano_id,
  };
  let response = await calendarioMethods.insertCalendario(payload);

  /**
   * Work in local
   */
  mutate(
    endpoints.calendar.list,
    (currentData) => {
      console.table(currentData);
      const events = [...(currentData.events ?? currentData), convertToEvent(response.data)];

      return {
        ...currentData,
        events,
      };
    },

    false
  );
}

// ----------------------------------------------------------------------

export async function updateEvent(eventData) {
  const payload = {
    titulo: eventData.title,
    tipo: eventData.tipo,
    data_inicio: formatISO(eventData.start),
    data_final: formatISO(eventData.end),
    descricao: eventData.description,
    ano_id: eventData.ano_id,
  };
  await calendarioMethods.updateCalendarioById(eventData.id, payload);

  /**
   * Work in local
   */
  mutate(
    endpoints.calendar.list,
    (currentData) => {
      const events = (currentData.events ?? currentData).map((event) =>
        event.id === eventData.id ? { ...event, ...eventData } : event
      );

      return {
        ...currentData,
        events,
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId) {
  await calendarioMethods.deleteCalendarioById(eventId);

  /**
   * Work in local
   */
  mutate(
    endpoints.calendar.list,
    (currentData) => {
      const events = (currentData.events ?? currentData).filter((event) => event.id !== eventId);

      return {
        ...currentData,
        events,
      };
    },
    false
  );
}
