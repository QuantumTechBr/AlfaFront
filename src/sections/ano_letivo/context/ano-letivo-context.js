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

  const buscaAnoLetivo = async (id) => {
    let returnData = anosLetivos.find((ano) => ano.id === id);
    if (!returnData) {
      returnData = await anoLetivoMethods.getAnoLetivoById(id).then((response) => {
        return response.data;
      });
    }

    return returnData;
  };

  return (
    <AnosLetivosContext.Provider value={{ anosLetivos, buscaAnosLetivos, buscaAnoLetivo }}>
      {children}
    </AnosLetivosContext.Provider>
  );
};
