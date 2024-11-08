'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
 import ZonaNewEditForm from '../zona-new-edit-form';

// ----------------------------------------------------------------------

export default function ZonaCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Criar nova zona"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Zonas',
            href: paths.dashboard.zona.root,
          },
          { name: 'Nova zona' },
        ]}
        youtubeLink="https://www.youtube.com/embed/h7_iVqBN6dM?si=NgoMolmmWPmBlyOW"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ZonaNewEditForm />
    </Container>
  );
}
