import PropTypes from 'prop-types';

// @mui
import { Card } from '@mui/material';
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
    chart: { toolbar: { show: true } },
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
      formatter: (value, opt) => {
        const { goals } = opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex];

        if (goals && goals.length) {
          if (value == 0) return '';
          return `${value ?? 0}% / ${goals[0]?.value ?? 0}%`;
        }
        return `${value ?? 0}%`;
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
        formatter: (value, opt) => {
          return value ?? series[opt.dataPointIndex]?.alfabetizados ?? '-';
        },
        title: {
          formatter: (s) => `Alfabetizados:`,
        },
      },
    },
    title: {
      text: title,
      offsetX: 13,
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily,
        color: 'inherit',
      },
    },
    grid: {
      padding: { top: -15, bottom: -15 },
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
    yaxis: { show: true, min: 0, max: 100 },

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
      <Card {...other} sx={{ pt: 3, pb: 2, px: 1, height: height }}>
        <Scrollbar>
          <Chart
            width="100%"
            type="bar"
            series={chartSeries}
            options={chartOptions}
            height={((series.length * 41) + 94) - 15}
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
