'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertArquivoAtividade = payload => axios.post(endpoints.arquivo_atividade.post, payload);
export const getAllArquivoAtividades = () => axios.get(endpoints.arquivo_atividade.list);
export const updateArquivoAtividadeById = (id, payload) => axios.patch(endpoints.arquivo_atividade.update.concat(id), payload);
export const deleteArquivoAtividadeById = id => axios.delete(endpoints.arquivo_atividade.delete.concat(id));
export const getArquivoAtividadeById = id => axios.get(endpoints.arquivo_atividade.get_by_id.concat(id));

const arquivoAtividadeMethods = {
    insertArquivoAtividade,
    getAllArquivoAtividades,
    updateArquivoAtividadeById,
    deleteArquivoAtividadeById,
    getArquivoAtividadeById,
};

export default arquivoAtividadeMethods;