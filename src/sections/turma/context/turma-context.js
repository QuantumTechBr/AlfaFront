import { createContext, useState } from 'react';
import turmaMethods from '../turma-repository';

export const TurmasContext = createContext();

export const TurmasProvider = ({ children }) => {
  const [turmas, setTurmas] = useState([]);

  const buscaTurmas = async  ({ force = false } = {}) => {
    if (force || turmas.length == 0) {
      await turmaMethods.getAllTurmas().then((response) => {
        if (response.data == '' || response.data === undefined) response.data = [];
        setTurmas(response.data);
      });
    }
  };

  const buscaTurmaPorId = async ({ id, force = false } = {}) => {
    if (!force && turmas.length > 0) {
      const turmaBuscada = turmas.find((turma) => turma.id == id);
      if(turmaBuscada) {
        return turmaBuscada;
      }
    }
    return turmaMethods.getTurmaById(id).then((response) => {
      return response.data;
    });
  }


  return (
    <TurmasContext.Provider value={{ turmas, buscaTurmas, buscaTurmaPorId }}>{children}</TurmasContext.Provider>
  );
};