'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertRegistroAprendizagem = payload => axios.post(endpoints.registro_aprendizagem.post, payload);
export const getAllRegistrosAprendizagem = () => axios.get(endpoints.registro_aprendizagem.list);
export const updateRegistroAprendizagemById = (id, payload) => axios.patch(endpoints.registro_aprendizagem.update.concat(id), payload);
export const deleteRegistroAprendizagemById = id => axios.delete(endpoints.registro_aprendizagem.delete.concat(id));
export const getRegistroAprendizagemById = id => axios.get(endpoints.registro_aprendizagem.get_by_id.concat(id));

export const insertRegistroAprendizagemDiagnostico = payload => axios.post(endpoints.registro_aprendizagem.diagnostico.post, payload);
export const getAllRegistrosAprendizagemDiagnostico = ({turmaId='', nome='', periodo='', promoAnoAnterior='', alunoTurmaId=''}) => axios.get(endpoints.registro_aprendizagem.diagnostico.list.concat(`/?turma=${turmaId}&nome=${nome}&periodo=${periodo}&promo_ano_anterior=${promoAnoAnterior}&aluno_turma=${alunoTurmaId}`));
export const updateRegistroAprendizagemDiagnosticoById = (id, payload) => axios.patch(endpoints.registro_aprendizagem.diagnostico.update.concat(id), payload);
export const deleteRegistroAprendizagemDiagnosticoById = id => axios.delete(endpoints.registro_aprendizagem.diagnostico.delete.concat(id));
export const getListIdTurmaRegistroAprendizagemDiagnostico = ({turmaId='', periodo=''}) => axios.get(endpoints.registro_aprendizagem.diagnostico.idsTurmaList.concat(`/?turma=${turmaId}&periodo=${periodo}`))

export const insertRegistroAprendizagemFase = payload => axios.post(endpoints.registro_aprendizagem.fase.post, payload);
export const getAllRegistrosAprendizagemFase = () => axios.get(endpoints.registro_aprendizagem.fase.list);
export const updateRegistroAprendizagemFaseById = (id, payload) => axios.patch(endpoints.registro_aprendizagem.fase.update.concat(id), payload);
export const deleteRegistroAprendizagemFaseById = id => axios.delete(endpoints.registro_aprendizagem.fase.delete.concat(id));
export const getRegistroAprendizagemFaseById = id => axios.get(endpoints.registro_aprendizagem.fase.get_by_id.concat(id));

const registroAprendizagemMethods = {
    insertRegistroAprendizagem,
    getAllRegistrosAprendizagem,
    updateRegistroAprendizagemById,
    deleteRegistroAprendizagemById,
    getRegistroAprendizagemById,
    insertRegistroAprendizagemDiagnostico,
    getAllRegistrosAprendizagemDiagnostico,
    updateRegistroAprendizagemDiagnosticoById,
    deleteRegistroAprendizagemDiagnosticoById,
    getListIdTurmaRegistroAprendizagemDiagnostico,
    insertRegistroAprendizagemFase,
    getAllRegistrosAprendizagemFase,
    updateRegistroAprendizagemFaseById,
    deleteRegistroAprendizagemFaseById,
    getRegistroAprendizagemFaseById,
};

export default registroAprendizagemMethods;




