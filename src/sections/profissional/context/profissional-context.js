import { createContext, useState } from 'react';
import profissionalMethods from '../profissional-repository';

export const ProfissionalContext = createContext();

export const ProfissionaisProvider = ({ children }) => {
  const [profissionais, setProfissionais] = useState([]);
  let _consultaAtual;

  const buscaProfissionais = async ({ force = false } = {}) => {
    let returnData = profissionais;
    if (force || profissionais.length == 0) {
      if (!_consultaAtual || force) {
        _consultaAtual = profissionalMethods.getAllProfissionais().then((response) => {
          if (response.data == '' || response.data === undefined) response.data = [];
          setProfissionais(response.data);
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

  const buscaProfissionalPorId = async ({ id, force = false } = {}) => {
    if (!force && profissionais.length > 0) {
      const profissionalBuscada = profissionais.find((profissional) => profissional.id == id);
      if (profissionalBuscada) {
        return profissionalBuscada;
      }
    }
    return profissionalMethods.getProfissionalById(id).then((response) => {
      return response.data;
    });
  };

  return (
    <ProfissionalContext.Provider value={{ profissionais, buscaProfissionais, buscaProfissionalPorId }}>
      {children}
    </ProfissionalContext.Provider>
  );
};
