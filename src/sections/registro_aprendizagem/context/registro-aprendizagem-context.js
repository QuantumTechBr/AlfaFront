import { createContext, useState } from 'react';
import registroAprendizagemMethods from '../registro-aprendizagem-repository';


export const RegistroAprendizagemContext = createContext();

export const RegistroAprendizagemProvider = ({ children }) => {
  const [registroAprendizagemFase, setRegistroAprendizagemFase] = useState([]);
  let _consultaAtual;

  const buscaRegistroAprendizagemFaseByTurmaIdBimestreId = async ({ turmaId, bimestreId, force = false } = {}) => {
    let returnData = registroAprendizagemFase;

    if (force || registroAprendizagemFase?.length == 0 || registroAprendizagemFase[0]?.turma_id != turmaId || registroAprendizagemFase[0]?.bimestre.id != bimestreId){
      if (!_consultaAtual || force) {
        _consultaAtual = registroAprendizagemMethods.getAllRegistrosAprendizagemFase({
          turmaId: turmaId,
          bimestreId: bimestreId,
        }).then((response) => {
          if (response?.data == '' || response?.data === undefined) response.data = [];
            response.data[0].turma_id = turmaId;
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

  return (
    <RegistroAprendizagemContext.Provider value={{ registroAprendizagemFase, buscaRegistroAprendizagemFaseByTurmaIdBimestreId }}>
      {children}
    </RegistroAprendizagemContext.Provider>
  );
};