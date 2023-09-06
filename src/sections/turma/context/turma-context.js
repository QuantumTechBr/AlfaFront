import { createContext, useState } from 'react';
import turmaMethods from '../turma-provider';
import { _turmas as _turmasMock } from 'src/_mock';

export const TurmasContext = createContext();

export const TurmasProvider = ({ children }) => {
  const [turmas, setTurmas] = useState([]);

  const buscaTurmas = ({ force = false } = {}) => {
    // TODO TROCAR PARA METHODS
    if (turmas.length == 0) setTurmas(_turmasMock);

    // if (force || turmas.length == 0) {
    //   turmaMethods.getAllTurmas().then((_turmas) => {
    //     if (_turmas == '' || _turmas.length == 0) _turmas = _turmasMock;
    //     setTurmas(_turmas);
    //   });
    // }
  };

  return (
    <TurmasContext.Provider value={{ turmas, buscaTurmas }}>{children}</TurmasContext.Provider>
  );
};
