import PropTypes from 'prop-types';

// @mui
import { Card, CardHeader } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// components
import Chart, { useChart } from 'src/components/chart';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function GraficoHorizontalChart({
  title,
  subheader,
  chart,
  height = 445,
  ...other
}) {
  const theme = useTheme();
  const { series, options } = chart;

  if (series === undefined) return;

  const chartSeries = [
    {
      name: `Índice`,
      data: series,
    },
  ];

  const chartOptions = useChart({
    states: {
      hover: {
        filter: {
          type: 'none' /* none, lighten, darken */,
        },
      },
      active: {
        filter: {
          type: 'none' /* none, lighten, darken */,
        },
      },
    },
    legend: {
      show: false,
      floating: true,
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 0,

      showForSingleSeries: true,
      customLegendItems: ['Atual', 'Meta'],
      markers: {
        fillColors: [theme.palette.primary.main, '#775DD0'],
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '80%',
        borderRadius: 13,
      },
    },
    colors: [theme.palette.primary.main],

    dataLabels: {
      enabled: true,
      formatter: function (val, opt) {
        const goals = opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex].goals;

        if (goals && goals.length) {
          if (val == 0) return '';
          return `${val ?? 0}% / ${goals[0]?.value ?? 0}%`;
        }
        return val;
      },
      dropShadow: {
        enabled: true,
      },
    },

    // TODO REVISAR SE SOLICITADO
    tooltip: {
      shared: false,
      intersect: false,
      enabled: false,
      enabledOnSeries: true,
      followCursor: true,
      onDatasetHover: {
        highlightDataSeries: false,
      },
      y: {
        formatter: function (value, opt) {
          return value ?? series[opt.dataPointIndex]?.alfabetizados ?? '-';
        },
        title: {
          formatter: (s) => `Alfabetizados:`,
        },
      },
    },

    grid: {
      padding: { top: -20, bottom: 0 },
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },

    stroke: {
      show: false,
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
      <Card {...other} sx={{ pb: 2, height: height }}>
        <CardHeader title={title} sx={{ mb: 3 }}></CardHeader>

        <Scrollbar>
          <Chart
            width={'100%'}
            type="bar"
            series={chartSeries}
            options={chartOptions}
            height={(series.length * 41) + 42}
          />
        </Scrollbar>
      </Card>
    </>
  );
}

GraficoHorizontalChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  height: PropTypes.number,
  chart: PropTypes.object,
};
