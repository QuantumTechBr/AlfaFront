// utils
import { paramCase } from 'src/utils/change-case';
import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneUI: 'https://mui.com/store/items/zone-landing-page/',
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figma:
    'https://www.figma.com/file/kAYnYYdib0aQPNKZpgJT6J/%5BPreview%5D-Minimal-Web.v5.0.0?type=design&node-id=0%3A1&t=Al4jScQq97Aly0Mn-1',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: {
      details: `/product/${MOCK_ID}`,
    },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${paramCase(title)}`,
    demo: {
      details: `/post/${paramCase(MOCK_TITLE)}`,
    },
  },
  // AUTH
  auth: {
    amplify: {
      login: `${ROOTS.AUTH}/amplify/login`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      register: `${ROOTS.AUTH}/amplify/register`,
      newPassword: `${ROOTS.AUTH}/amplify/new-password`,
      forgotPassword: `${ROOTS.AUTH}/amplify/forgot-password`,
    },
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
    firebase: {
      login: `${ROOTS.AUTH}/firebase/login`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      register: `${ROOTS.AUTH}/firebase/register`,
      forgotPassword: `${ROOTS.AUTH}/firebase/forgot-password`,
    },
    auth0: {
      login: `${ROOTS.AUTH}/auth0/login`,
    },
    alfa: {
      login: `${ROOTS.AUTH}/alfa/login`,
      forgotPassword: `${ROOTS.AUTH}/alfa/forgot-password`,
      register: `${ROOTS.AUTH}/alfa/register`,
      newPassword: `${ROOTS.AUTH}/alfa/new-password`,
      linkSent: `${ROOTS.AUTH}/alfa/link-sent`,
    }
  },
  authDemo: {
    classic: {
      login: `${ROOTS.AUTH_DEMO}/classic/login`,
      register: `${ROOTS.AUTH_DEMO}/classic/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/classic/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/classic/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/classic/verify`,
    },
    modern: {
      login: `${ROOTS.AUTH_DEMO}/modern/login`,
      register: `${ROOTS.AUTH_DEMO}/modern/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/modern/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/modern/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/modern/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    documento: `${ROOTS.DASHBOARD}/documento`,
    documento_turma: `${ROOTS.DASHBOARD}/documento-turma`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user/list`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
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
      // profile: `${ROOTS.DASHBOARD}/turma/profile`,
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
      list: `${ROOTS.DASHBOARD}/plano_intervencao/list`,
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
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}`,
      edit: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}`,
      },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
  },
};
