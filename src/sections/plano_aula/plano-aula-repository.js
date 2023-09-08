'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertPlanoAula = payload => axios.post(endpoints.plano_aula.post, payload);
export const getAllPlanosAulas = () => axios.get(endpoints.plano_aula.list);
export const updatePlanoAulaById = (id, payload) => axios.patch(endpoints.plano_aula.update.concat(id), payload);
export const deletePlanoAulaById = id => axios.delete(endpoints.plano_aula.delete.concat(id));
export const getPlanoAulaById = id => axios.get(endpoints.plano_aula.get_by_id.concat(id));

const planoAulaMethods = {
    insertPlanoAula,
    getAllPlanosAulas,
    updatePlanoAulaById,
    deletePlanoAulaById,
    getPlanoAulaById,
};

export default planoAulaMethods;