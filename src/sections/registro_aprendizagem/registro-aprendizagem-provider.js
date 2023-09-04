'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertRegistroAprendizagem = payload => axios.post(endpoints.registro_aprendizagem.post, payload);
export const getAllRegistrosAprendizagem = () => axios.get(endpoints.registro_aprendizagem.list);
export const updateRegistroAprendizagemById = (id, payload) => axios.patch(endpoints.registro_aprendizagem.update.concat(id), payload);
export const deleteRegistroAprendizagemById = id => axios.delete(endpoints.registro_aprendizagem.delete.concat(id));
export const getRegistroAprendizagemById = id => axios.get(endpoints.registro_aprendizagem.get_by_id.concat(id));

const registroAprendizagemMethods = {
    insertRegistroAprendizagem,
    getAllRegistrosAprendizagem,
    updateRegistroAprendizagemById,
    deleteRegistroAprendizagemById,
    getRegistroAprendizagemById,
};

export default registroAprendizagemMethods;