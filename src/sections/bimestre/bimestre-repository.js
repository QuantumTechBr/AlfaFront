'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertBimestre = payload => axios.post(endpoints.bimestre.post, payload);
export const getAllBimestres = (ano_id) => axios.get(endpoints.bimestre.list+'?ano='+ano_id);
export const updateBimestreById = (id, payload) => axios.patch(endpoints.bimestre.update.concat(id), payload);
export const deleteBimestreById = id => axios.delete(endpoints.bimestre.delete.concat(id));
export const getBimestreById = id => axios.get(endpoints.bimestre.get_by_id.concat(id));

const bimestreMethods = {
    insertBimestre,
    getAllBimestres,
    updateBimestreById,
    deleteBimestreById,
    getBimestreById,
};

export default bimestreMethods;