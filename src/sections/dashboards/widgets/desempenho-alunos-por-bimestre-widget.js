import { Card, CardHeader, Box, MenuItem, ButtonBase } from '@mui/material';
import _ from 'lodash';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import DesempenhoAlunosWidget from '../components/desempenho-alunos-widget';

export default function DesempenhoAlunosPorBimestreWidget({ desempenhoAlunos, getTotalEstudandes }) {
  const popover = usePopover();

  const chart = desempenhoAlunos.chart ?? {};
  const series = chart?.series;
  const { categories: bimestres, series: chartSeries } = chart;
  let seriesYearData = '';
  if (chartSeries?.length) {
    const _lastYear = _.last(chartSeries)?.year;
    seriesYearData = `${_lastYear}`;
  }

  if (chart === undefined) {
    return <>Carregando...</>;
  }

  if (!chartSeries?.length) {
    return <>Sem dados para exibir.</>;
  }

  let chartBimestres = [
    { categories: ['1-BIMESTRE'], series: [] },
    { categories: ['2-BIMESTRE'], series: [] },
    { categories: ['3-BIMESTRE'], series: [] },
    { categories: ['4-BIMESTRE'], series: [] },
  ];

  for (let b = 0; b < bimestres.length; b++) {
    let serie = [];
    for (let s = 0; s < series.length; s++) {
      serie[s] = { year: '', data: [] };
      serie[s].year = series[s].year;
      let data = [];
      for (let d = 0; d < series[s].data.length; d++) {
        if (series[s].data[d]?.data[b]) {
          data.push({
            data: [series[s].data[d]?.data[b]],
            name: series[s].data[d]?.name,
          });
        }
      }
      if (data.length > 0) {
        let avaliadosCount = 0;
        data.map((item) => {
          if (item.name === 'Não Avaliado') {
            item.data[0] = getTotalEstudandes() - avaliadosCount;
            if (item.data[0] < 0) item.data[0] = 0;
          } else {
            avaliadosCount += item.data[0];
          }
        });
        serie[s].data = data;
        chartBimestres[b].series.push(serie[s]);
      }
    }
  }

  return (
    <>
      <Card sx={{ paddingBottom: 3 }}>
        <CardHeader
          title="Desempenho dos Estudantes - Fases do Desenvolvimento da Leitura e da Escrita"
          subheader={desempenhoAlunos.subheader ?? ''}
          action={
            <ButtonBase
              onClick={popover.onOpen}
              sx={{
                pl: 1,
                py: 0.5,
                pr: 0.5,
                borderRadius: 1,
                typography: 'subtitle2',
                bgcolor: 'background.neutral',
              }}
            >
              {seriesYearData}
              <Iconify
                width={16}
                icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                sx={{ ml: 0.5 }}
              />
            </ButtonBase>
          }
        />
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          {chartBimestres[0].series.length > 0 && <DesempenhoAlunosWidget chart={chartBimestres[0]} />}
          {chartBimestres[1].series.length > 0 && <DesempenhoAlunosWidget chart={chartBimestres[1]} />}
          {chartBimestres[2].series.length > 0 && <DesempenhoAlunosWidget chart={chartBimestres[2]} />}
          {chartBimestres[3].series.length > 0 && <DesempenhoAlunosWidget chart={chartBimestres[3]} />}
        </Box>
      </Card>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 77 }}>
        {series.map((option) => (
          <MenuItem
            key={option.year}
            selected={option.year === seriesYearData}
            onClick={popover.onClose}
          >
            {option.year}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
