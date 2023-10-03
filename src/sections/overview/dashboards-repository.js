'use client';

import axios, { endpoints } from 'src/utils/axios';

export const getDashboardAvaliacaoComponente = ({escolaIds='', turmaIds=''}) => axios.get(endpoints.dashboard.avaliacao_componente.concat(`?escolas=${escolaIds}&turmas=${turmaIds}`));
export const getDashboardIndiceFases = ({escolaIds='', turmaIds=''}) => axios.get(endpoints.dashboard.indice_fases.concat(`?escolas=${escolaIds}&turmas=${turmaIds}`));
export const getDashboardTotalAlunosAtivos = ({escolaIds='', turmaIds=''}) => axios.get(endpoints.dashboard.total_alunos_ativos.concat(`?escolas=${escolaIds}&turmas=${turmaIds}`));
export const getDashboardTotalTurmasAtivas = ({escolaIds='', turmaIds=''}) => axios.get(endpoints.dashboard.total_turmas_ativas.concat(`?escolas=${escolaIds}&turmas=${turmaIds}`));
export const getDashboardTotalUsuariosAtivos = ({escolaIds='', turmaIds=''}) => axios.get(endpoints.dashboard.total_usuarios_ativos.concat(`?escolas=${escolaIds}&turmas=${turmaIds}`));

const dashboardsMethods = {
    getDashboardAvaliacaoComponente,
    getDashboardIndiceFases,
    getDashboardTotalAlunosAtivos,
    getDashboardTotalTurmasAtivas,
    getDashboardTotalUsuariosAtivos,
};

export default dashboardsMethods;




