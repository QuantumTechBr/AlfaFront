'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertCalendario = payload => axios.post(endpoints.calendario.post, payload);
export const getAllCalendarios = () => axios.get(endpoints.calendario.list);
export const updateCalendarioById = (id, payload) => axios.patch(endpoints.calendario.update.concat(id), payload);
export const deleteCalendarioById = id => axios.delete(endpoints.calendario.delete.concat(id));
export const getCalendarioById = id => axios.get(endpoints.calendario.get_by_id.concat(id));

const calendarioMethods = {
    insertCalendario,
    getAllCalendarios,
    updateCalendarioById,
    deleteCalendarioById,
    getCalendarioById,
};

export default calendarioMethods;