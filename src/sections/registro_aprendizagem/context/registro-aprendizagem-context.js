import { createContext, useState } from 'react';
import registroAprendizagemMethods from '../registro-aprendizagem-repository';


export const RegistroAprendizagemContext = createContext();

export const RegistroAprendizagemProvider = ({ children }) => {
  const [registroAprendizagemFase, setRegistroAprendizagemFase] = useState([]);
  const [registroAprendizagemFaseAlunoTurma, setRegistroAprendizagemFaseAlunoTurma] = useState([]);

  const buscaRegistroAprendizagemFaseByTurmaIdBimestreId = async ({ turmaId, bimestreId, force = false } = {}) => {
    let _consultaAtual;
    let returnData = registroAprendizagemFase;

    if (force || registroAprendizagemFase?.length < 1 || registroAprendizagemFase[0]?.turma_id != turmaId || registroAprendizagemFase[0]?.bimestre.id != bimestreId){
      if (!_consultaAtual || force) {
        _consultaAtual = registroAprendizagemMethods.getAllRegistrosAprendizagemFase({
          turmaId: turmaId,
          bimestreId: bimestreId,
        }).then((response) => {
          if (response?.data == '' || response?.data === undefined) response.data = [];
          setRegistroAprendizagemFase(response.data);
          returnData = response.data;
          return returnData;
          });
        }
        await _consultaAtual.then((value) => {
          returnData = value;
        });

    } else {
      const turmaEncontrada = registroAprendizagemFase.filter((registro) => registro?.aluno_turma?.aluno?.alunos_turmas?.find((turma) => turma.turma == turmaId));
      const registroBuscado = turmaEncontrada.filter((registro) => registro?.bimestre.id == bimestreId)
      if (registroBuscado) {
        return registroBuscado;
      }
      return null;
    }

    return returnData;
  };

  const buscaRegistroAprendizagemFaseByAlunoTurmaId = async ({ alunoTurmaId } = {}) => {
    let returnData = registroAprendizagemFaseAlunoTurma;
    let consulta;

    if (registroAprendizagemFaseAlunoTurma?.length < 1 || registroAprendizagemFaseAlunoTurma[0].aluno_turma.id != alunoTurmaId){
      if (!consulta) {
        consulta = registroAprendizagemMethods.getAllRegistrosAprendizagemFase({
          alunoTurmaId: alunoTurmaId,
        }).then((response) => {
          if (response?.data == '' || response?.data === undefined) response.data = [];
          setRegistroAprendizagemFaseAlunoTurma(response.data);
          returnData = response.data;
          return returnData;
          });
        }
        await consulta.then((value) => {
          returnData = value;
        });

    }
    return returnData;
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
    for (let index = 0; index < resultados.length; index++) {
      melhor = mapResultados[melhor] < mapResultados[resultados[index].resultado] ? resultados[index].resultado : melhor
    }
    return melhor;
  }

  return (
    <RegistroAprendizagemContext.Provider value={{ registroAprendizagemFase, registroAprendizagemFaseAlunoTurma, buscaRegistroAprendizagemFaseByTurmaIdBimestreId, buscaRegistroAprendizagemFaseByAlunoTurmaId, melhorResultadoAlunoTurma }}>
      {children}
    </RegistroAprendizagemContext.Provider>
  );
};
