'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertLogAcesso = payload => axios.post(endpoints.log_acesso.post, payload);
export const getAllLogsAcesso = () => axios.get(endpoints.log_acesso.list);
export const updateLogAcessoById = (id, payload) => axios.patch(endpoints.log_acesso.update.concat(id), payload);
export const deleteLogAcessoById = id => axios.delete(endpoints.log_acesso.delete.concat(id));
export const getLogAcessoById = id => axios.get(endpoints.log_acesso.get_by_id.concat(id));

const logAcessoMethods = {
    insertLogAcesso,
    getAllLogsAcesso,
    updateLogAcessoById,
    deleteLogAcessoById,
    getLogAcessoById,
};

export default logAcessoMethods;