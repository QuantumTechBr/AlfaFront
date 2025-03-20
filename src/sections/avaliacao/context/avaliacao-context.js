import { createContext, useState } from 'react';
import avaliacaoMethods from '../avaliacao-repository';


export const AvaliacaoContext = createContext();

export const AvaliacaoProvider = ({ children }) => {
  const [avaliacaoFase, setAvaliacaoFase] = useState([]);
  const [avaliacaoFaseAlunoTurma, setAvaliacaoFaseAlunoTurma] = useState([]);
  const [avaliacaoDiagnosticoAlunoTurma, setAvaliacaoDiagnosticoAlunoTurma] = useState([]);

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

  const buscaAvaliacaoDiagnosticoByAlunoTurmaIdByPeriodo = async ({ alunoTurmaId, periodo, force = false } = {}) => {
    if (!force) {
      const valorCache = retornaValorCache([alunoTurmaId,periodo]);
      if (valorCache) return valorCache
    }

    const consulta = avaliacaoMethods.getAllAvaliacaoDiagnostico({
      alunoTurmaId: alunoTurmaId,
      periodo: periodo,
    }).then((response) => {
      if (response?.data == '' || response?.data === undefined) response.data = [];
      setAvaliacaoDiagnosticoAlunoTurma(response.data);
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
    
    const consulta = avaliacaoMethods.getAllRegistrosAprendizagemFase({
      turmaId: turmaId,
      bimestreId: bimestreId,
    }).then((response) => {
      if (response?.data == '' || response?.data === undefined) response.data = [];
      setAvaliacaoFase(response.data);
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

    const consulta = avaliacaoMethods.getAllRegistrosAprendizagemFase({
      alunoTurmaId: alunoTurmaId,
      bimestreId: bimestreId,
    }).then((response) => {
      if (response?.data == '' || response?.data === undefined) response.data = [];
      setAvaliacaoFaseAlunoTurma(response.data);
      return response.data;
    });

    mapsBusca.set([alunoTurmaId], consulta)
    return consulta;
  };

  const melhorResultadoAlunoTurma = async ({ alunoTurmaId, bimestreId }) => {
    const mapResultados = {
      'Não Avaliado' : 1,
      'Pré-Alfabética': 2,
      'Alfabética Parcial': 3,
      'Alfabética Completa': 4,
      'Alfabética Consolidada': 5,
    };
    const resultados = await buscaRegistroAprendizagemFaseByAlunoTurmaId({alunoTurmaId: alunoTurmaId, bimestreId: bimestreId});
    let melhor = 'Não Avaliado'
    for (let index = 0; index < resultados?.length; index++) {
      melhor = mapResultados[melhor] < mapResultados[resultados[index].resultado] ? resultados[index].resultado : melhor
    }
    return melhor;
  };



  const mapResultadosAlunoTurmaInicial = async ({ alunoTurmaId }) => {
    const resultados = await buscaAvaliacaoDiagnosticoByAlunoTurmaIdByPeriodo({alunoTurmaId: alunoTurmaId, periodo: 'Entrada'});
    const mR = [];
    if (resultados.length > 0) {
      for (let index = 0; index < resultados[0].habilidades_registro_aprendizagem.length; index++) {
        mR[resultados[0].habilidades_registro_aprendizagem[index].numero_resposta - 1] = resultados[0].habilidades_registro_aprendizagem[index].nota
      }
    }
    return mR;
  }

  return (
    <AvaliacaoContext.Provider value={{ 
      avaliacaoFase, 
      avaliacaoFaseAlunoTurma, 
      avaliacaoDiagnosticoAlunoTurma, 
      buscaRegistroAprendizagemFaseByTurmaIdBimestreId, 
      buscaRegistroAprendizagemFaseByAlunoTurmaId, 
      buscaAvaliacaoDiagnosticoByAlunoTurmaIdByPeriodo, 
      melhorResultadoAlunoTurma, 
      mapResultadosAlunoTurmaInicial,
      limparMapCache,
      }}>
      {children}
    </AvaliacaoContext.Provider>
  );
};
