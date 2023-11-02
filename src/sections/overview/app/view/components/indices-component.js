'use client';

import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import AppIndiceAprovacao from '../../app-indice-aprovacao';
import AppIndiceFases from '../../app-indice-fases';
import { Box } from '@mui/system';
import Typography from '@mui/material/Typography';

export default function IndicesComponent({
  ano_ensino,
  indice_fases,
  indice_aprovacao,
  ...other
}) {
    const title_indice_fases = `Índice de Fases - ${ano_ensino}`;
    const title_indice_aprovacao = `Índice de aprovação - ${ano_ensino}`;

    const total_estudantes = indice_fases.chart.series.reduce((total, item) => total + item.amount, 0);


    return (
    <Box width="100%">
      <Stack
        flexGrow={1}
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        width="100%"
      >
        <Grid xs={12} md={6} lg={7}>
          <AppIndiceFases title={title_indice_fases} chart={indice_fases.chart ?? { series: [] }} />
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

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        width="100%"
      >
        <Grid>
          <Typography variant="subtitle2">ANO DE ENSINO</Typography>
          <Typography variant="body2">{ano_ensino}</Typography>
        </Grid>
        <Grid>
          <Typography variant="subtitle2">TOTAL DE ESTUDANDES</Typography>
          <Typography variant="body2">{total_estudantes}</Typography>
        </Grid>
      </Stack>
    </Box>
  );
}

IndicesComponent.propTypes = {
  ano_ensino: PropTypes.string,
  indice_fases: PropTypes.object,
  indice_aprovacao: PropTypes.object,
};


