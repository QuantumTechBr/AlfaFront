import PropTypes from 'prop-types';

import { useCallback } from 'react';

// @mui
import { LinearProgress, Box, Stack, Typography, CardHeader } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// components
import Chart, { useChart } from 'src/components/chart';
import { RegistroAprendizagemFasesColors, anos_fase_adequada, fases_options } from 'src/_mock';
import _ from 'lodash';

// ----------------------------------------------------------------------

export default function GraficoIndiceFaseAnoColunasChart({
  title,
  subheader,
  chart,
  ano_escolar,
  total_avaliados,
  ...other
}) {
  const theme = useTheme();
  const { series, options, height = 345 } = chart;

  const totalItems = series.reduce((total, item) => total + item.value, 0);
  series.forEach((element) => {
    element.porcentagem = Math.round((element.value / totalItems) * 100);
  });

  const chartSeries = [
    {
      name: '',
      data: series.map((element) => element.porcentagem),
    },
  ];

  const chartOptions = useChart({
    chart: { toolbar: { show: true, offsetY: 7 } },
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        columnWidth: '89%',
        distributed: true, // CORES AUTOMATICAS E BOLINHAS
        borderRadius: 15,
        dataLabels: {
          position: 'top', // top, center, bottom
        },
      },
    },
    colors: Object.values(RegistroAprendizagemFasesColors),

    dataLabels: {
      enabled: true,
      formatter: (val) => {
        return `${val}%`;
      },
      dropShadow: {
        enabled: true,
        color: ['#000'],
      },
      style: {
        fontSize: '14px',
        colors: ['#fff'],
      },
    },
    xaxis: {
      categories: series.map((i) => i.label),
      labels: { show: true },
    },
    yaxis: {
      labels: { show: true },
      min: 0,
      max: 100,
    },

    tooltip: {
      enabled: true,
      followCursor: true,
      onDatasetHover: {
        highlightDataSeries: true,
      },
      y: {
        formatter: (value, opts) => {
          return series[opts.dataPointIndex]?.value ?? '-'; // TODO CHANGE TO opts SERIES opts.config.series
        },
        title: {
          formatter: (s) => 'Quantidade: ',
        },
      },
    },

    toolbar: {
      show: true,
      offsetX: 0,
      offsetY: 0,
      tools: {
        download: true,
        selection: true,
        zoom: false,
        pan: false,
        customIcons: [],
      },
      export: {
        csv: {
          filename: undefined,
          columnDelimiter: ',',
          headerCategory: 'category',
          headerValue: 'value',
          dateFormatter: (timestamp) => new Date(timestamp).toDateString()
        },
        svg: {
          filename: undefined,
        },
        png: {
          filename: undefined,
        },
      },
    },

    stroke: {
      show: false,
    },

    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    ...options,
  });

  const totalFaseAdequada = useCallback((_faseListToSum = []) => {
    return (chart.series ?? []).reduce(
      (acc, item) => acc + (_faseListToSum.includes(item.label) ? item.value : 0),
      0
    );
  }, [chart.series]);

  const calculoFaseAdequada = useCallback(() => {
    const _faseAdequada = anos_fase_adequada[ano_escolar];
    const _indexOfFaseList = fases_options.indexOf(_faseAdequada);
    const _faseListToSum = _.slice(fases_options, _indexOfFaseList, fases_options.length);
    const _totalFaseAdequada = totalFaseAdequada(_faseListToSum);

    let _percentFaseAdequada = Math.floor((_totalFaseAdequada / total_avaliados) * 100);
    _percentFaseAdequada = _percentFaseAdequada <= 100 ? _percentFaseAdequada : 100;

    return _percentFaseAdequada;
  }, [ano_escolar, total_avaliados, totalFaseAdequada]);

  return (
    <Box {...other}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <CardHeader title={title} sx={{ mb: 1 }}></CardHeader>
        {!!ano_escolar && (<Box sx={{ width: 260, mt: 2, mr:{ xs: 2, md:0 } }}>
          <Typography fontSize={13} mb={0.2} fontWeight="700" sx={{ ml: 1 }}>
            Fase adequada: {anos_fase_adequada[`${ano_escolar}`] ?? '-'}
          </Typography>
          <LinearProgress
            value={calculoFaseAdequada()}
            variant="determinate"
            color="primary"
            sx={{
              height: 26,
              borderRadius: 13,
              // bgcolor: alpha(theme.palette.common.black, 0.08),
              span: {
                borderRadius: '13px !important',
                // ...bgGradient({
                //   direction: 'to right',
                //   startColor: lighten(theme.palette.primary.main, 0.3),
                //   endColor: theme.palette.primary.light,
                // }),
                '&::before': {
                  color: theme.palette.common.white,
                  fontWeight: 700,
                  content: `"${calculoFaseAdequada()}%"`,
                  top: 2,
                  display: 'block',
                  right: 6,
                  zIndex: 1,
                  position: 'absolute',
                },
              },
              '&::before': {
                bgcolor: 'divider',
                opacity: 1,
              },
            }}
          />
        </Box>)}
      </Stack>

      <Chart
        dir="ltr"
        width="100%"
        type="bar"
        series={chartSeries}
        options={chartOptions}
        height={height}
      />
    </Box>
  );
}

GraficoIndiceFaseAnoColunasChart.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  ano_escolar: PropTypes.number,
  total_avaliados: PropTypes.number,
};
