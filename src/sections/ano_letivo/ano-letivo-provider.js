'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertAnoLetivo = payload => axios.post(endpoints.ano_letivo.post, payload);
export const getAllAnoLetivos = () => axios.get(endpoints.ano_letivo.list);
export const updateAnoLetivoById = (id, payload) => axios.patch(endpoints.ano_letivo.update.concat(id), payload);
export const deleteAnoLetivoById = id => axios.delete(endpoints.ano_letivo.delete.concat(id));
export const getAnoLetivoById = id => axios.get(endpoints.ano_letivo.get_by_id.concat(id));

const anoLetivoMethods = {
    insertAnoLetivo,
    getAllAnoLetivos,
    updateAnoLetivoById,
    deleteAnoLetivoById,
    getAnoLetivoById,
};

export default anoLetivoMethods;