'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertPlanoIntervencao = payload => axios.post(endpoints.plano_intervencao.post, payload);
export const getAllPlanosIntervencao = () => axios.get(endpoints.plano_intervencao.list);
export const updatePlanoIntervencaoById = (id, payload) => axios.patch(endpoints.plano_intervencao.update.concat(id), payload);
export const deletePlanoIntervencaoById = id => axios.delete(endpoints.plano_intervencao.delete.concat(id));
export const getPlanoIntervencaoById = id => axios.get(endpoints.plano_intervencao.get_by_id.concat(id));

const planoIntervencaoMethods = {
    insertPlanoIntervencao,
    getAllPlanosIntervencao,
    updatePlanoIntervencaoById,
    deletePlanoIntervencaoById,
    getPlanoIntervencaoById,
};

export default planoIntervencaoMethods;