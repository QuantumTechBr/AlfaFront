'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertCidade = payload => axios.post(endpoints.cidade.post, payload);
export const getAllCidades = () => axios.get(endpoints.cidade.list);
export const updateCidadeById = (id, payload) => axios.patch(endpoints.cidade.update.concat(id), payload);
export const deleteCidadeById = id => axios.delete(endpoints.cidade.delete.concat(id));
export const getCidadeById = id => axios.get(endpoints.cidade.get_by_id.concat(id));

const cidadeMethods = {
    insertCidade,
    getAllCidades,
    updateCidadeById,
    deleteCidadeById,
    getCidadeById,
};

export default cidadeMethods;