import { createContext, useState } from 'react';
import funcaoMethods from '../funcao-repository';

export const FuncoesContext = createContext();

export const FuncoesProvider = ({ children }) => {
  const [funcoes, setFuncoes] = useState([]);
  let _consultaAtual;

  const buscaFuncoes = async ({ force = false } = {}) => {
    let returnData = funcoes;
    if (force || funcoes.length == 0) {
      if (!_consultaAtual || force) {
        _consultaAtual = funcaoMethods.getAllFuncoes().then((response) => {
          if (response.data == '' || response.data === undefined) response.data = [];
          setFuncoes(response.data);
          returnData = response.data;
          return returnData;
        });
      }

      await _consultaAtual.then((value) => {
        returnData = value;
      });
    }

    return returnData;
  };

  return (
    <FuncoesContext.Provider value={{ funcoes, buscaFuncoes }}>{children}</FuncoesContext.Provider>
  );
};
