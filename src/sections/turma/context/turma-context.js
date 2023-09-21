import { createContext, useState } from 'react';
import turmaMethods from '../turma-repository';

export const TurmasContext = createContext();

export const TurmasProvider = ({ children }) => {
  const [turmas, setTurmas] = useState([]);
  let _consultaAtual;

  const buscaTurmas = async ({ force = false } = {}) => {
    let returnData = turmas;
    if (force || turmas.length == 0) {
      // console.log('_consultaAtual');
      // console.log(_consultaAtual);

      if (!_consultaAtual) {
        _consultaAtual = turmaMethods.getAllTurmas().then((response) => {
          if (response.data == '' || response.data === undefined) response.data = [];
          // console.log('- THEN getAllTurmas');

          setTurmas(response.data);
          returnData = response.data;
          return returnData;
        });
      }

      await _consultaAtual.then((value) => {
        returnData = value;
      });
    }

    // console.log('returnData');
    // console.table(returnData);
    return returnData;
  };

  const buscaTurmaPorId = async ({ id, force = false } = {}) => {
    if (!force && turmas.length > 0) {
      const turmaBuscada = turmas.find((turma) => turma.id == id);
      if (turmaBuscada) {
        return turmaBuscada;
      }
    }
    return turmaMethods.getTurmaById(id).then((response) => {
      return response.data;
    });
    return null;
  };

  return (
    <TurmasContext.Provider value={{ turmas, buscaTurmas, buscaTurmaPorId }}>
      {children}
    </TurmasContext.Provider>
  );
};
