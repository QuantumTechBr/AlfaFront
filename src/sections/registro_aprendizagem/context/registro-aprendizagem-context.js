import { createContext, useState } from 'react';
import registroAprendizagemMethods from '../registro-aprendizagem-repository';


export const RegistroAprendizagemContext = createContext();

export const RegistroAprendizagemProvider = ({ children }) => {
  const [registroAprendizagemFase, setRegistroAprendizagemFase] = useState([]);
  const [registroAprendizagemFaseAlunoTurma, setRegistroAprendizagemFaseAlunoTurma] = useState([]);
  const [registroAprendizagemDiagnosticoAlunoTurma, setRegistroAprendizagemDiagnosticoAlunoTurma] = useState([]);

  let mapsBusca = new Map();

  const retornaValorCache = (ids = []) => {
    if (!ids) return null;

    let retorno = null;
    let keysArrays = [...mapsBusca.keys()]
    keysArrays.forEach(keyArray => {
      if(keyArray.sort().join(',') === ids.sort().join(',')) { // testa se os dois arrays sao equivalentes
        retorno = mapsBusca.get(keyArray);
        return;
      }
    });

    return retorno;
  };

  const limparMapCache = () => {
    mapsBusca = new Map()
  };

  const buscaRegistroAprendizagemDiagnosticoByAlunoTurmaIdByPeriodo = async ({ alunoTurmaId, periodo, force = false } = {}) => {
    if (!force) {
      let valorCache = retornaValorCache([alunoTurmaId,periodo]);
      if (valorCache) return valorCache
    }

    let consulta = registroAprendizagemMethods.getAllRegistrosAprendizagemDiagnostico({
      alunoTurmaId: alunoTurmaId,
      periodo: periodo,
    }).then((response) => {
      if (response?.data == '' || response?.data === undefined) response.data = [];
      setRegistroAprendizagemDiagnosticoAlunoTurma(response.data);
      return response.data;
    });
    mapsBusca.set([alunoTurmaId,periodo], consulta)
    return consulta

  }

  const buscaRegistroAprendizagemFaseByTurmaIdBimestreId = async ({ turmaId, bimestreId, force = false } = {}) => {
    if (!force) {
      let valorCache = retornaValorCache([turmaId,bimestreId]);
      if (valorCache) return valorCache
    }
    
    let consulta = registroAprendizagemMethods.getAllRegistrosAprendizagemFase({
      turmaId: turmaId,
      bimestreId: bimestreId,
    }).then((response) => {
      if (response?.data == '' || response?.data === undefined) response.data = [];
      setRegistroAprendizagemFase(response.data);
      return response.data;
    });
    mapsBusca.set([turmaId,bimestreId], consulta)
    return consulta;
  };

  const buscaRegistroAprendizagemFaseByAlunoTurmaId = async ({ alunoTurmaId, force = false } = {}) => {
    if (!force) {
      let valorCache = retornaValorCache([alunoTurmaId]);
      if (valorCache) return valorCache
    }

    let consulta = registroAprendizagemMethods.getAllRegistrosAprendizagemFase({
      alunoTurmaId: alunoTurmaId,
    }).then((response) => {
      if (response?.data == '' || response?.data === undefined) response.data = [];
      setRegistroAprendizagemFaseAlunoTurma(response.data);
      return response.data;
    });

    mapsBusca.set([alunoTurmaId], consulta)
    return consulta;
  };

  const melhorResultadoAlunoTurma = async ({ alunoTurmaId }) => {
    const mapResultados = {
      'Não Avaliado' : 1,
      'Pré Alfabética': 2,
      'Alfabética Parcial': 3,
      'Alfabética Completa': 4,
      'Alfabética Consolidada': 5,
    };
    let resultados = await buscaRegistroAprendizagemFaseByAlunoTurmaId({alunoTurmaId: alunoTurmaId})
    let melhor = 'Não Avaliado'
    for (let index = 0; index < resultados?.length; index++) {
      melhor = mapResultados[melhor] < mapResultados[resultados[index].resultado] ? resultados[index].resultado : melhor
    }
    return melhor;
  };



  const mapResultadosAlunoTurmaInicial = async ({ alunoTurmaId }) => {
    let resultados = await buscaRegistroAprendizagemDiagnosticoByAlunoTurmaIdByPeriodo({alunoTurmaId: alunoTurmaId, periodo: 'Inicial'});
    let mR = [];
    if (resultados.length > 0) {
      for (let index = 0; index < resultados[0].habilidades_registro_aprendizagem.length; index++) {
        mR[resultados[0].habilidades_registro_aprendizagem[index].habilidade.id] = resultados[0].habilidades_registro_aprendizagem[index].nota
      }
    }
    return mR;
  }

  return (
    <RegistroAprendizagemContext.Provider value={{ 
      registroAprendizagemFase, 
      registroAprendizagemFaseAlunoTurma, 
      registroAprendizagemDiagnosticoAlunoTurma, 
      buscaRegistroAprendizagemFaseByTurmaIdBimestreId, 
      buscaRegistroAprendizagemFaseByAlunoTurmaId, 
      buscaRegistroAprendizagemDiagnosticoByAlunoTurmaIdByPeriodo, 
      melhorResultadoAlunoTurma, 
      mapResultadosAlunoTurmaInicial,
      limparMapCache,
      }}>
      {children}
    </RegistroAprendizagemContext.Provider>
  );
};
