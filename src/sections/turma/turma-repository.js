'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertTurma = payload => axios.post(endpoints.turma.post, payload);
export const getAllTurmas = () => axios.get(endpoints.turma.list);
export const getAllTurmasPaginado = ({offset=0, limit=100, nome='', ddzs='', escolas='', status=''}) => axios.get(endpoints.turma.list.concat(`?limit=${limit}&offset=${offset}&ddzs=${ddzs}&escolas=${escolas}&nome=${nome}&status=${status}`));
export const updateTurmaById = (id, payload) => axios.patch(endpoints.turma.update.concat(id), payload);
export const deleteTurmaById = id => axios.delete(endpoints.turma.delete.concat(id));
export const getTurmaById = id => axios.get(endpoints.turma.get_by_id.concat(id));
export const exportFile = query => axios.get(endpoints.turma.list.concat(`?`).concat(query));

const turmaMethods = {
    insertTurma,
    getAllTurmas,
    getAllTurmasPaginado,
    updateTurmaById,
    deleteTurmaById,
    getTurmaById,
    exportFile,
};

export default turmaMethods;