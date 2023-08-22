'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertTurma = payload => axios.post(endpoints.turma.post, payload);
export const getAllTurmas = () => axios.get(endpoints.turma.list);
export const updateTurmaById = (id, payload) => axios.put(endpoints.turma.update.concat(id), payload);
export const deleteTurmaById = id => axios.delete(endpoints.turma.delete.concat(id));
export const getTurmaById = id => axios.get(endpoints.turma.get.concat(id));

const turmaMethods = {
    insertTurma,
    getAllTurmas,
    updateTurmaById,
    deleteTurmaById,
    getTurmaById,
};

export default turmaMethods;