import { createContext, useState } from 'react';
import anoLetivoMethods from '../ano-letivo-repository';

export const AnosLetivosContext = createContext();

export const AnosLetivosProvider = ({ children }) => {
  const [anosLetivos, setAnosLetivos] = useState([]);

  const buscaAnosLetivos = async  ({ force = false } = {}) => {
    if (force || anosLetivos.length == 0) {
      return anoLetivoMethods.getAllAnosLetivos().then((response) => {
        if (response.data == '' || response.data === undefined) response.data = [];
        const anosOrdenados = response.data.sort(function(a, b){return b.ano-a.ano});
        setAnosLetivos(anosOrdenados);
        return anosOrdenados;
      });
    } else {
      return anosLetivos;
    }
  };

  return (
    <AnosLetivosContext.Provider value={{ anosLetivos, buscaAnosLetivos }}>{children}</AnosLetivosContext.Provider>
  );
};
