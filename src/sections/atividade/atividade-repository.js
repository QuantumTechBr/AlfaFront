'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertAtividade = payload => axios.post(endpoints.atividade.post, payload);
export const getAllAtividades = () => axios.get(endpoints.atividade.list);
export const updateAtividadeById = (id, payload) => axios.patch(endpoints.atividade.update.concat(id), payload);
export const deleteAtividadeById = id => axios.delete(endpoints.atividade.delete.concat(id));
export const getAtividadeById = id => axios.get(endpoints.atividade.get_by_id.concat(id));

const atividadeMethods = {
    insertAtividade,
    getAllAtividades,
    updateAtividadeById,
    deleteAtividadeById,
    getAtividadeById,
};

export default atividadeMethods;