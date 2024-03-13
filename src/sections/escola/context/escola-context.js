import { createContext, useState } from 'react';
import escolaMethods from '../escola-repository';

export const EscolasContext = createContext();

export const EscolasProvider = ({ children }) => {
  const [escolas, setEscolas] = useState([]);
  let _consultaAtual;

  const buscaEscolas = async ({ force = false } = {}) => {
    let returnData = escolas;
    if (force || escolas.length == 0) {
      if (!_consultaAtual || force) {
        _consultaAtual = escolaMethods.getAllEscolas().then((response) => {
          let responseData = response.data;
          if (responseData == '' || responseData === undefined) responseData = [];
          let toReturn = responseData;
          if (responseData.length > 0) {
            const sortedData = _.orderBy(toReturn, ['nome'], ['asc']);
            toReturn = sortedData;
          }
          setEscolas(toReturn);
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
    <EscolasContext.Provider value={{ escolas, buscaEscolas }}>{children}</EscolasContext.Provider>
  );
};
