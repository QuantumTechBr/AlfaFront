import PropTypes from 'prop-types';

// @mui
import { Box, Typography } from '@mui/material';

// components
import Chart, { useChart } from 'src/components/chart';
import { RegistroAprendizagemFasesColors } from 'src/_mock';

// ----------------------------------------------------------------------

export default function GraficoColunasChart({ title, subheader, chart, ...other }) {
  const { series, options, height = 350 } = chart;

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
        <Typography variant="h4" fontWeight="400" sx={{ mb: 0, p: 3 }}>
          {title}
        </Typography>

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
