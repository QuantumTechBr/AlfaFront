'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertPermissao = payload => axios.post(endpoints.permissao.post, payload);
export const getAllPermissoes = () => axios.get(endpoints.permissao.list);
export const updatePermissaoById = (id, payload) => axios.patch(endpoints.permissao.update.concat(id), payload);
export const deletePermissaoById = id => axios.delete(endpoints.permissao.delete.concat(id));
export const getPermissaoById = id => axios.get(endpoints.permissao.get_by_id.concat(id));

const permissaoMethods = {
    insertPermissao,
    getAllPermissoes,
    updatePermissaoById,
    deletePermissaoById,
    getPermissaoById,
};

export default permissaoMethods;