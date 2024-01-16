'use client';

import PropTypes from 'prop-types';
import Grid from '@mui/material/Unstable_Grid2';

import { Box } from '@mui/system';

import { slugify } from 'src/utils/functions';

import Typography from '@mui/material/Typography';
import { RegistroAprendizagemFases, RegistroAprendizagemFasesColors } from 'src/_mock';
import GraficoColunasChart from './grafico-colunas-chart';
import { Card, LinearProgress } from '@mui/material';

export default function IndiceFasesComponent({ title_indice_fases, indice_fases, ...other }) {
  const total_estudantes = indice_fases.chart.series.reduce((total, item) => total + item.value, 0);

  const getFasesEmLinha = () => {
    return Object.entries(RegistroAprendizagemFases).map(([key, value]) => {
      return (
        <Grid
          key={`indice_fases_component_container_${slugify(title_indice_fases)}_${key}`}
          mb={0.2}
          px={5}
        >
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
      key={`indice_fases_component_container_row_grid_${slugify(title_indice_fases)}`}
      container
      flexDirection={'column'} // todo < lg row
    >
      {getFasesEmLinha()}
    </Grid>
  );

  return (
    <Card>
      <Grid container>
        <Grid xs={12} lg={10} xl>
          <GraficoColunasChart
            title={title_indice_fases}
            chart={indice_fases.chart ?? { series: [] }}
          />
        </Grid>

        <Grid xs={12} lg={2} xl={2}>
          {visaoGeral}
        </Grid>
      </Grid>
    </Card>
  );
}

IndiceFasesComponent.propTypes = {
  title_indice_fases: PropTypes.string,
  indice_fases: PropTypes.object,
};
