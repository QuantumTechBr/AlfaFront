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
    }
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    blank: `${ROOTS.DASHBOARD}/blank`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    documento: `${ROOTS.DASHBOARD}/documento`,
    documento_turma: `${ROOTS.DASHBOARD}/documento-turma`,
    user: {
      root: `${ROOTS.DASHBOARD}/user/list`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
    },
    aluno: {
      root: `${ROOTS.DASHBOARD}/aluno`,
      new: `${ROOTS.DASHBOARD}/aluno/new`,
      list: `${ROOTS.DASHBOARD}/aluno/list`,
      cards: `${ROOTS.DASHBOARD}/aluno/cards`,
      profile: `${ROOTS.DASHBOARD}/aluno/profile`,
      account: `${ROOTS.DASHBOARD}/aluno/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/aluno/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/aluno/${MOCK_ID}/edit`,
      },
    },
    turma: {
      root: `${ROOTS.DASHBOARD}/turma/list`,
      new: `${ROOTS.DASHBOARD}/turma/new`,
      list: `${ROOTS.DASHBOARD}/turma/list`,
      cards: `${ROOTS.DASHBOARD}/turma/cards`,
      account: `${ROOTS.DASHBOARD}/turma/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/turma/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/turma/${MOCK_ID}/edit`,
      },
    },
    profissional: {
      root: `${ROOTS.DASHBOARD}/profissional/list`,
      new: `${ROOTS.DASHBOARD}/profissional/new`,
      list: `${ROOTS.DASHBOARD}/profissional/list`,
      cards: `${ROOTS.DASHBOARD}/profissional/cards`,
      account: `${ROOTS.DASHBOARD}/profissional/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/profissional/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/profissional/${MOCK_ID}/edit`,
      },
    },
    plano_intervencao: {
      root: `${ROOTS.DASHBOARD}/plano_intervencao/list`,
      new: `${ROOTS.DASHBOARD}/plano_intervencao/new`,
      new_from: (id) => `${ROOTS.DASHBOARD}/plano_intervencao/${id}/new_from`,
      list: `${ROOTS.DASHBOARD}/plano_intervencao/list`,
      documento: (id) => `${ROOTS.DASHBOARD}/plano_intervencao/${id}/documento`,
      cards: `${ROOTS.DASHBOARD}/plano_intervencao/cards`,
      account: `${ROOTS.DASHBOARD}/plano_intervencao/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/plano_intervencao/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/plano_de_intervencao/${MOCK_ID}/edit`,
      },
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
    }
  },
};
