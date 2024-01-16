'use client';

import PropTypes from 'prop-types';
import Grid from '@mui/material/Unstable_Grid2';
import { _dashboardSeries } from 'src/_mock';

import { Box, Stack } from '@mui/material';
import { slugify } from 'src/utils/functions';

import GraficoHorizontalChart from '../components/grafico-horizontal-chart';
import IndiceAlfabetizacaoComponent from '../components/indice-alfabetizacao-component';

export default function IndicesCompostosAlfabetizacaoGeralWidget({
  title,
  indice_alfabetizacao,
  indice_alfabetizacao_geral,
}) {
  const title_indice_alfabetizacao = `Índice de alfabetização - ${title}`;
  const title_indice_alfabetizacao_geral = `Índice de alfabetização geral`;

  return (
    <Box width="100%" mb={7}>
      <Stack direction="row">
        <Grid xs={12} lg={7} xl={8}>
          <GraficoHorizontalChart
            title={title_indice_alfabetizacao}
            chart={indice_alfabetizacao.chart ?? { series: _dashboardSeries }}
          />
        </Grid>

        <Grid xs={12} lg={5} xl={4}>
          <IndiceAlfabetizacaoComponent
            key={`indice_alfabetizacao_geral_component_${slugify(
              title_indice_alfabetizacao_geral
            )}`}
            title={title_indice_alfabetizacao_geral}
            indice_alfabetizacao_geral={
              indice_alfabetizacao_geral.hasSeries
                ? (indice_alfabetizacao_geral.categories ?? [{ series: [] }])[0].series
                : []
            }
          />
        </Grid>
      </Stack>
    </Box>
  );
}

IndicesCompostosAlfabetizacaoGeralWidget.propTypes = {
  title: PropTypes.string,
  indice_alfabetizacao: PropTypes.object,
  indice_alfabetizacao_geral: PropTypes.object,
};
