'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertEstado = payload => axios.post(endpoints.estado.post, payload);
export const getAllEstados = () => axios.get(endpoints.estado.list);
export const updateEstadoById = (id, payload) => axios.patch(endpoints.estado.update.concat(id), payload);
export const deleteEstadoById = id => axios.delete(endpoints.estado.delete.concat(id));
export const getEstadoById = id => axios.get(endpoints.estado.get_by_id.concat(id));

const estadoMethods = {
    insertEstado,
    getAllEstados,
    updateEstadoById,
    deleteEstadoById,
    getEstadoById,
};

export default estadoMethods;