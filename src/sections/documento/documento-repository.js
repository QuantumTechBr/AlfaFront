'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertDocumento = payload => axios.post(endpoints.documento.post, payload);
export const getAllDocumentos = () => axios.get(endpoints.documento.list);
export const updateDocumentoById = (id, payload) => axios.patch(endpoints.documento.update.concat(id), payload);
export const deleteDocumentoById = id => axios.delete(endpoints.documento.delete.concat(id));
export const getDocumentoById = id => axios.get(endpoints.documento.get_by_id.concat(id));

const documentoMethods = {
    insertDocumento,
    getAllDocumentos,
    updateDocumentoById,
    deleteDocumentoById,
    getDocumentoById,
};

export default documentoMethods;