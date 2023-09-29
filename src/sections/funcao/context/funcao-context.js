import { createContext, useState } from 'react';
import funcaoMethods from '../funcao-repository';

export const FuncoesContext = createContext();

export const FuncoesProvider = ({ children }) => {
  const [funcoes, setFuncoes] = useState([]);

  const buscaFuncoes = async ({ force = false } = {}) => {
    if (force || funcoes.length == 0) {
      await funcaoMethods.getAllFuncoes().then((response) => {
        if (response.data == '' || response.data === undefined) response.data = [];
        setFuncoes(response.data);
      });
    }
  };

  return (
    <FuncoesContext.Provider value={{ funcoes, buscaFuncoes }}>{children}</FuncoesContext.Provider>
  );
};
