'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import PlanoIntervencaoNewEditForm from '../plano-intervencao-new-edit-form';

// ----------------------------------------------------------------------

export default function PlanoIntervencaoCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Criar novo plano de intervenção"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Plano de Intervenção',
            href: paths.dashboard.plano_intervencao.root,
          },
          { name: 'Novo plano de intervenção' },
        ]}
        youtubeLink="https://www.youtube.com/embed/bf9xNpG2NZ4?si=P0prPKwf74aOXPf8&cc_load_policy=1"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PlanoIntervencaoNewEditForm />
    </Container>
  );
}
