import { createContext, useState } from 'react';
import escolaMethods from '../escola-repository';
import { escolas_piloto } from 'src/_mock';

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
          if (sessionStorage.getItem('escolasPiloto') == 'true') {
            escFiltered = response.data.map((escola) => {
              if (escolas_piloto.includes(escola.nome)) {
                escFiltered.push(escola);
                setEscolas(escFiltered);
                returnData = escFiltered;
                return returnData;
              }
            })
          }
          else {
            escFiltered = response.data;
            setEscolas(escFiltered);
            returnData = escFiltered;
            return returnData;
          }
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
