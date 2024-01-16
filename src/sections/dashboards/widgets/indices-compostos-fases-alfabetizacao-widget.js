'use client';

import PropTypes from 'prop-types';
import Grid from '@mui/material/Unstable_Grid2';

import { Box, Stack } from '@mui/material';
import { slugify } from 'src/utils/functions';

import IndiceFasesComponent from '../components/indice-fases-component';
import IndiceAlfabetizacaoComponent from '../components/indice-alfabetizacao-component';

export default function IndicesCompostosFasesAlfabetizacaoWidget({ ano_escolar, indice_fases, indice_alfabetizacao }) {
  let titulo_completo = ano_escolar;
  if (typeof ano_escolar === 'number') {
    titulo_completo += `º ano`;
  }
  const title_indice_fases = `Índice de fases - ${titulo_completo}`;
  const title_indice_alfabetizacao = `Índice de alfabetização - ${titulo_completo}`;

  return (
    <Box width="100%" mb={7}>
      <Stack direction="row">
        <Grid xs={12} lg={7} xl={8}>
          <IndiceFasesComponent
            key={`indice_fases_component_${slugify(title_indice_fases)}`}
            title_indice_fases={title_indice_fases}
            indice_fases={indice_fases}
          />
        </Grid>

        <Grid xs={12} lg={5} xl={4}>
          <IndiceAlfabetizacaoComponent
            key={`indice_alfabetizacao_component_${slugify(title_indice_alfabetizacao)}`}
            title={title_indice_alfabetizacao}
            indice_alfabetizacao={
              indice_alfabetizacao.hasSeries
                ? (indice_alfabetizacao.categories ?? [{ series: [] }])[0].series
                : []
            }
          />
        </Grid>
      </Stack>
    </Box>
  );
}

IndicesCompostosFasesAlfabetizacaoWidget.propTypes = {
  ano_escolar: PropTypes.any,
  indice_fases: PropTypes.object,
  indice_alfabetizacao: PropTypes.object,
};
