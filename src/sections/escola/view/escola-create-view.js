'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import EscolaNewEditForm from '../escola-new-edit-form';

// ----------------------------------------------------------------------

export default function EscolaCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Criar nova escola"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Escolas',
            href: paths.dashboard.escola.root,
          },
          { name: 'Nova escola' },
        ]}
        youtubeLink="https://www.youtube.com/embed/PRtd9syb-8k?si=IB5qYTX-wHmM2ZQ5&cc_load_policy=1"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <EscolaNewEditForm />
    </Container>
  );
}
