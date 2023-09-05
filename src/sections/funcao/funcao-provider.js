'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertFuncao = payload => axios.post(endpoints.funcao.post, payload);
export const getAllFuncoes = () => axios.get(endpoints.funcao.list);
export const updateFuncaoById = (id, payload) => axios.patch(endpoints.funcao.update.concat(id), payload);
export const deleteFuncaoById = id => axios.delete(endpoints.funcao.delete.concat(id));
export const getFuncaoById = id => axios.get(endpoints.funcao.get_by_id.concat(id));

const funcaoMethods = {
    insertFuncao,
    getAllFuncoes,
    updateFuncaoById,
    deleteFuncaoById,
    getFuncaoById,
};

export default funcaoMethods;