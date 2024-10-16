import { createContext, useState } from 'react';
import bimestreMethods from '../bimestre-repository';

export const BimestresContext = createContext();

export const BimestresProvider = ({ children }) => {
  const [bimestres, setBimestres] = useState([]);
  let _consultaAtual;

  const filtrarBimestres = (todosBimestres) => {
    const hoje = new Date();
    const dataAtual = hoje.toISOString().slice(0, 10); // Formata a data atual para 'YYYY-MM-DD'
  
    return todosBimestres.filter(bim => {
      const dataInicio = new Date(bim.data_inicio).toISOString().slice(0, 10);
      return dataInicio < dataAtual;
    });
  }

  const buscaBimestres = async ({ force = false } = {}) => {
    let returnData = bimestres;
    if (force || bimestres.length == 0) {
      if (!_consultaAtual || force) {
        _consultaAtual = bimestreMethods.getAllBimestres().then((response) => {
          if (response.data == '' || response.data === undefined) response.data = [];
          let bimestresFiltrados = filtrarBimestres(response.data);
          setBimestres(bimestresFiltrados);
          returnData = bimestresFiltrados;
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
    <BimestresContext.Provider value={{ bimestres, buscaBimestres }}>
      {children}
    </BimestresContext.Provider>
  );
};
