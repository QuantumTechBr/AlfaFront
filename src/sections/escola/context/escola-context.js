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
          if (response.data == '' || response.data === undefined) response.data = [];
          let escFiltered = [];
          escFiltered = response.data;
          setEscolas(escFiltered);
          returnData = escFiltered;
          return returnData;
        });
      }

      await _consultaAtual.then((value) => {
        returnData = value;
      });
    }

    return returnData;
  };

  const buscaEscola = async (id) => {
    let returnData = escolas.find((escola) => escola.id === id);
    if (!returnData) {
      returnData = await escolaMethods.getEscolaById(id).then((response) => {
        return response.data;
      });
    }

    return returnData;
  };

  return (
    <EscolasContext.Provider value={{ escolas, buscaEscolas, buscaEscola }}>{children}</EscolasContext.Provider>
  );
};
