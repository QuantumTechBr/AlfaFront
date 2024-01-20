'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertDocumentoIntervencao = payload => axios.post(endpoints.documento_intervencao.post, payload);
export const getAllDocumentosIntervencaos = (planoId) => axios.get(endpoints.documento_intervencao.list.concat(`?plano_id=${planoId}`));
export const updateDocumentoIntervencaoById = (id, payload) => axios.patch(endpoints.documento_intervencao.update.concat(id), payload);
export const deleteDocumentoIntervencaoById = id => axios.delete(endpoints.documento_intervencao.delete.concat(id));
export const getDocumentoIntervencaoById = id => axios.get(endpoints.documento_intervencao.get_by_id.concat(id));

const documentoIntervencaoMethods = {
    insertDocumento: insertDocumentoIntervencao,
    getAllDocumentos: getAllDocumentosIntervencaos,
    updateDocumentoById: updateDocumentoIntervencaoById,
    deleteDocumentoById: deleteDocumentoIntervencaoById,
    getDocumentoById: getDocumentoIntervencaoById,
};

export default documentoIntervencaoMethods;