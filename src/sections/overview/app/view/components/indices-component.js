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
  bimestres,
  selectedBimestre,
  onChangeBimestre,
  ...other
}) {
  let titulo_completo = ano_escolar;
  if (typeof ano_escolar === 'number') {
    titulo_completo += `º ano`;
  }
  const title_indice_fases = `Índice de Fases - ${titulo_completo}`;
  const title_indice_aprovacao = `Índice de alfabetização - ${titulo_completo}`;

  const total_estudantes = indice_fases.chart.series.reduce((total, item) => total + item.value, 0);

  const getFasesEmLinha = () => {
    return Object.entries(RegistroAprendizagemFases).map(([key, value]) => {
      return (
        <Grid
          key={`indice_fases_container_item_${slugify(title_indice_aprovacao)}_${key}`}
          flexGrow={1}
          flexBasis={0}
        >
          <Box
            minHeight={52}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            textAlign={'center'}
            sx={{
              bgcolor: RegistroAprendizagemFasesColors[key],
            }}
          >
            <Typography px={0.5} py={0.5} variant="subtitle2" color="white">
              {value}
            </Typography>
          </Box>
          <Box px={0} py={0.5} textAlign={'center'}>
            <Typography variant="body2">
              {indice_fases.chart.series.find((item) => item.label == value).value}
            </Typography>
          </Box>
        </Grid>
      );
    });
  };

  const visaoGeral = (
    <Grid
      key={`indice_fases_container_row_grid_${slugify(title_indice_aprovacao)}`}
      container
      mx={0}
      mb={2}
      mt={-2}
      pt={4}
      flexGrow={1}
      flexWrap="nowrap"
      spacing={0}
      sx={{
        bgcolor: 'grey.200',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Grid flexBasis={0} flexGrow={1}>
        <Box
          minHeight={52}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          textAlign={'center'}
        >
          <Typography px={0} py={0.5} variant="subtitle2">
            ANO DE ENSINO
          </Typography>
        </Box>
        <Box px={2} py={0.5} textAlign={'center'}>
          <Typography variant="body2">{titulo_completo}</Typography>
        </Box>
      </Grid>
      <Grid flexGrow={1} flexBasis={0}>
        <Box
          minHeight={52}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          textAlign={'center'}
        >
          <Typography px={0} py={0.5} variant="subtitle2">
            TOTAL DE ESTUDANTES
          </Typography>
        </Box>
        <Box px={2} py={0.5} textAlign={'center'}>
          <Typography variant="body2">{total_estudantes}</Typography>
        </Box>
      </Grid>

      {getFasesEmLinha()}
    </Grid>
  );
  return (
    <Box width="100%" mb={7}>
      <Stack direction="row">
        <Grid xs={12} sm={12} md={12} lg={7} xl={8}>
          <AppIndiceFases
            key={`indice_fases_${slugify(title_indice_fases)}`}
            title={title_indice_fases}
            chart={indice_fases.chart ?? { series: [] }}
            bimestres={bimestres}
            selectedBimestre={selectedBimestre}
            onChangeBimestre={onChangeBimestre}
          />
          {visaoGeral}
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={5} xl={4}>
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
    </Box>
  );
}

IndicesComponent.propTypes = {
  ano_escolar: PropTypes.any,
  indice_fases: PropTypes.object,
  indice_aprovacao: PropTypes.object,
};
