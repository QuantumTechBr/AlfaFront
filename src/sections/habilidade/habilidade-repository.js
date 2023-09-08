'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertHabilidade = payload => axios.post(endpoints.habilidade.post, payload);
export const getAllHabilidades = () => axios.get(endpoints.habilidade.list);
export const updateHabilidadeById = (id, payload) => axios.patch(endpoints.habilidade.update.concat(id), payload);
export const deleteHabilidadeById = id => axios.delete(endpoints.habilidade.delete.concat(id));
export const getHabilidadeById = id => axios.get(endpoints.habilidade.get_by_id.concat(id));

const habilidadeMethods = {
    insertHabilidade,
    getAllHabilidades,
    updateHabilidadeById,
    deleteHabilidadeById,
    getHabilidadeById,
};

export default habilidadeMethods;