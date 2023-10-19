'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertProfissional = payload => axios.post(endpoints.profissional.post, payload);
export const getAllProfissionais = () => axios.get(endpoints.profissional.list);
export const updateProfissionalById = (id, payload) => axios.patch(endpoints.profissional.update.concat(id), payload);
export const deleteProfissionalById = id => axios.delete(endpoints.profissional.delete.concat(id));
export const getProfissionalById = id => axios.get(endpoints.profissional.get_by_id.concat(id));

const profissionalMethods = {
    insertProfissional,
    getAllProfissionais,
    updateProfissionalById,
    deleteProfissionalById,
    getProfissionalById,
};

export default profissionalMethods;