'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertRegistroAprendizagem = payload => axios.post(endpoints.registro_aprendizagem.post, payload);
export const getAllRegistrosAprendizagem = () => axios.get(endpoints.registro_aprendizagem.list);
export const updateRegistroAprendizagemById = (id, payload) => axios.patch(endpoints.registro_aprendizagem.update.concat(id), payload);
export const deleteRegistroAprendizagemById = id => axios.delete(endpoints.registro_aprendizagem.delete.concat(id));
export const getRegistroAprendizagemById = id => axios.get(endpoints.registro_aprendizagem.get_by_id.concat(id));
export const deleteRegistroAprendizagemByFilter = ({tipo='', bimestreId='', turmaId='', nome='', periodo='', promoAnoAnterior='', alunoTurmaId=''}) => axios.delete(endpoints.registro_aprendizagem.delete_by_filter.concat(`?tipo=${tipo}&bimestre=${bimestreId}&turma=${turmaId}&nome=${nome}&periodo=${periodo}&promo_ano_anterior=${promoAnoAnterior}&aluno_turma=${alunoTurmaId}`));

export const insertRegistroAprendizagemDiagnostico = payload => axios.post(endpoints.registro_aprendizagem.diagnostico.post, payload);
export const getAllRegistrosAprendizagemDiagnostico = ({turmaId='', nome='', periodo='', promoAnoAnterior='', alunoTurmaId=''}) => axios.get(endpoints.registro_aprendizagem.diagnostico.list.concat(`/?turma=${turmaId}&nome=${nome}&periodo=${periodo}&promo_ano_anterior=${promoAnoAnterior}&aluno_turma=${alunoTurmaId}`));
export const updateRegistroAprendizagemDiagnosticoById = (id, payload) => axios.patch(endpoints.registro_aprendizagem.diagnostico.update.concat(id), payload);
export const getListIdTurmaRegistroAprendizagemDiagnostico = (payload) => axios.post(endpoints.registro_aprendizagem.diagnostico.idsTurmaList.concat(`/?limit=${payload.limit}&offset=${payload.offset}`), payload);
export const exportFileDiagnosticoList = (query) => axios.get(endpoints.registro_aprendizagem.diagnostico.list.concat(`/?`).concat(query));
export const importFileDiagnostico = (payload) => axios.post(endpoints.registro_aprendizagem.diagnostico.import, payload, { headers: { 'Content-Type': 'multipart/form-data' } });

export const insertRegistroAprendizagemFase = payload => axios.post(endpoints.registro_aprendizagem.fase.post, payload);
export const getAllRegistrosAprendizagemFase = ({turmaId='', bimestreId='', alunoTurmaId=''}) => axios.get(endpoints.registro_aprendizagem.fase.list.concat(`/?turma=${turmaId}&bimestre=${bimestreId}&aluno_turma=${alunoTurmaId}`));
export const updateRegistroAprendizagemFaseById = (id, payload) => axios.patch(endpoints.registro_aprendizagem.fase.update.concat(id), payload);
export const getRegistroAprendizagemFaseById = id => axios.get(endpoints.registro_aprendizagem.fase.get_by_id.concat(id));
export const getListIdTurmaRegistroAprendizagemFase = (payload) => axios.post(endpoints.registro_aprendizagem.fase.idsTurmaList.concat(`/?limit=${payload.limit}&offset=${payload.offset}`), payload);
export const exportFileFaseList = (query) => axios.get(endpoints.registro_aprendizagem.fase.list.concat(`/?`).concat(query));
export const importFileFase = (payload) => axios.post(endpoints.registro_aprendizagem.fase.import, payload, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getRelatorioAvaliacaoPorTurma = (payload) => axios.post(endpoints.registro_aprendizagem.relatorioAvaliacaoFasePorTurma, payload);
export const getRelatorioAvaliacaoPorEscola = (payload) => axios.post(endpoints.registro_aprendizagem.relatorioAvaliacaoFasePorEscola, payload);

const registroAprendizagemMethods = {
    insertRegistroAprendizagem,
    getAllRegistrosAprendizagem,
    updateRegistroAprendizagemById,
    deleteRegistroAprendizagemById,
    getRegistroAprendizagemById,
    deleteRegistroAprendizagemByFilter,
    insertRegistroAprendizagemDiagnostico,
    getAllRegistrosAprendizagemDiagnostico,
    updateRegistroAprendizagemDiagnosticoById,
    getListIdTurmaRegistroAprendizagemDiagnostico,
    exportFileDiagnosticoList,
    insertRegistroAprendizagemFase,
    getAllRegistrosAprendizagemFase,
    updateRegistroAprendizagemFaseById,
    getRegistroAprendizagemFaseById,
    getListIdTurmaRegistroAprendizagemFase,
    exportFileFaseList,
    importFileDiagnostico,
    importFileFase,
    getRelatorioAvaliacaoPorTurma,
    getRelatorioAvaliacaoPorEscola
};

export default registroAprendizagemMethods;




