import PropTypes from 'prop-types';

// @mui
import { Box, Stack, Typography } from '@mui/material';
import { lighten, alpha, useTheme } from '@mui/material/styles';

// components
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function GraficoHorizontalChart({ title, subheader, chart, ...other }) {
  const theme = useTheme();
  const { series, options, height = 350 } = chart;

  const chartSeries = [
    {
      name: '+-',
      // data: series.map((element) => element.porcentagem),

      data: [
        {
          x: '2011',
          y: 12,
          goals: [
            {
              name: 'Expected',
              value: 14,
              strokeWidth: 2,
              strokeDashArray: 2,
              strokeColor: '#775DD0',
            },
          ],
        },
      ],
    },
  ];

  const chartOptions = useChart({
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '30%',
      },
    },
    colors: [theme.palette.primary.light],

    dataLabels: {
      enabled: false,
      formatter: function (val) {
        return `${val}%`;
      },
      dropShadow: {
        enabled: true,
        color: ['#f0ff00'],
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

    stroke: {
      show: false,
    },

    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal',
        shadeIntensity: 0.2,
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
          <Typography variant="h4" fontWeight="400" sx={{ mb: 0, p: 3 }}>
            {title}
          </Typography>
        </Stack>

        <Chart
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

GraficoHorizontalChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chart: PropTypes.object,
};
