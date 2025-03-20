'use client';

import PropTypes from 'prop-types';
import _ from 'lodash';

// @mui
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

// components
import Chart, { useChart } from 'src/components/chart';
import { CardHeader, Grid } from '@mui/material';

import '../../components/style.css';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function ParticipacaoChart({ title, chartSeries = [], options, ...other }) {
  const theme = useTheme();
  const colors = ['#d11400', '#FFBF00'];

  const chartOptions = useChart({
    colors: colors,
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
    chart: {
      toolbar: { show: true },
    },

    xaxis: options.xaxis,

    plotOptions: {
      bar: {
        columnWidth: '85%',
        borderRadius: 11,
      },
    },
    stroke: {
      show: true,
      width: 10,
      colors: ['transparent'],
    },
    dataLabels: {
      enabled: true,
      background: {
        enabled: true,
        padding: 7,
        borderRadius: 4,
        borderWidth: 1,
        opacity: 0,
        dropShadow: {
          enabled: false,
        },
      },
      dropShadow: { enabled: true },
      formatter: (value, opts) => {
        return `${value}%`;
      },
    },

    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: {
        formatter: (value, opts) => {
          let _di = opts.dataPointIndex;
          let _dados = opts.w.config.series[opts.seriesIndex];
          return `${fNumber(_dados.quantidade[_di])} presentes de ${fNumber(_dados.total[_di])}`;
        },
      },
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

    legend: {
      show: true,
      position: 'bottom',
      showForSingleSeries: true,
      // formatter: (seriesName) => `% ${seriesName}`,
      itemMargin: {
        vertical: 30,
      },
    },

    yaxis: [{ show: true, min: 0, max: 100, decimalsInFloat: 0 }],
  });

  return (
    <Card {...other}>
      {/* <CardHeader title={title} sx={{ mb: 3 }}></CardHeader> */}

      <Grid container justifyContent="space-around">
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Chart
            dir="ltr"
            width="100%"
            type="bar"
            series={chartSeries}
            options={chartOptions}
            height={450}
          />
        </Grid>
      </Grid>
    </Card>
  );
}

ParticipacaoChart.propTypes = {
  title: PropTypes.string,
  chartSeries: PropTypes.array,
  options: PropTypes.object,
};
