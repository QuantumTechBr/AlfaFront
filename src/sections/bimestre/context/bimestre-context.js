import { createContext, useState } from 'react';
import bimestreMethods from '../bimestre-repository';

export const BimestresContext = createContext();

export const BimestresProvider = ({ children }) => {
  const [bimestres, setBimestres] = useState([]);

  const buscaBimestres = async ({ force = false } = {}) => {
    if (force || bimestres.length == 0) {
      return await bimestreMethods.getAllBimestres().then((response) => {
        if (response.data == '' || response.data === undefined) response.data = [];
        setBimestres(response.data);
        return response.data;
      });
    }
    return bimestres;
  };

  return (
    <BimestresContext.Provider value={{ bimestres, buscaBimestres }}>
      {children}
    </BimestresContext.Provider>
  );
};
