import { createContext, useState } from 'react';
import bimestreMethods from '../bimestre-repository';

export const BimestresContext = createContext();

export const BimestresProvider = ({ children }) => {
  const [bimestres, setBimestres] = useState([]);
  let _consultaAtual;

  const buscaBimestres = async ({ force = false } = {}) => {
    let returnData = bimestres;
    if (force || bimestres.length == 0) {
      if (!_consultaAtual || force) {
        _consultaAtual = bimestreMethods.getAllBimestres().then((response) => {
          let responseData = response.data;
          if (responseData == '' || responseData === undefined) responseData = [];
          let toReturn = responseData;
          if (responseData.length > 0) {
            const sortedData = _.orderBy(toReturn, ['ordinal'], ['asc']);
            toReturn = sortedData;
          }
          setBimestres(toReturn);
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
    <BimestresContext.Provider value={{ bimestres, buscaBimestres }}>
      {children}
    </BimestresContext.Provider>
  );
};
