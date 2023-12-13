import { useMemo, useContext } from 'react';
import { AuthContext } from 'src/auth/context/alfa';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
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

  let items = [];

  if (user?.permissao_usuario[0]?.nome == 'SUPERADMIN') {
    items = [
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
        title: 'Lista de Alunos',
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
          { title: t('documentos de intervenção'), path: paths.dashboard.documento_turma },
          // { title: t('frequência'), path: paths.dashboard.blank },
          // { title: t('atividades pedagógicas'), path: paths.dashboard.blank },
          // { title: 'Planos de Aulas', path: paths.dashboard.blank },
        ],
      },

      // AVALIAÇÕES
      { 
        title: t('avaliações'), 
        path: paths.dashboard.registro_aprendizagem.root,
        icon: ICONS.alfaBookAccount,
        children: [
          {
            title: t('Dianóstico'), 
            path: paths.dashboard.registro_aprendizagem.root_diagnostico, 
          },
          {
            title: t('Fase'), 
            path: paths.dashboard.registro_aprendizagem.root_fase, 
          },
          {
            title: t('Componente'), 
            path: paths.dashboard.registro_aprendizagem.root_componente, 
          }
        ]
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
        title: t('Documento'),
        path: paths.dashboard.documento,
        icon: ICONS.folder,
      },

    ]
  } else {
    try {
      let modulosPermitidos = user?.permissao_usuario[0]?.permissao_modulo.map(permissaoModulo => {
        if (permissaoModulo.cadastrar || permissaoModulo.editar || permissaoModulo.deletar) {
          return permissaoModulo.modulo?.namespace;
        }
      });

      modulosPermitidos ??= [];

      items.push({
        title: t('home (dashboard)'),
        path: paths.dashboard.root,
        icon: ICONS.alfaHome,
      });
      if (user?.permissao_usuario[0]?.nome == 'ADMIN') {
        items.push({
          title: 'Gerenciamento de Usuários',
          path: paths.dashboard.user.list,
          icon: ICONS.alfaUserProfile,
          children: [
            { title: t('usuários'), path: paths.dashboard.user.list },
          ],
        });
      }

      if (modulosPermitidos.includes("usuario")) {
        items.push({
          title: 'Profissionais da Educação',
          path: paths.dashboard.profissional.list,
          icon: ICONS.alfaClipboardAccount,
        })
      }
      if (modulosPermitidos.includes("aluno")) {
        items.push({
          title: 'Lista de Alunos',
          path: paths.dashboard.aluno.list,
          icon: ICONS.alfaStudent,
        })
      }
      if (modulosPermitidos.includes("ano_letivo")) {
        items.push({
          title: 'Lista de Anos Letivos',
          path: paths.dashboard.calendar,
          icon: ICONS.alfaCalendar,
          children: [
            { title: t('calendário'), path: paths.dashboard.calendar },
          ],
        })
      }
      if (modulosPermitidos.includes("turma")) {
        items.push({
          title: 'Turmas',
          path: paths.dashboard.turma.list,
          icon: ICONS.alfaBookAccount,
          children: [
            { title: t('lista de turmas'), path: paths.dashboard.turma.list },
            { title: t('documentos de intervenção'), path: paths.dashboard.documento_turma }
          ],
        });
      }
      if (modulosPermitidos.includes("registro_aprendizagem")) {
        items.push({ 
          title: t('avaliações'), 
          path: paths.dashboard.registro_aprendizagem.root,
          icon: ICONS.alfaBookAccount,
          children: [
            {
              title: t('Dianóstico'), 
              path: paths.dashboard.registro_aprendizagem.root_diagnostico, 
            },
            {
              title: t('Fase'), 
              path: paths.dashboard.registro_aprendizagem.root_fase, 
            },
            {
              title: t('Componente'), 
              path: paths.dashboard.registro_aprendizagem.root_componente, 
            }
          ]
        });
      }

      const redesEnsinoModuloChildren = [];
      if (modulosPermitidos.includes("zonas")) {
        redesEnsinoModuloChildren.push({ title: 'Lista de DDZ', path: paths.dashboard.zona.list });
      }
      if (modulosPermitidos.includes("escola")) {
        redesEnsinoModuloChildren.push({ title: 'Lista de Escolas', path: paths.dashboard.escola.list },);
      }
      if (redesEnsinoModuloChildren.length){
        items.push({
          title: 'Redes de Ensino',
          path: paths.dashboard.zona.list,
          icon: ICONS.alfaBuilding,
          children: redesEnsinoModuloChildren,
        })
      }

      if (modulosPermitidos.includes("documentos")) {
        items.push({
          title: t('Documento'),
          path: paths.dashboard.documento,
          icon: ICONS.folder,
        });
      }
  
    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  const data = useMemo(
    () => [
      // MENU
      // ----------------------------------------------------------------------
      {
        subheader: t('menu'),
        items,
      },
    ],
    [t]
  );

  return data;
}
