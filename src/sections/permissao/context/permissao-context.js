import { createContext, useState } from 'react';
import permissaoMethods from '../permissao-repository';

export const PermissoesContext = createContext();

export const PermissoesProvider = ({ children }) => {
  const [permissoes, setPermissoes] = useState([]);
  let _consultaAtual;

  const buscaPermissoes = async ({ force = false } = {}) => {
    let returnData = permissoes;
    if (force || permissoes.length == 0) {
      if (!_consultaAtual || force) {
        _consultaAtual = permissaoMethods.getAllPermissoes().then((response) => {
          if (response.data == '' || response.data === undefined) response.data = [];
          setPermissoes(response.data);
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

  return <PermissoesContext.Provider value={{ permissoes, buscaPermissoes }}>{children}</PermissoesContext.Provider>;
};
