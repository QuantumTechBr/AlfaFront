import PropTypes from 'prop-types';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
// utils
import { fNumber } from 'src/utils/format-number';
// components
import Chart, { useChart } from 'src/components/chart';

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

export default function AppIndiceAprovacao({ title, subheader, series, options, ...other }) {
  const theme = useTheme();

  const totalItems = series.reduce((total, item) => total + item.amount, 0);
  series.forEach((element) => {
    element.porcentagem = Math.round((element.amount / totalItems) * 100);
  });

  //   console.table(totalItems);
  //   console.table(series);

  const colors = ['#009a50', '#d11400', '#006abc'];
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
    colors: colors,

    dataLabels: {
      enabled: true,
      formatter:  (val) => `${val}%`,
      dropShadow: {
        enabled: true,
      },
      offsetY: 0,
      style: {
        fontSize: '14px',
        colors: ['#fff'],
      },
    },
    xaxis: {
      categories: series.map((i) => i.name),
      labels: {
        show: true,
        style: {
          fontSize: '13px',
          fontWeigth: 'bold',
          colors: colors,
        },
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
        formatter: (value, opts) => series[opts.dataPointIndex]?.amount ?? '-',
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
        width="100%"
        type="bar"
        series={chartSeries}
        options={chartOptions}
        height={290}
      />
    </Card>
  );
}

AppIndiceAprovacao.propTypes = {
  series: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
