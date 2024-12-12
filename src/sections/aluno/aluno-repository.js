'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertAluno = payload => axios.post(endpoints.aluno.post, payload);
export const getAllAlunos = ({offset=0, limit=100, nome='', turmas='', escolas='', matricula='', fase='', pesquisa='', sem_escola='', ano_letivo='', zonas=''}) => axios.get(endpoints.aluno.list.concat(`?limit=${limit}&offset=${offset}&turmas=${turmas}&escolas=${escolas}&matricula=${matricula}&nome=${nome}&fase=${fase}&pesquisa=${pesquisa}&ano_letivo=${ano_letivo}&zonas=${zonas}&sem_escola=${sem_escola}`));
export const updateAlunoById = (id, payload) => axios.patch(endpoints.aluno.update.concat(id), payload);
export const deleteAlunoById = id => axios.delete(endpoints.aluno.delete.concat(id));
export const getAlunoById = id => axios.get(endpoints.aluno.get_by_id.concat(id));
export const exportFile = query => axios.get(endpoints.aluno.list.concat(`?`).concat(query));
export const getAlunoDiretor = ({offset=0, limit=100, pesquisa=''}) => axios.get(endpoints.aluno.list.concat(`aluno-diretor/?limit=${limit}&offset=${offset}&pesquisa=${pesquisa}`));
export const importFileAlunos = (payload) => axios.post(endpoints.aluno.import, payload, { headers: { 'Content-Type': 'multipart/form-data' } });

const alunoMethods = { 
    insertAluno,
    getAllAlunos,
    updateAlunoById,
    deleteAlunoById,
    getAlunoById,
    exportFile,
    getAlunoDiretor,
    importFileAlunos
};

export default alunoMethods;