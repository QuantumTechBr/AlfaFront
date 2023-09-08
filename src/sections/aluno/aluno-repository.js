'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertAluno = payload => axios.post(endpoints.aluno.post, payload);
export const getAllAlunos = () => axios.get(endpoints.aluno.list);
export const updateAlunoById = (id, payload) => axios.patch(endpoints.aluno.update.concat(id), payload);
export const deleteAlunoById = id => axios.delete(endpoints.aluno.delete.concat(id));
export const getAlunoById = id => axios.get(endpoints.aluno.get_by_id.concat(id));

const alunoMethods = {
    insertAluno,
    getAllAlunos,
    updateAlunoById,
    deleteAlunoById,
    getAlunoById,
};

export default alunoMethods;