import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';



// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if ( error.status >= 400 && error.status < 500) {
      let arrayMsg = [];
      console.log(error);
      for (const [key, value] of Object.entries(error.response.data)) {
        if (key == 'non_field_errors') {
          arrayMsg.push(`${value}`);
        } else {
          arrayMsg.push(`${key}: ${value}`);
        }
      }
      const mensagem = arrayMsg.join(' ');
      return Promise.reject((mensagem) || 'Algo deu errado')
    } else if (error.status >= 500) {
      return Promise.reject(`Erro ` + error.status +`, contate o suporte e descreva como reproduzir o erro.`)
    }
  } 
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: {
    list:'/api/v1/calendarios/',
    post:'/api/v1/calendarios',
    get_by_id:'/api/v1/calendarios/',
    update:'/api/v1/calendarios/',
    delete:'/api/v1/calendarios/',
  },
  aluno: {
    list: '/api/v1/alunos/',
    post: '/api/v1/alunos/',
    get_by_id: '/api/v1/alunos/',
    update: '/api/v1/alunos/',
    delete: '/api/v1/alunos/',
  },
  ano_letivo: {
    list: '/api/v1/anos-letivos/',
    post: '/api/v1/anos-letivos',
    get_by_id: '/api/v1/anos-letivos/',
    update: '/api/v1/anos-letivos/',
    delete: '/api/v1/anos-letivos/',
  },
  arquivo_atividade: {
    list: '/api/v1/arquivos-atividades/',
    post: '/api/v1/arquivos-atividades',
    get_by_id: '/api/v1/arquivos-atividades/',
    update: '/api/v1/arquivos-atividades/',
    delete: '/api/v1/arquivos-atividades/',
  },
  atividade: {
    list: '/api/v1/atividades/',
    post: '/api/v1/atividades',
    get_by_id: '/api/v1/atividades/', 
    update: '/api/v1/atividades/', 
    delete: '/api/v1/atividades/',
  },
  auth: {
    me: '/api/v1/auth/me',
    login: '/api/v1/auth',
    logout: '/api/v1/auth/logout',
    register: '/api/auth/register',
    reset_password: '/api/v1/password_reset/reset',
    reset_confirm: '/api/v1/password_reset/confirm',
    validate_token: '/api/v1/password_reset/validate_token',
  },
  bimestre: {
    list: '/api/v1/bimestres/',
    post: '/api/v1/bimestres',
    get_by_id: '/api/v1/bimestres/',
    update: '/api/v1/bimestres/',
    delete: '/api/v1/bimestres/',
  },
  calendario: {
    list: '/api/v1/calendarios/',
    post: '/api/v1/calendarios/',
    get_by_id: '/api/v1/calendarios/',
    update: '/api/v1/calendarios/',
    delete: '/api/v1/calendarios/',
  },
  cidade: {
    list: '/api/v1/cidades/',
    post: '/api/v1/cidades',
    get_by_id: '/api/v1/cidades/',
    update: '/api/v1/cidades/',
    delete: '/api/v1/cidades/',
  },
  dashboard: {
    avaliacao_diagnostico_rede: '/api/v1/dashboards/avaliacao-diagnosticos-rede',
    avaliacao_diagnostico: '/api/v1/dashboards/avaliacao-diagnosticos',
    desempenho_alunos: '/api/v1/dashboards/desempenho-alunos',
    indice_fases: '/api/v1/dashboards/indice-fases',
    indice_aprovacao: '/api/v1/dashboards/indice-aprovacao-redes',
    total_alunos_ativos: '/api/v1/dashboards/total-alunos-ativos',
    total_turmas_ativas: '/api/v1/dashboards/total-turmas-ativas',
    total_usuarios_ativos: '/api/v1/dashboards/total-usuarios-ativos',
    grid_rede:  '/api/v1/dashboards/grid-rede',
    grid_escolas:  '/api/v1/dashboards/grid-escolas',
    grid_professores:  '/api/v1/dashboards/grid-professores',
    grid_turmas:  '/api/v1/dashboards/grid-turmas',
  },
  disciplina: {
    list: '/api/v1/disciplinas/',
    post: '/api/v1/disciplinas',
    get_by_id: '/api/v1/disciplinas/',
    update: '/api/v1/disciplinas/',
    delete: '/api/v1/disciplinas/',
  },
  documento: {
    list: '/api/v1/documentos/',
    post: '/api/v1/documentos/',
    get_by_id: '/api/v1/documentos/',
    update: '/api/v1/documentos/',
    delete: '/api/v1/documentos/',
  },
  documento_intervencao: {
    list: '/api/v1/documento-intervencao/',
    post: '/api/v1/documento-intervencao/',
    get_by_id: '/api/v1/documento-intervencao/',
    update: '/api/v1/documento-intervencao/',
    delete: '/api/v1/documento-intervencao/',
  },
  escola: {
    list: '/api/v1/escolas/',
    post: '/api/v1/escolas/',
    get_by_id: '/api/v1/escolas/',
    update: '/api/v1/escolas/',
    delete: '/api/v1/escolas/',
  },
  estado: {
    list: '/api/v1/estados/',
    post: '/api/v1/estados',
    get_by_id: '/api/v1/estados/',
    update: '/api/v1/estados/',
    delete: '/api/v1/estados/',
  },
  falta: {
    list: '/api/v1/faltas/',
    post: '/api/v1/faltas',
    get_by_id: '/api/v1/faltas/',
    update: '/api/v1/faltas/',
    delete: '/api/v1/faltas/',
  },
  funcao: {
    list: '/api/v1/funcoes/',
    post: '/api/v1/funcoes',
    get_by_id: '/api/v1/funcoes/',
    update: '/api/v1/funcoes/',
    delete: '/api/v1/funcoes/',
  },
  habilidade: {
    list: '/api/v1/habilidades/',
    post: '/api/v1/habilidades',
    get_by_id: '/api/v1/habilidades/',
    update: '/api/v1/habilidades/',
    delete: '/api/v1/habilidades/',
  },
  log_acesso: {
    list: '/api/v1/logs-acesso/',
    post: '/api/v1/logs-acesso',
    get_by_id: '/api/v1/logs-acesso/',
    update: '/api/v1/logs-acesso/',
    delete: '/api/v1/logs-acesso/',
  },
  notificacao: {
    list: '/api/v1/notificacoes/',
    post: '/api/v1/notificacoes',
    get_by_id: '/api/v1/notificacoes/',
    update: '/api/v1/notificacoes/',
    delete: '/api/v1/notificacoes/',
  },
  permissao: {
    list: '/api/v1/permissoes/',
    post: '/api/v1/permissoes',
    get_by_id: '/api/v1/permissoes/',
    update: '/api/v1/permissoes/',
    delete: '/api/v1/permissoes/',
  },
  plano_aula: {
    list: '/api/v1/planos-aulas/',
    post: '/api/v1/planos-aulas',
    get_by_id: '/api/v1/planos-aulas/',
    update: '/api/v1/planos-aulas/',
    delete: '/api/v1/planos-aulas/',
  },
  plano_intervencao: {
    list: '/api/v1/planos-intervencao/',
    post: '/api/v1/planos-intervencao/',
    get_by_id: '/api/v1/planos-intervencao/',
    update: '/api/v1/planos-intervencao/',
    delete: '/api/v1/planos-intervencao/',
  },
  registro_aprendizagem: {
    list: '/api/v1/registros-aprendizagens/',
    post: '/api/v1/registros-aprendizagens',
    get_by_id: '/api/v1/registros-aprendizagens/',
    update: '/api/v1/registros-aprendizagens/',
    delete: '/api/v1/registros-aprendizagens/',
    delete_by_filter: '/api/v1/registros-aprendizagens/byFilters/',
    diagnostico: {
      post: '/api/v1/registros-aprendizagens/avaliacao-diagnostico/',
      list: '/api/v1/registros-aprendizagens/avaliacao-diagnostico',
      idsTurmaList: '/api/v1/registros-aprendizagens/avaliacao-diagnostico/turmas-ids',
      get_by_id: '/api/v1/registros-aprendizagens/avaliacao-diagnostico/',
      update: '/api/v1/registros-aprendizagens/avaliacao-diagnostico/',
      delete: '/api/v1/registros-aprendizagens/avaliacao-diagnostico/',
    },
    fase: {
      post: '/api/v1/registros-aprendizagens/avaliacao-fase/',
      list: '/api/v1/registros-aprendizagens/avaliacao-fase',
      idsTurmaList: '/api/v1/registros-aprendizagens/avaliacao-fase/turmas-ids',
      get_by_id: '/api/v1/registros-aprendizagens/avaliacao-fase/',
      update: '/api/v1/registros-aprendizagens/avaliacao-fase/',
      delete: '/api/v1/registros-aprendizagens/avaliacao-fase/',
    },
  },
  turma: {
    list: '/api/v1/turmas/',
    post: '/api/v1/turmas/',
    get_by_id: '/api/v1/turmas/',
    update: '/api/v1/turmas/',
    delete: '/api/v1/turmas/',
  },
  user: {
    list: '/api/v1/usuarios/',
    post: '/api/v1/usuarios/',
    get_by_id: '/api/v1/usuarios/',
    update: '/api/v1/usuarios/',
    delete: '/api/v1/usuarios/',
  },
  zona: {
    list: '/api/v1/zonas/',
    post: '/api/v1/zonas/',
    get_by_id: '/api/v1/zonas/',
    update: '/api/v1/zonas/',
    delete: '/api/v1/zonas/',
  },
  profissional: {
    list: '/api/v1/profissionais/',
    post: '/api/v1/profissionais',
    get_by_id: '/api/v1/profissionais/',
    update: '/api/v1/profissionais/',
    delete: '/api/v1/profissionais/',
  }
};
