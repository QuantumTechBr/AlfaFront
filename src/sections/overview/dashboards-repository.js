'use client';

import axios, { endpoints } from 'src/utils/axios';

export const getDashboardAvaliacaoComponente = payload => axios.post(endpoints.dashboard.avaliacao_componente, payload);
export const getDashboardAvaliacaoDiagnosticoRede = payload => axios.post(endpoints.dashboard.avaliacao_diagnostico_rede, payload);
export const getDashboardAvaliacaoDiagnostico = payload => axios.post(endpoints.dashboard.avaliacao_diagnostico, payload);
export const getDashboardDesempenhoAlunos = payload => axios.post(endpoints.dashboard.desempenho_alunos, payload);
export const getDashboardIndiceFases = payload => axios.post(endpoints.dashboard.indice_fases, payload);
export const getDashboardIndiceAprovacao = payload => axios.post(endpoints.dashboard.indice_aprovacao, payload);
export const getDashboardTotalAlunosAtivos = payload => axios.post(endpoints.dashboard.total_alunos_ativos, payload);
export const getDashboardTotalTurmasAtivas = payload => axios.post(endpoints.dashboard.total_turmas_ativas, payload);
export const getDashboardTotalUsuariosAtivos = payload => axios.post(endpoints.dashboard.total_usuarios_ativos, payload);
export const getDashboardGridRede = payload => axios.post(endpoints.dashboard.grid_rede, payload);
export const getDashboardGridEscolas = payload => axios.post(endpoints.dashboard.grid_escolas, payload);
export const getDashboardGridProfessores = payload => axios.post(endpoints.dashboard.grid_professores, payload);
export const getDashboardGridTurmas = payload => axios.post(endpoints.dashboard.grid_turmas, payload);


export const getDashboardAvaliacaoDiagnosticoRede2 = payload => axios.post(endpoints.dashboard.avaliacao_diagnostico_rede2, payload);
export const getDashboardAvaliacaoDiagnostico2 = payload => axios.post(endpoints.dashboard.avaliacao_diagnostico2, payload);

//
const dashboardsMethods = {
    getDashboardAvaliacaoComponente,
    getDashboardAvaliacaoDiagnosticoRede,
    getDashboardAvaliacaoDiagnostico,
    getDashboardDesempenhoAlunos,
    getDashboardIndiceFases,
    getDashboardIndiceAprovacao,
    getDashboardTotalAlunosAtivos,
    getDashboardTotalTurmasAtivas,
    getDashboardTotalUsuariosAtivos,
    getDashboardGridRede,
    getDashboardGridEscolas,
    getDashboardGridProfessores,
    getDashboardGridTurmas,

    
    getDashboardAvaliacaoDiagnosticoRede2,
    getDashboardAvaliacaoDiagnostico2,
};

export default dashboardsMethods;
