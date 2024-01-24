import PropTypes from 'prop-types';

// @mui
import { LinearProgress, Box, Stack, Typography, CardHeader } from '@mui/material';
import { lighten, alpha, useTheme } from '@mui/material/styles';
import { bgGradient } from 'src/theme/css';

// components
import Chart, { useChart } from 'src/components/chart';
import { RegistroAprendizagemFasesColors } from 'src/_mock';

// ----------------------------------------------------------------------

export default function GraficoColunasChart({ title, subheader, chart, ...other }) {
  const theme = useTheme();
  const { series, options, height = 320 } = chart;

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
      formatter: function (val) {
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
      labels: {
        show: true,
      },
    },
    yaxis: {
      labels: {
        labels: {
          show: true,
        },
        // todo add 0-100
      },
    },

    tooltip: {
      enabled: true,
      followCursor: true,
      onDatasetHover: {
        highlightDataSeries: true,
      },
      y: {
        formatter: function (value, { _series, seriesIndex, dataPointIndex, w }) {
          return series[dataPointIndex]?.value ?? '-';
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
          dateFormatter(timestamp) {
            return new Date(timestamp).toDateString();
          },
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

  return (
    <>
      <Box {...other}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <CardHeader title={title} sx={{ mb: 1 }}></CardHeader>
          <Box sx={{ width: 235, mt: 2 }}>
            <Typography fontSize={15} mb={0.8} fontWeight="700">
              Fase adequada
            </Typography>
            <LinearProgress
              value={76}
              variant="determinate"
              color="primary"
              sx={{
                height: 26,
                borderRadius: 13,
                bgcolor: alpha(theme.palette.common.black, 0.08),
                span: {
                  borderRadius: '13px !important',
                  ...bgGradient({
                    direction: 'to right',
                    startColor: lighten(theme.palette.primary.main, 0.3),
                    endColor: theme.palette.primary.light,
                  }),
                  '&::before': {
                    color: theme.palette.common.black,
                    fontWeight: 800,
                    content: '"76%"',
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
          </Box>
        </Stack>

        <Chart
          dir="ltr"
          width={'100%'}
          type="bar"
          series={chartSeries}
          options={chartOptions}
          height={height}
        />
      </Box>
    </>
  );
}

GraficoColunasChart.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
