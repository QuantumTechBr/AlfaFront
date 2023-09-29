'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertDisciplina = payload => axios.post(endpoints.disciplina.post, payload);
export const getAllDisciplinas = () => axios.get(endpoints.disciplina.list);
export const updateDisciplinaById = (id, payload) => axios.patch(endpoints.disciplina.update.concat(id), payload);
export const deleteDisciplinaById = id => axios.delete(endpoints.disciplina.delete.concat(id));
export const getDisciplinaById = id => axios.get(endpoints.disciplina.get_by_id.concat(id));

const disciplinaMethods = {
    insertDisciplina,
    getAllDisciplinas,
    updateDisciplinaById,
    deleteDisciplinaById,
    getDisciplinaById,
};

export default disciplinaMethods;