'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import AlunoNewEditForm from '../aluno-new-edit-form';

// ----------------------------------------------------------------------

export default function AlunoCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Criar novo estudante"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Estudante',
            href: paths.dashboard.aluno.root,
          },
          { name: 'Novo estudante' },
        ]}
        youtubeLink="https://www.youtube.com/embed/t2u3ADfdphA?si=qjP95vxnIGKoye-x&cc_load_policy=1"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <AlunoNewEditForm />
    </Container>
  );
}
