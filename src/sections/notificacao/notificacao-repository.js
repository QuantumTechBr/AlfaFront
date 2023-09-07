'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertNotificacao = payload => axios.post(endpoints.notificacao.post, payload);
export const getAllNotificacoes = () => axios.get(endpoints.notificacao.list);
export const updateNotificacaoById = (id, payload) => axios.patch(endpoints.notificacao.update.concat(id), payload);
export const deleteNotificacaoById = id => axios.delete(endpoints.notificacao.delete.concat(id));
export const getNotificacaoById = id => axios.get(endpoints.notificacao.get_by_id.concat(id));

const notificacaoMethods = {
    insertNotificacao,
    getAllNotificacoes,
    updateNotificacaoById,
    deleteNotificacaoById,
    getNotificacaoById,
};

export default notificacaoMethods;