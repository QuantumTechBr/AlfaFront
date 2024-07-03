import { useMemo } from 'react';
import { useContext } from 'react';
import merge from 'lodash/merge';
// _mock
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';

import { AuthContext } from 'src/auth/context/alfa';

// ----------------------------------------------------------------------

export default function useEvent(events, selectEventId, selectedRange, openForm) {
  
  const { user } = useContext(AuthContext);
  
  const currentEvent = events.find((event) => event.id === selectEventId);

  let isAdmin = user?.permissao_usuario.find(permissaoUsuario => permissaoUsuario.nome.includes('ADMIN'));
  let isEditavel = isAdmin ?? (currentEvent ? (currentEvent.criado_por?.id == user.id) : true)

  const defaultValues = useMemo(
    () => ({
      id: '',
      editavel: true,
      title: '',
      tipo: '',
      allDay: true,
      start: selectedRange ? selectedRange.start : new Date().getTime(),
      end: selectedRange ? selectedRange.end : new Date().getTime(),
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
    let result = merge({}, defaultValues, currentEvent);
    result.editavel = !!isEditavel;
    return result;
  }

  return defaultValues;
}
