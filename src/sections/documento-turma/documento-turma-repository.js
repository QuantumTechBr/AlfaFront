'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertDocumentoTurma = payload => axios.post(endpoints.documento_turma.post, payload);
export const getAllDocumentosTurmas = () => axios.get(endpoints.documento_turma.list);
export const updateDocumentoTurmaById = (id, payload) => axios.patch(endpoints.documento_turma.update.concat(id), payload);
export const deleteDocumentoTurmaById = id => axios.delete(endpoints.documento_turma.delete.concat(id));
export const getDocumentoTurmaById = id => axios.get(endpoints.documento_turma.get_by_id.concat(id));

const documentoTurmaMethods = {
    insertDocumento: insertDocumentoTurma,
    getAllDocumentos: getAllDocumentosTurmas,
    updateDocumentoById: updateDocumentoTurmaById,
    deleteDocumentoById: deleteDocumentoTurmaById,
    getDocumentoById: getDocumentoTurmaById,
};

export default documentoTurmaMethods;