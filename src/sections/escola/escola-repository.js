'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertEscola = payload => axios.post(endpoints.escola.post, payload);
export const getAllEscolas = () => axios.get(endpoints.escola.list);
export const updateEscolaById = (id, payload) => axios.patch(endpoints.escola.update.concat(id), payload);
export const deleteEscolaById = id => axios.delete(endpoints.escola.delete.concat(id));
export const getEscolaById = id => axios.get(endpoints.escola.get_by_id.concat(id));
export const getAlunosByEscolaId = id => axios.get(endpoints.escola.get_by_id.concat(id)+"/alunos");
export const updateAlunosByEscolaId = (escolaId, payload) => axios.post(endpoints.escola.get_by_id.concat(escolaId)+"/alunos", payload);
export const deleteAlunosByEscolaId = (escolaId, alunoEscolaId) => axios.delete(endpoints.escola.get_by_id.concat(escolaId)+`/alunos/${alunoEscolaId}`);
export const importFileEscolas = payload => axios.post(endpoints.escola.import, payload, { headers: { 'Content-Type': 'multipart/form-data' } });

const escolaMethods = {
    insertEscola,
    getAllEscolas,
    updateEscolaById,
    deleteEscolaById, 
    getEscolaById,
    getAlunosByEscolaId,
    updateAlunosByEscolaId,
    deleteAlunosByEscolaId, 
    importFileEscolas
};

export default escolaMethods;