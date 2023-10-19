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
  const { data, isLoading, error, isValidating } = useSWR(endpoints.calendar.list, fetcher, options);

  const memoizedValue = useMemo(() => {
    // console.table(data);
    const events = data?.map((event) => {
      // console.table(event);
      
      return ({
        id: event.id,
        title: event.titulo ?? '_titulo_',
        tipo: event.tipo,
        allDay: true,
        start: new Date(event.data_inicio),
        end: new Date(event.data_final),
        description: event.descricao,
        // COLOR
        color: CALENDAR_COLOR_OPTIONS[0],
        textColor: CALENDAR_COLOR_OPTIONS[0],
      });
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

// ----------------------------------------------------------------------

export async function createEvent(eventData) {
  const data = {
    titulo: eventData.title, 
    tipo: eventData.tipo, 
    data_inicio: formatISO(eventData.start), 
    data_final: formatISO(eventData.end), 
    descricao: eventData.description, 
    ano_id: eventData.ano_id,
  };
  await calendarioMethods.insertCalendario(data);

  /**
   * Work in local
   */
  // mutate(
  //   endpoints.calendar.post,
  //   (currentData) => {
  //     console.table(currentData);
  //     const events = [...currentData, eventData];

  //     return {
  //       ...currentData,
  //       events,
  //     };
  //   },

  //   false
  // );
}

// ----------------------------------------------------------------------

export async function updateEvent(eventData) {
  const data = {
    titulo: eventData.title, 
    tipo: eventData.tipo, 
    data_inicio: formatISO(eventData.start), 
    data_final: formatISO(eventData.end), 
    descricao: eventData.description, 
    ano_id: eventData.ano_id,
  };
  await calendarioMethods.updateCalendarioById(eventData.id, data);

  // await axios.put(endpoints.calendar, data);

  /**
   * Work in local
   */
//   mutate(
//     `${endpoints.calendar.update}${eventData.id}`,
//     (currentData) => {
//       console.table(currentData);
//       const events = currentData.events.map((event) =>
//         event.id === eventData.id ? { ...event, ...eventData } : event
//       );

//       return {
//         ...currentData,
//         events,
//       };
//     },
//     false
//   );
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId) {
  
  await calendarioMethods.deleteCalendarioById(eventId);

  /**
   * Work in local
   */
  // mutate(
  //   `${endpoints.calendar.delete}${eventId}`,
  //   (currentData) => {
  //     const events = currentData.events.filter((event) => event.id !== eventId);

  //     return {
  //       ...currentData,
  //       events,
  //     };
  //   },
  //   false
  // );
}
