'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import TurmaNewEditForm from '../turma-new-edit-form';

// ----------------------------------------------------------------------

export default function TurmaCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Criar nova turma"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Turmas',
            href: paths.dashboard.turma.root,
          },
          { name: 'Nova turma' },
        ]}
        youtubeLink="https://www.youtube.com/embed/CbvIlF82Ogc?si=vCt_nMPhbfpKiJu4&cc_load_policy=1"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TurmaNewEditForm />
    </Container>
  );
}
