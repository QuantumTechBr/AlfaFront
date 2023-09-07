import { createContext, useState } from 'react';
// import escolaMethods from '../escola-provider';
import { _escolas as _escolasMock } from 'src/_mock';

export const EscolasContext = createContext();

export const EscolasProvider = ({ children }) => {
  const [escolas, setEscolas] = useState([]);

  const buscaEscolas = ({ force = false } = {}) => {
    // TODO TROCAR PARA METHODS
    if(escolas.length == 0) setEscolas(_escolasMock);

    // if (force || escolas.length == 0) {
    //   escolaMethods.getAllEscolas().then((_escolas) => {
    //     if (_escolas.length == 0) _escolas = _escolasMock;
    //     setEscolas(_escolas);
    //   });
    // }
  };

  return (
    <EscolasContext.Provider value={{ escolas, buscaEscolas }}>{children}</EscolasContext.Provider>
  );
};
