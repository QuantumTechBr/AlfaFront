'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertUser = payload => axios.post(endpoints.user.post, payload);
export const getAllUsers = () => axios.get(endpoints.user.list);
export const updateUserById = (id, payload) => axios.put(endpoints.user.update.concat(id), payload);
export const deleteUserById = id => axios.delete(endpoints.user.delete.concat(id));
export const getUserById = id => axios.get(endpoints.user.get_by_id.concat(id));

const userMethods = {
    insertUser,
    getAllUsers,
    updateUserById,
    deleteUserById,
    getUserById,
};

export default userMethods;