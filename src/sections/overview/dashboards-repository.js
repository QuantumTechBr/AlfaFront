'use client';

import axios, { endpoints } from 'src/utils/axios';

export const getDashboardAvaliacaoComponente = payload => axios.post(endpoints.dashboard.avaliacao_componente, payload);
export const getDashboardAvaliacaoDiagnostico = payload => axios.post(endpoints.dashboard.avaliacao_diagnostico, payload);
export const getDashboardDesempenhoAlunos = payload => axios.post(endpoints.dashboard.desempenho_alunos, payload);
export const getDashboardIndiceFases = payload => axios.post(endpoints.dashboard.indice_fases, payload);
export const getDashboardIndiceAprovacao = payload => axios.post(endpoints.dashboard.indice_aprovacao, payload);
export const getDashboardTotalAlunosAtivos = payload => axios.post(endpoints.dashboard.total_alunos_ativos, payload);
export const getDashboardTotalTurmasAtivas = payload => axios.post(endpoints.dashboard.total_turmas_ativas, payload);
export const getDashboardTotalUsuariosAtivos = payload => axios.post(endpoints.dashboard.total_usuarios_ativos, payload);

const dashboardsMethods = {
    getDashboardAvaliacaoComponente,
    getDashboardAvaliacaoDiagnostico,
    getDashboardDesempenhoAlunos,
    getDashboardIndiceFases,
    getDashboardIndiceAprovacao,
    getDashboardTotalAlunosAtivos,
    getDashboardTotalTurmasAtivas,
    getDashboardTotalUsuariosAtivos,
};

export default dashboardsMethods;




