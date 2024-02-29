import { useMemo, useContext } from 'react';
// auth
import { AuthContext } from 'src/auth/context/alfa';
import { useAuthContext } from 'src/auth/hooks';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  alfaBookAccount: icon('ic_alfa_book_account'),
  alfaBuilding: icon('ic_alfa_building'),
  alfaCalendar: icon('ic_alfa_calendar'),
  alfaClipboardAccount: icon('ic_alfa_clipboard_account'),
  alfaHome: icon('ic_alfa_home'),
  alfaUserProfile: icon('ic_alfa_user_profile'),
  alfaStudent: icon('ic_alfa_student'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();
  const { user } = useContext(AuthContext);
  const { checkPermissaoModulo } = useAuthContext();

  const items = useMemo(() => {
    let _items = [];
    if (user?.permissao_usuario[0]?.nome == 'SUPERADMIN') {
      _items = [
        {
          title: t('home (dashboard)'),
          path: paths.dashboard.root,
          icon: ICONS.alfaHome,
        },
        // USER
        {
          title: 'Gerenciamento de Usuários',
          path: paths.dashboard.user.list,
          icon: ICONS.alfaUserProfile,
          children: [
            // { title: 'Perfis e Permissões', path: paths.dashboard.blank },
            { title: t('usuários'), path: paths.dashboard.user.list },
          ],
        },

        // PROFISSIONAIS
        {
          title: 'Profissionais da Educação',
          path: paths.dashboard.profissional.list,
          icon: ICONS.alfaClipboardAccount,
        },

        // ALUNOS
        {
          title: 'Lista de Estudantes',
          path: paths.dashboard.aluno.list,
          icon: ICONS.alfaStudent,
        },

        // ANOS
        {
          title: 'Lista de Anos Letivos',
          path: paths.dashboard.calendar,
          icon: ICONS.alfaCalendar,
          children: [
            { title: t('calendário'), path: paths.dashboard.calendar },
            // { title: t('gerar relatório'), path: paths.dashboard.blank },
            // { title: t('documentos administrativos'), path: paths.dashboard.blank },
          ],
        },

        // TURMAS
        {
          title: 'Turmas',
          path: paths.dashboard.turma.list,
          icon: ICONS.alfaBookAccount,
          children: [
            { title: t('lista de turmas'), path: paths.dashboard.turma.list },
            // { title: t('frequência'), path: paths.dashboard.blank },
            // { title: t('atividades pedagógicas'), path: paths.dashboard.blank },
            // { title: 'Planos de Aulas', path: paths.dashboard.blank },
          ],
        },

        // AVALIAÇÕES
        {
          title: t('avaliações'),
          path: paths.dashboard.registro_aprendizagem.root_diagnostico,
          icon: ICONS.alfaBookAccount,
          children: [
            {
              title: t('Diagnóstica'),
              path: paths.dashboard.registro_aprendizagem.root_diagnostico,
            },
            {
              title: t('Fase'),
              path: paths.dashboard.registro_aprendizagem.root_fase,
            },
            {
              title: t('Componente'),
              path: paths.dashboard.registro_aprendizagem.root_componente,
            },
          ],
        },

        // Redes de Ensino
        {
          title: 'Redes de Ensino',
          path: paths.dashboard.zona.list,
          icon: ICONS.alfaBuilding,
          children: [
            { title: 'Lista de DDZ', path: paths.dashboard.zona.list },
            { title: 'Lista de Escolas', path: paths.dashboard.escola.list },
          ],
        },

        // FILE MANAGER
        {
          title: t('Documentos Administrativos'),
          path: paths.dashboard.documento,
          icon: ICONS.folder,
        },

        // Plano de Intervenção
        {
          title: t('Plano de Intervenção'),
          path: paths.dashboard.plano_intervencao.list,
          icon: ICONS.folder,
        },
      ];
    } else {
      try {
        let modulosPermitidos = [];
        if(user?.permissao_usuario[0]?.permissao_modulo){
          modulosPermitidos = user?.permissao_usuario[0]?.permissao_modulo.map(
            (permissaoModulo) => {
              if (permissaoModulo.cadastrar || permissaoModulo.editar || permissaoModulo.deletar) {
                return permissaoModulo.modulo?.namespace;
              }
            }
          );
        }

        _items.push({
          title: t('home (dashboard)'),
          path: paths.dashboard.root,
          icon: ICONS.alfaHome,
        });
        if (user?.permissao_usuario[0]?.nome == 'ADMIN') {
          _items.push({
            title: 'Gerenciamento de Usuários',
            path: paths.dashboard.user.list,
            icon: ICONS.alfaUserProfile,
            children: [{ title: t('usuários'), path: paths.dashboard.user.list }],
          });
        }

        if (checkPermissaoModulo('profissionais', 'acesso')) {
          _items.push({
            title: 'Profissionais da Educação',
            path: paths.dashboard.profissional.list,
            icon: ICONS.alfaClipboardAccount,
          });
        }
        if (checkPermissaoModulo('aluno', 'acesso')) {
          _items.push({
            title: 'Lista de Estudantes',
            path: paths.dashboard.aluno.list,
            icon: ICONS.alfaStudent,
          });
        }

        if (checkPermissaoModulo('calendario', 'acesso')) {
          _items.push({
            title: 'Lista de Anos Letivos',
            path: paths.dashboard.calendar,
            icon: ICONS.alfaCalendar,
            children: [{ title: t('calendário'), path: paths.dashboard.calendar }],
          });
        }

        const turmaModuloChildren = [];

        if (checkPermissaoModulo('turma', 'acesso')) {
          turmaModuloChildren.push({ title: 'Lista de Turmas', path: paths.dashboard.turma.list });
        }
        if (turmaModuloChildren.length) {
          _items.push({
            title: 'Turmas',
            path: paths.dashboard.turma.list,
            icon: ICONS.alfaBookAccount,
            children: turmaModuloChildren,
          });
        }

        if (checkPermissaoModulo('registro_aprendizagem', 'acesso')) {
          _items.push({
            title: t('avaliações'),
            path: paths.dashboard.registro_aprendizagem.root,
            icon: ICONS.alfaBookAccount,
            children: [
              {
                title: t('Diagnóstica'),
                path: paths.dashboard.registro_aprendizagem.root_diagnostico,
              },
              {
                title: t('Fase'),
                path: paths.dashboard.registro_aprendizagem.root_fase,
              },
              {
                title: t('Componente'),
                path: paths.dashboard.registro_aprendizagem.root_componente,
              },
            ],
          });
        }

        const redesEnsinoModuloChildren = [];

        if (checkPermissaoModulo('zonas', 'acesso')) {
          redesEnsinoModuloChildren.push({
            title: 'Lista de DDZ',
            path: paths.dashboard.zona.list,
          });
        }
        if (checkPermissaoModulo('escola', 'acesso')) {
          redesEnsinoModuloChildren.push({
            title: 'Lista de Escolas',
            path: paths.dashboard.escola.list,
          });
        }
        if (redesEnsinoModuloChildren.length) {
          _items.push({
            title: 'Redes de Ensino',
            path: paths.dashboard.zona.list,
            icon: ICONS.alfaBuilding,
            children: redesEnsinoModuloChildren,
          });
        }

        if (checkPermissaoModulo('documentos', 'acesso')) {
          _items.push({
            title: t('Documentos Administrativos'),
            path: paths.dashboard.documento,
            icon: ICONS.folder,
          });
        }

        if (checkPermissaoModulo('plano_intervencao', 'acesso')) {
          _items.push({
            title: t('Plano de Intervenção'),
            path: paths.dashboard.plano_intervencao.list,
            icon: ICONS.folder,
          });
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    }

    return _items;
  }, [user, checkPermissaoModulo, t]);

  const data = useMemo(
    () => [
      // MENU
      // ----------------------------------------------------------------------
      {
        // subheader: t('menu'),
        items: items,
      },
    ],
    [t, items]
  );

  return data;
}
