'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertUser = payload => axios.post(endpoints.user.post, payload);
export const getAllUsers = () => axios.get(endpoints.user.list);
export const getAllUsersPaginado = ({offset=0, limit=100, nome='', escolas='', funcao='', zona='', status='', permissao=''}) => axios.get(endpoints.user.list.concat(`?limit=${limit}&offset=${offset}&nome=${nome}&escola_id=${escolas}&funcao_usuario_nome_exibicao=${funcao}&zona_id=${zona}&status=${status}&permissao_nome=${permissao}`));
export const updateUserById = (id, payload) => axios.patch(endpoints.user.update.concat(id), payload);
export const deleteUserById = id => axios.delete(endpoints.user.delete.concat(id));
export const getUserById = id => axios.get(endpoints.user.get_by_id.concat(id));
export const exportFile = query => axios.get(endpoints.user.list.concat(`?`).concat(query));
export const importFileUsers = payload => axios.post(endpoints.user.import, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateUserAvatar = payload => axios.post(endpoints.user.update_avatar, payload, { headers: { 'Content-Type': 'multipart/form-data' } });

const userMethods = {
    insertUser,
    getAllUsers,
    getAllUsersPaginado,
    updateUserById,
    deleteUserById,
    getUserById,
    exportFile,
    importFileUsers,
    updateUserAvatar
};

export default userMethods;