'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertEscola = payload => axios.post(endpoints.escola.post, payload);
export const getAllEscolas = () => axios.get(endpoints.escola.list);
export const updateEscolaById = (id, payload) => axios.patch(endpoints.escola.update.concat(id), payload);
export const deleteEscolaById = id => axios.delete(endpoints.escola.delete.concat(id));
export const getEscolaById = id => axios.get(endpoints.escola.get_by_id.concat(id));

const escolaMethods = {
    insertEscola,
    getAllEscolas,
    updateEscolaById,
    deleteEscolaById,
    getEscolaById,
};

export default escolaMethods;