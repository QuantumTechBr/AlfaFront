import { createContext, useState, useCallback } from 'react';
import anoLetivoMethods from '../ano-letivo-repository';
import { useLocalStorage } from 'src/hooks/use-local-storage';

export const AnosLetivosContext = createContext();

export const AnosLetivosProvider = ({ children }) => {
  const [anosLetivos, setAnosLetivos] = useState([]);
  let _consultaAtual;

  const buscaAnosLetivos = async ({ force = false } = {}) => {
    let returnData = anosLetivos;
    if (force || anosLetivos.length == 0) {
      if (!_consultaAtual || force) {
        _consultaAtual = anoLetivoMethods.getAllAnosLetivos().then((response) => {
          if (response.data == '' || response.data === undefined) response.data = [];
          returnData = response.data.sort((a, b) => b.ano - a.ano);
          setAnosLetivos(returnData);
          return returnData;
        });
      }

      await _consultaAtual.then((value) => {
        returnData = value;
      });
    }

    return returnData;
  };

  //
  const STORAGE_KEY = 'anoLetivo';
  const [localStorageAnoLetivo, _setLocalStorateAnoLetivo] = useLocalStorage(STORAGE_KEY, '');

  const systemAnoLetivo = anosLetivos.find((item) => item.ano == localStorageAnoLetivo);

  const changeAnoLetivo = useCallback(
    (newValue) => {
      _setLocalStorateAnoLetivo(newValue);
    },
    [anosLetivos]
  );

  return (
    <AnosLetivosContext.Provider
      value={{
        anosLetivos,
        buscaAnosLetivos,
        localStorageAnoLetivo,
        systemAnoLetivo,
        changeAnoLetivo,
      }}
    >
      {children}
    </AnosLetivosContext.Provider>
  );
};
