'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ProfissionalNewEditForm from '../profissional-new-edit-form';

// ----------------------------------------------------------------------

export default function ProfissionalCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Criar novo profissional"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Profissionais',
            href: paths.dashboard.profissional.root,
          },
          { name: 'Novo Profissional' },
        ]}
        youtubeLink="https://www.youtube.com/embed/2tfCF7lzilw?si=WYiCrwjrMm_RbZbr"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProfissionalNewEditForm />
    </Container>
  );
}
