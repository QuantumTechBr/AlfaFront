'use client';

import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';

import { Box } from '@mui/system';
import Typography from '@mui/material/Typography';
import { RegistroAprendizagemFases, RegistroAprendizagemFasesColors } from 'src/_mock';
import { slugify } from 'src/utils/functions';
import GraficoColunasChart from './grafico-colunas-chart';
import IndiceAprovacaoWidget from './indice-aprovacao-widget';
import { Card, LinearProgress } from '@mui/material';

export default function IndicesComponentWidget({
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
  const title_indice_aprovacao = `Índice de alfabetização - ${titulo_completo}`;

  const total_estudantes = indice_fases.chart.series.reduce((total, item) => total + item.value, 0);

  const getFasesEmLinha = () => {
    return Object.entries(RegistroAprendizagemFases).map(([key, value]) => {
      return (
        <Grid key={`indice_fases_container_item_${slugify(title_indice_aprovacao)}_${key}`} mb={0.2} px={5}>
          <Box textAlign={'center'}>
            <Typography
              mb={0}
              variant="subtitle2"
              lineHeight="1.05em"
              fontWeight={600}
              fontSize={13}
            >
              {value}
            </Typography>
          </Box>
          <Box textAlign={'center'}>
            <Typography variant="body2" fontSize={24} mb={0} fontWeight={800} lineHeight={1.4}>
              {indice_fases.chart.series.find((item) => item.label == value).value}
            </Typography>
          </Box>
          <LinearProgress
            value={
              (indice_fases.chart.series.find((item) => item.label == value).value /
                total_estudantes) *
              100
            }
            variant="determinate"
            color="inherit"
            sx={{
              height: 3,
              span: {
                backgroundColor: RegistroAprendizagemFasesColors[key],
              },
              '&::before': {
                bgcolor: 'divider',
                opacity: 1,
              },
            }}
          />
        </Grid>
      );
    });
  };

  const visaoGeral = (
    <Grid
    
      key={`indice_fases_container_row_grid_${slugify(title_indice_aprovacao)}`}
      container
      flexDirection={'column'} // todo < lg row
    >
      {getFasesEmLinha()}
    </Grid>
  );
  return (
    <Box width="100%" mb={7}>
      <Stack direction="row">
        <Grid xs={12} lg={7} xl={8}>
          <Card>
            <Grid container>
              <Grid xs={12} lg={10} xl>
                <GraficoColunasChart
                  key={`indice_fases_${slugify(title_indice_fases)}`}
                  title={title_indice_fases}
                  chart={indice_fases.chart ?? { series: [] }}
                />
              </Grid>

              <Grid xs={12} lg={2} xl={2}>
                {visaoGeral}
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid xs={12} lg={5} xl={4}>
          <IndiceAprovacaoWidget
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

IndicesComponentWidget.propTypes = {
  ano_escolar: PropTypes.any,
  indice_fases: PropTypes.object,
  indice_aprovacao: PropTypes.object,
};
