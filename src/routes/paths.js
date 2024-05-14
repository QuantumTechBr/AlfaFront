// utils
import { paramCase } from 'src/utils/change-case';
import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  page403: '/403',
  page404: '/404',
  page500: '/500',
  // AUTH
  auth: {
    alfa: {
      login: `${ROOTS.AUTH}/alfa/login`,
      forgotPassword: `${ROOTS.AUTH}/alfa/forgot-password`,
      register: `${ROOTS.AUTH}/alfa/register`,
      newPassword: `${ROOTS.AUTH}/alfa/new-password`,
      linkSent: `${ROOTS.AUTH}/alfa/link-sent`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    root_diagnostico: `${ROOTS.DASHBOARD}/dash-diagnostica`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    documento: `${ROOTS.DASHBOARD}/documento`,
    documento_turma: `${ROOTS.DASHBOARD}/documento-turma`,
    user: {
      root: `${ROOTS.DASHBOARD}/user/list`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
    },
    aluno: {
      root: `${ROOTS.DASHBOARD}/aluno`,
      new: `${ROOTS.DASHBOARD}/aluno/new`,
      list: `${ROOTS.DASHBOARD}/aluno/list`,
      profile: `${ROOTS.DASHBOARD}/aluno/profile`,
      edit: (id) => `${ROOTS.DASHBOARD}/aluno/${id}/edit`,
    },
    turma: {
      root: `${ROOTS.DASHBOARD}/turma/list`,
      new: `${ROOTS.DASHBOARD}/turma/new`,
      list: `${ROOTS.DASHBOARD}/turma/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/turma/${id}/edit`,
    },
    profissional: {
      root: `${ROOTS.DASHBOARD}/profissional/list`,
      new: `${ROOTS.DASHBOARD}/profissional/new`,
      list: `${ROOTS.DASHBOARD}/profissional/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/profissional/${id}/edit`,
    },
    plano_intervencao: {
      root: `${ROOTS.DASHBOARD}/plano_intervencao/list`,
      new: `${ROOTS.DASHBOARD}/plano_intervencao/new`,
      new_from: (id) => `${ROOTS.DASHBOARD}/plano_intervencao/${id}/new_from`,
      list: `${ROOTS.DASHBOARD}/plano_intervencao/list`,
      documento: (id) => `${ROOTS.DASHBOARD}/plano_intervencao/${id}/documento`,
      edit: (id) => `${ROOTS.DASHBOARD}/plano_intervencao/${id}/edit`,
    },
    registro_aprendizagem: {
      root: `${ROOTS.DASHBOARD}/registro_aprendizagem`,
      root_diagnostico: `${ROOTS.DASHBOARD}/registro_aprendizagem/diagnostico/list`,
      new_diagnostico: `${ROOTS.DASHBOARD}/registro_aprendizagem/diagnostico/new`,
      edit_diagnostico: (turmaInicial, periodoInicial) => `${ROOTS.DASHBOARD}/registro_aprendizagem/diagnostico/new`,
      root_fase: `${ROOTS.DASHBOARD}/registro_aprendizagem/fase`,
      new_fase: `${ROOTS.DASHBOARD}/registro_aprendizagem/fase/new`,
      edit_fase: (turmaInicial, bimestreInicial) => `${ROOTS.DASHBOARD}/registro_aprendizagem/fase/${turmaInicial}/${bimestreInicial}`,
      root_componente: `${ROOTS.DASHBOARD}/registro_aprendizagem/componente/list`,
      new_componente: `${ROOTS.DASHBOARD}/registro_aprendizagem/componente/new`,
      edit_componente: (id) => `${ROOTS.DASHBOARD}/registro_aprendizagem/componente/${id}/edit`,
    },
    zona: {
      root: `${ROOTS.DASHBOARD}/zona/list`,
      new: `${ROOTS.DASHBOARD}/zona/new`,
      list: `${ROOTS.DASHBOARD}/zona/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/zona/${id}/edit`,
    },
    escola: {
      root: `${ROOTS.DASHBOARD}/escola/list`,
      new: `${ROOTS.DASHBOARD}/escola/new`,
      list: `${ROOTS.DASHBOARD}/escola/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/escola/${id}/edit`,
    },
  },
};
