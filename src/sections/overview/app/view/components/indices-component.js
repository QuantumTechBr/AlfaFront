'use client';

import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import AppIndiceAprovacao from '../../app-indice-aprovacao';
import AppIndiceFases from '../../app-indice-fases';
import { Box } from '@mui/system';
import Typography from '@mui/material/Typography';
import { RegistroAprendizagemFases, RegistroAprendizagemFasesColors } from 'src/_mock';
import { slugify } from 'src/utils/functions';

export default function IndicesComponent({
  ano_escolar,
  indice_fases,
  indice_aprovacao,
  ...other
}) {
  let titulo_completo = ano_escolar;
  if (typeof ano_escolar === 'number') {
    titulo_completo += `º ano`;
  }
  const title_indice_fases = `Índice de Fases - ${titulo_completo}`;
  const title_indice_aprovacao = `Índice de aprovação - ${titulo_completo}`;

  const total_estudantes = indice_fases.chart.series.reduce((total, item) => total + item.value, 0);

  const getFasesEmLinha = () => {
    return Object.entries(RegistroAprendizagemFases).map(([key, value]) => {
      return (
        <Grid
          key={`indice_fases_container_item_${slugify(title_indice_aprovacao)}_${key}`}
          flexGrow={1}
        >
          <Box
            px={1.5}
            py={0.5}
            sx={{
              bgcolor: RegistroAprendizagemFasesColors[key],
            }}
            textAlign={'center'}
          >
            <Typography variant="subtitle2" color={`white`}>
              {value}
            </Typography>
          </Box>
          <Box px={2} py={0.5} textAlign={'center'}>
            <Typography variant="body2">
              {indice_fases.chart.series.find((item) => item.label == value).value}
            </Typography>
          </Box>
        </Grid>
      );
    });
  };

  return (
    <Box width="100%" mb={7}>
      <Stack
        flexGrow={1}
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        width="100%"
      >
        <Grid xs={12} md={6} lg={7}>
          <AppIndiceFases
            key={`indice_fases_${slugify(title_indice_fases)}`}
            title={title_indice_fases}
            chart={indice_fases.chart ?? { series: [] }}
          />
        </Grid>
        <Grid xs={12} md={6} lg={5}>
          <AppIndiceAprovacao
            key={`indice_fases_${slugify(title_indice_aprovacao)}`}
            title={title_indice_aprovacao}
            series={
              indice_aprovacao.hasSeries
                ? (indice_aprovacao.categories ?? [{ series: [] }])[0].series
                : []
            }
          />
        </Grid>
      </Stack>

      <Grid
        key={`indice_fases_container_row_grid_${slugify(title_indice_aprovacao)}`}
        container
        mx={3}
        mb={2}
        flexGrow={1}
        sx={{
          bgcolor: 'grey.200',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Grid>
          <Box px={1.5} py={0.5} textAlign={'center'}>
            <Typography variant="subtitle2">ANO DE ENSINO</Typography>
          </Box>
          <Box px={2} py={0.5} textAlign={'center'}>
            <Typography variant="body2">{titulo_completo}</Typography>
          </Box>
        </Grid>
        <Grid>
          <Box px={1.5} py={0.5} textAlign={'center'}>
            <Typography variant="subtitle2">TOTAL DE ESTUDANTES</Typography>
          </Box>
          <Box px={2} py={0.5} textAlign={'center'}>
            <Typography variant="body2">{total_estudantes}</Typography>
          </Box>
        </Grid>

        {getFasesEmLinha()}
      </Grid>
    </Box>
  );
}

IndicesComponent.propTypes = {
  ano_escolar: PropTypes.any,
  indice_fases: PropTypes.object,
  indice_aprovacao: PropTypes.object,
};
