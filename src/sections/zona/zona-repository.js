'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertZona = payload => axios.post(endpoints.zona.post, payload);
export const getAllZonas = () => axios.get(endpoints.zona.list);
export const updateZonaById = (id, payload) => axios.patch(endpoints.zona.update.concat(id), payload);
export const deleteZonaById = id => axios.delete(endpoints.zona.delete.concat(id));
export const getZonaById = id => axios.get(endpoints.zona.get_by_id.concat(id));

const zonaMethods = {
    insertZona,
    getAllZonas,
    updateZonaById,
    deleteZonaById,
    getZonaById,
};

export default zonaMethods;