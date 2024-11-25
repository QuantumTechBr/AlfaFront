'use client';

import axios, { endpoints } from 'src/utils/axios';

export const getAllImportacoes = () => axios.get(endpoints.importacao.list);

const importacaoMethods = {
    getAllImportacoes,
};

export default importacaoMethods;