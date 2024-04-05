'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertAluno = payload => axios.post(endpoints.aluno.post, payload);
export const getAllAlunos = ({offset=0, limit=100, nome='', turmas='', escolas='', matricula='', fase='', pesquisa=''}) => axios.get(endpoints.aluno.list.concat(`?limit=${limit}&offset=${offset}&turmas=${turmas}&escolas=${escolas}&matricula=${matricula}&nome=${nome}&fase=${fase}&pesquisa=${pesquisa}`));
export const updateAlunoById = (id, payload) => axios.patch(endpoints.aluno.update.concat(id), payload);
export const deleteAlunoById = id => axios.delete(endpoints.aluno.delete.concat(id));
export const getAlunoById = id => axios.get(endpoints.aluno.get_by_id.concat(id));
export const exportFile = query => axios.get(endpoints.aluno.list.concat(`?`).concat(query));

const alunoMethods = { 
    insertAluno,
    getAllAlunos,
    updateAlunoById,
    deleteAlunoById,
    getAlunoById,
    exportFile,
};

export default alunoMethods;