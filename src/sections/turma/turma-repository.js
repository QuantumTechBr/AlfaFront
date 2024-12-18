'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertTurma = payload => axios.post(endpoints.turma.post, payload);
export const getAllTurmas = (payload = {}) => axios.get(endpoints.turma.list+'?anoLetivo='+payload['anoLetivoId']);
export const getAllTurmasPaginado = ({offset=0, limit=100, ano='', nome='', ddzs='', escolas='', status=''}) => axios.get(endpoints.turma.list.concat(`?limit=${limit}&offset=${offset}&ano=${ano}&ddzs=${ddzs}&escolas=${escolas}&nome=${nome}&status=${status}`));
export const updateTurmaById = (id, payload) => axios.patch(endpoints.turma.update.concat(id), payload);
export const deleteTurmaById = id => axios.delete(endpoints.turma.delete.concat(id));
export const getTurmaById = id => axios.get(endpoints.turma.get_by_id.concat(id));
export const exportFile = query => axios.get(endpoints.turma.list.concat(`?`).concat(query));
export const importFileTurmas = payload => axios.post(endpoints.turma.import, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateAlunoTurmaById = (alunoTurmaId, payload) => axios.patch(endpoints.turma.aluno_turma.concat(alunoTurmaId), payload);
export const deleteAlunoTurmaById = alunoTurmaId => axios.delete(endpoints.turma.aluno_turma.concat(alunoTurmaId));
export const insertAlunoTurma = payload => axios.post(endpoints.turma.aluno_turma, payload);

const turmaMethods = {
    insertTurma,
    getAllTurmas,
    getAllTurmasPaginado,
    updateTurmaById,
    deleteTurmaById,
    getTurmaById,
    exportFile,
    importFileTurmas,
    updateAlunoTurmaById,
    deleteAlunoTurmaById,
    insertAlunoTurma,
};

export default turmaMethods;