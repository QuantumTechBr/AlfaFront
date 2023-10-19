import { useMemo } from 'react';
import merge from 'lodash/merge';
// _mock
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';

// ----------------------------------------------------------------------

export default function useEvent(events, selectEventId, selectedRange, openForm) {
  const currentEvent = events.find((event) => event.id === selectEventId);

  const defaultValues = useMemo(
    () => ({
      id: '',
      editavel: true,
      title: '',
      tipo: '',
      allDay: true,
      start: selectedRange ? selectedRange.start : new Date().getTime(),
      end: selectedRange ? selectedRange.end : null, // new Date().getTime()
      description: '',
      // COLOR
      color: CALENDAR_COLOR_OPTIONS[0],
    }),
    [selectedRange]
  );

  if (!openForm) {
    return undefined;
  }

  if (currentEvent || selectedRange) {
    return merge({}, defaultValues, currentEvent);
  }

  return defaultValues;
}
