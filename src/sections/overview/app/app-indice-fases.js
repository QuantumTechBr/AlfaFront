import PropTypes from 'prop-types';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
// utils
import { fNumber } from 'src/utils/format-number';
// components
import Chart, { useChart } from 'src/components/chart';
import { RegistroAprendizagemFasesColors } from 'src/_mock';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 400;

const LEGEND_HEIGHT = 72;

const StyledChart = styled(Chart)(({ theme }) => ({
  height: CHART_HEIGHT,
  '& .apexcharts-canvas, .apexcharts-inner, svg, foreignObject': {
    height: `100% !important`,
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    borderTop: `dashed 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

export default function AppIndiceFases({ title, subheader, chart, ...other }) {
  const theme = useTheme();

  const { series, options } = chart;

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
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        columnWidth: '100%',
        distributed: true, // CORES AUTOMATICAS E BOLINHAS
        borderRadius: 0,
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
        enabled: false,
      },
      offsetY: 0,
      style: {
        fontSize: '13px',
        // fontWeight: `bold`,
        colors: ['#000'],
      },
    },
    xaxis: {
      categories: series.map((i) => i.label),
      labels: {
        show: false, // LEGENDA EIXO X
      },
    },
    yaxis: {
      labels: {
        show: false,
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
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 0 }} />

      <Chart
        dir="ltr"
        width={'100%'}
        type="bar"
        series={chartSeries}
        options={chartOptions}
        height={290}
      />
    </Card>
  );
}

AppIndiceFases.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
