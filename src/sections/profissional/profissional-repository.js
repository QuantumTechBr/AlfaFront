'use client';

import axios, { endpoints } from 'src/utils/axios';

export const insertProfissional = payload => axios.post(endpoints.profissional.post, payload);
export const getAllProfissionais = () => axios.get(endpoints.profissional.list);
export const getAllProfissionaisPaginado = ({offset=0, limit=100, nome='', escolas='', funcao=''}) => axios.get(endpoints.profissional.list.concat(`?limit=${limit}&offset=${offset}&nome=${nome}&escola_id=${escolas}&funcao_usuario_nome_exibicao=${funcao}`));
export const updateProfissionalById = (id, payload) => axios.patch(endpoints.profissional.update.concat(id), payload);
export const deleteProfissionalById = id => axios.delete(endpoints.profissional.delete.concat(id));
export const getProfissionalById = id => axios.get(endpoints.profissional.get_by_id.concat(id));
export const getProfessoresByEscolaId = ({escolaId=''}) => axios.get(endpoints.profissional.get_by_id.concat(`?funcao_nome=professor&escola_id=${escolaId}`));
export const exportFile = query => axios.get(endpoints.profissional.list.concat(`?`).concat(query));

const profissionalMethods = {
    insertProfissional,
    getAllProfissionais,
    getAllProfissionaisPaginado,
    updateProfissionalById,
    deleteProfissionalById,
    getProfissionalById,
    getProfessoresByEscolaId,
    exportFile,
};

export default profissionalMethods;