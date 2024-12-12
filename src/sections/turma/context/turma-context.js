import { createContext, useState } from 'react';
import turmaMethods from '../turma-repository';

export const TurmasContext = createContext();

export const TurmasProvider = ({ children }) => {
  const [turmas, setTurmas] = useState([]);
  let _consultaAtual;

  let mapCachePromises = new Map();

  const buscaTurmasPaginado = async ({args={offset:0, limit:100, ano: '', ddzs:'', escolas:'', nome:'', status:null}, clear=false} = {}) => {

    if(clear) {
      mapCachePromises = new Map();
    }
    
    const key = JSON.stringify(args);

    if (mapCachePromises.has(key)) {
      return mapCachePromises.get(key);
    }

    const novaBusca = turmaMethods.getAllTurmasPaginado(args).then((response) => {
      if (response.data == '' || response.data === undefined) response.data = [];
      return response.data;
    }).catch((erro) => {
      throw erro;
    })

    mapCachePromises.set(key, novaBusca);
    return novaBusca;
  };

  const buscaTurmas = async ({anoLetivoId = '', force = false } = {}) => {
    let returnData = turmas;
    if(anoLetivoId) {
      returnData = turmas.filter(turma => turma.ano.id == anoLetivoId);
    }
    if (force || returnData.length == 0) {
      if (!_consultaAtual || force) {
        _consultaAtual = turmaMethods.getAllTurmas({anoLetivoId}).then((response) => {
          if (response.data == '' || response.data === undefined) response.data = [];
          setTurmas(response.data);
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

  const buscaTurmaPorId = async ({ id } = {}) => {
    return turmaMethods.getTurmaById(id).then((response) => {
      return response.data;
    });
  };

  return (
    <TurmasContext.Provider value={{ turmas, buscaTurmas, buscaTurmaPorId, buscaTurmasPaginado }}>
      {children}
    </TurmasContext.Provider>
  );
};
