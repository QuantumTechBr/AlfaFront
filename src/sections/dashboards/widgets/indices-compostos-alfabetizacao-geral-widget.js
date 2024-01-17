'use client';

import PropTypes from 'prop-types';
import Grid from '@mui/material/Unstable_Grid2';

import { Box, Stack } from '@mui/material';
import { slugify } from 'src/utils/functions';

import GraficoHorizontalChart from '../components/grafico-horizontal-chart';
import IndiceAlfabetizacaoComponent from '../components/indice-alfabetizacao-component';
import { random } from 'lodash';

export default function IndicesCompostosAlfabetizacaoGeralWidget({
  title,
  indice_alfabetizacao,
  indice_alfabetizacao_geral,
}) {
  const title_indice_alfabetizacao = `Índice de alfabetização ${title}`;
  const title_indice_alfabetizacao_geral = `Índice de alfabetização geral`;

  return (
    <Box width="100%" mb={0}>
      <Stack direction="row">
        <Grid xs={12} lg={7} xl={8}>
          {indice_alfabetizacao.length && (
            <GraficoHorizontalChart
              title={title_indice_alfabetizacao}
              height={418}
              chart={{
                series: indice_alfabetizacao.map((ia) => {
                  return {
                    x: ia.title,
                    y: ia.indice_alfabetizacao,
                    alfabetizados: ia.alfabetizados,
                    goals: [
                      {
                        name: 'Meta',
                        value: random(90, 100, false),
                        strokeWidth: 3,
                        strokeDashArray: 0,
                        strokeColor: '#775DD0',
                      },
                    ],
                  };
                }),
              }}
            />
          )}
        </Grid>

        <Grid xs={12} lg={5} xl={4}>
          <IndiceAlfabetizacaoComponent
            key={`indice_alfabetizacao_geral_component_${slugify(
              title_indice_alfabetizacao_geral
            )}`}
            title={title_indice_alfabetizacao_geral}
            indice_alfabetizacao={
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
  indice_alfabetizacao: PropTypes.array,
  indice_alfabetizacao_geral: PropTypes.object,
};
