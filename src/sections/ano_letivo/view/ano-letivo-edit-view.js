'use client';

import { useEffect, useState, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';

import AnoLetivoNewEditForm from '../ano-letivo-new-edit-form';

// ----------------------------------------------------------------------

export default function AnoLetivoEditView({ id }) {
  const settings = useSettingsContext();

  const [errorMsg, setErrorMsg] = useState('');
  const [currentAnoLetivo, setCurrentAnoLetivo] = useState(null);
  const [currentBimestres, setCurrentBimestres] = useState([]);

  const { buscaAnoLetivo, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { buscaBimestres } = useContext(BimestresContext);

  useEffect(() => {
    Promise.all([
      buscaAnoLetivo(id),
      buscaBimestres(id, true),
    ]).then(([anoLetivo, bimestres]) => {
      setCurrentAnoLetivo(anoLetivo);
      // Ordenar por ordinal para garantir 1º→4º
      setCurrentBimestres([...bimestres].sort((a, b) => a.ordinal - b.ordinal));
    }).catch(() => {
      setErrorMsg('Erro de comunicação com a API');
    });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const afterSave = useCallback(() => {
    buscaAnosLetivos({ force: true });
    buscaBimestres(id, true).then((bimestres) => {
      setCurrentBimestres([...bimestres].sort((a, b) => a.ordinal - b.ordinal));
    });
  }, [id, buscaAnosLetivos, buscaBimestres]);

  const nomeBreadcrumb = currentAnoLetivo?.ano ?? '...';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar Ano Letivo"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Anos Letivos', href: paths.dashboard.ano_letivo.list },
          { name: String(nomeBreadcrumb) },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {!!errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

      <AnoLetivoNewEditForm
        currentAnoLetivo={currentAnoLetivo}
        currentBimestres={currentBimestres}
        afterSave={afterSave}
      />
    </Container>
  );
}

AnoLetivoEditView.propTypes = {
  id: PropTypes.string,
};
