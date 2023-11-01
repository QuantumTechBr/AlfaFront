'use client';

import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import AppIndiceAprovacao from '../../app-indice-aprovacao';
import AppIndiceFases from '../../app-indice-fases';

export default function IndicesComponent({
  title_indice_fases,
  title_indice_aprovacao,
  indice_fases,
  indice_aprovacao,
  ...other
}) {
  return (
    <Stack
      flexGrow={1}
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
      width="100%"
    >
      <Grid xs={12} md={6} lg={7}>
        <AppIndiceFases
          title={title_indice_fases}
          chart={indice_fases.chart ?? { series: [] }}
        />
      </Grid>
      <Grid xs={12} md={6} lg={5}>
        <AppIndiceAprovacao
          title={title_indice_aprovacao}
          series={
            indice_aprovacao.hasSeries
              ? (indice_aprovacao.categories ?? [{ series: [] }])[0].series
              : []
          }
        />
      </Grid>
    </Stack>
  );
}

IndicesComponent.propTypes = {
  title_indice_fases: PropTypes.string,
  title_indice_aprovacao: PropTypes.string,
  indice_fases: PropTypes.object,
  indice_aprovacao: PropTypes.object,
};
