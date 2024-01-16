import PropTypes from 'prop-types';

// @mui
import { Card, Stack, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// components
import Chart, { useChart } from 'src/components/chart';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function GraficoHorizontalChart({ title, subheader, chart, ...other }) {
  const theme = useTheme();
  const { series, options, height = 305 } = chart;

  if (series === undefined) return;

  const chartSeries = [
    {
      name: 'ano',
      // data: series.map((element) => element.porcentagem),
      data: series,
    },
  ];

  const chartOptions = useChart({
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: 40,
        borderRadius: 11,
      },
    },
    colors: [theme.palette.primary.light],

    track: {
      background: alpha(theme.palette.common.black, 0.8),
    },

    dataLabels: {
      enabled: false,
    },
    xaxis: {
      // categories: series.map((i) => i.label),
      labels: {
        show: false,
      },
    },
    // yaxis: {
    //   labels: {
    //     show: false,
    //     // todo add 0-100
    //   },
    // },

    tooltip: {
      enabled: true,
      followCursor: true,
      onDatasetHover: {
        highlightDataSeries: true,
      },
      y: {
        formatter: function (value, { _series, seriesIndex, dataPointIndex, w }) {
          return value;
        },
        title: {
          formatter: (s) => `Quantidade:`,
        },
      },
    },

    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },

    stroke: {
      show: true,
      strokeWidth: 2,
      colors: ['transparent'],
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
      <Card {...other} sx={{ pb: 2, height:445 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight="400" sx={{ mb: 0, p: 3 }}>
            {title}
          </Typography>
        </Stack>

        <Scrollbar>
          <Chart
            width={'100%'}
            type="bar"
            series={chartSeries}
            options={chartOptions}
            height={height}
          />
        </Scrollbar>
      </Card>
    </>
  );
}

GraficoHorizontalChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chart: PropTypes.object,
};
