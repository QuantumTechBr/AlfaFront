'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertFalta = payload => axios.post(endpoints.falta.post, payload);
export const getAllFaltas = () => axios.get(endpoints.falta.list);
export const updateFaltaById = (id, payload) => axios.patch(endpoints.falta.update.concat(id), payload);
export const deleteFaltaById = id => axios.delete(endpoints.falta.delete.concat(id));
export const getFaltaById = id => axios.get(endpoints.falta.get_by_id.concat(id));

const faltaMethods = {
    insertFalta,
    getAllFaltas,
    updateFaltaById,
    deleteFaltaById,
    getFaltaById,
};

export default faltaMethods;