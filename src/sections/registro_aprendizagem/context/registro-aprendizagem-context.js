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
    const keysArrays = [...mapsBusca.keys()]
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
      const valorCache = retornaValorCache([alunoTurmaId,periodo]);
      if (valorCache) return valorCache
    }

    const consulta = registroAprendizagemMethods.getAllRegistrosAprendizagemDiagnostico({
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
      const valorCache = retornaValorCache([turmaId,bimestreId]);
      if (valorCache) return valorCache
    }
    
    const consulta = registroAprendizagemMethods.getAllRegistrosAprendizagemFase({
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

  const buscaRegistroAprendizagemFaseByAlunoTurmaId = async ({ alunoTurmaId, bimestreId, force = false } = {}) => {
    if (!force) {
      const valorCache = retornaValorCache([alunoTurmaId]);
      if (valorCache) return valorCache
    }

    const consulta = registroAprendizagemMethods.getAllRegistrosAprendizagemFase({
      alunoTurmaId: alunoTurmaId,
      bimestreId: bimestreId,
    }).then((response) => {
      if (response?.data == '' || response?.data === undefined) response.data = [];
      setRegistroAprendizagemFaseAlunoTurma(response.data);
      return response.data;
    });

    mapsBusca.set([alunoTurmaId], consulta)
    return consulta;
  };

  const melhorResultadoAlunoTurma = async ({ alunoTurmaId, bimestreId }) => {
    const mapResultados = {
      'NAO AVALIADO ' : 1,
      'PRE ALFABETICA': 2,
      'ALFABETICA PARCIAL': 3,
      'ALFABETICA COMPLETA': 4,
      'ALFABETICA CONSOLIDADA': 5,
    };
    const resultados = await buscaRegistroAprendizagemFaseByAlunoTurmaId({alunoTurmaId: alunoTurmaId, bimestreId: bimestreId});
    let melhor = 'Não Avaliado'
    for (let index = 0; index < resultados?.length; index++) {
      melhor = mapResultados[melhor] < mapResultados[resultados[index].resultado] ? resultados[index].resultado : melhor
    }
    return melhor;
  };



  const mapResultadosAlunoTurmaInicial = async ({ alunoTurmaId }) => {
    const resultados = await buscaRegistroAprendizagemDiagnosticoByAlunoTurmaIdByPeriodo({alunoTurmaId: alunoTurmaId, periodo: 'Entrada'});
    const mR = [];
    if (resultados.length > 0) {
      for (let index = 0; index < resultados[0].habilidades_registro_aprendizagem.length; index++) {
        mR[resultados[0].habilidades_registro_aprendizagem[index].numero_resposta - 1] = resultados[0].habilidades_registro_aprendizagem[index].nota
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
