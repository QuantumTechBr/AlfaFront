'use client';

import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';

import { Box } from '@mui/system';

import { slugify } from 'src/utils/functions';

import IndiceFaseComponent from '../components/indice-fase-component';
import IndiceAprovacaoComponent from '../components/indice-aprovacao-component';

export default function IndicesCompostosFasesAlfabetizacaoWidget({ ano_escolar, indice_fases, indice_aprovacao }) {
  let titulo_completo = ano_escolar;
  if (typeof ano_escolar === 'number') {
    titulo_completo += `º ano`;
  }
  const title_indice_fases = `Índice de Fases - ${titulo_completo}`;
  const title_indice_aprovacao = `Índice de alfabetização - ${titulo_completo}`;

  return (
    <Box width="100%" mb={7}>
      <Stack direction="row">
        <Grid xs={12} lg={7} xl={8}>
          <IndiceFaseComponent
            key={`indice_fases_component_item_${slugify(title_indice_fases)}`}
            indice_fases={indice_fases}
            title_indice_fases={title_indice_fases}
          />
        </Grid>

        <Grid xs={12} lg={5} xl={4}>
          <IndiceAprovacaoComponent
            key={`indice_aprovacao_component_item_${slugify(title_indice_aprovacao)}`}
            title={title_indice_aprovacao}
            series={
              indice_aprovacao.hasSeries
                ? (indice_aprovacao.categories ?? [{ series: [] }])[0].series
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
  indice_aprovacao: PropTypes.object,
};
