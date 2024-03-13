import { createContext, useState } from 'react';
import anoLetivoMethods from '../ano-letivo-repository';

export const AnosLetivosContext = createContext();

export const AnosLetivosProvider = ({ children }) => {
  const [anosLetivos, setAnosLetivos] = useState([]);
  let _consultaAtual;

  const buscaAnosLetivos = async ({ force = false } = {}) => {
    let returnData = anosLetivos;
    if (force || anosLetivos.length == 0) {
      if (!_consultaAtual || force) {
        _consultaAtual = anoLetivoMethods.getAllAnosLetivos().then((response) => {
          let responseData = response.data;
          if (responseData == '' || responseData === undefined) responseData = [];
          let toReturn = responseData;
          if (responseData.length > 0) {
            const sortedData = _.orderBy(toReturn, ['ano'], ['desc']);
            toReturn = sortedData;
          }
          setAnosLetivos(toReturn);
          return toReturn;
        });
      }

      await _consultaAtual.then((value) => {
        returnData = value;
      });
    }

    return returnData;
  };

  return (
    <AnosLetivosContext.Provider value={{ anosLetivos, buscaAnosLetivos }}>
      {children}
    </AnosLetivosContext.Provider>
  );
};
