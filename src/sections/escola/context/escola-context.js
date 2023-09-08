import { createContext, useState } from 'react';
import escolaMethods from '../escola-repository';

export const EscolasContext = createContext();

export const EscolasProvider = ({ children }) => {
  const [escolas, setEscolas] = useState([]);

  const buscaEscolas = async ({ force = false } = {}) => {
    if (force || escolas.length == 0) {
      await escolaMethods.getAllEscolas().then((response) => {
        if (response.data == '' || response.data === undefined) response.data = [];
        setEscolas(response.data);
      });
    }
  };

  return (
    <EscolasContext.Provider value={{ escolas, buscaEscolas }}>{children}</EscolasContext.Provider>
  );
};
