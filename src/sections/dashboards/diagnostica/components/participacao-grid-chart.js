import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import _ from 'lodash';

// @mui
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

// components
import Chart, { useChart } from 'src/components/chart';
import { Grid } from '@mui/material';
import Scrollbar from 'src/components/scrollbar';

import '../../components/style.css';

// ----------------------------------------------------------------------

export default function ParticipacaoGridChart({ title, chartSeries = [], options, ...other }) {
  const theme = useTheme();
  const colors = ['#134EB4', '#009a50'];
  const _columnWith = options.plotOptions.bar.columnWidth;

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
      stacked: true,
      stackOnlyBar: true,
    },

    xaxis: options.xaxis,

    plotOptions: {
      bar: {
        columnWidth: _columnWith,
        borderRadius: 0,
        borderRadiusApplication: 'end', // around
        borderRadiusWhenStacked: 'last', // last
      },
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: true,
      // offsetY: 25,
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
          return `${opts.w.config.series[opts.seriesIndex].quantidade[opts.dataPointIndex]}`;
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
      // offsetX: 25,
      formatter: (seriesName) => `% ${seriesName}`,
      itemMargin: {
        vertical: 30,
      },
    },

    yaxis: [{ show: true, min: 0, max: 100 }],
  });

  // DIMENSÕES
  const [boxWidth, setWidth] = useState(null);
  const boxRef = useCallback((node) => {
    if (node !== null) {
      setWidth(node.getBoundingClientRect().width);
    }
  }, []);

  const _widthPorQuantidade = Number.isInteger(_columnWith) ? chartSeries.length * _columnWith : 0;

  return (
    <Card {...other}>
      {/* <CardHeader title={title} sx={{ mb: 3 }}></CardHeader> */}

      <Grid container justifyContent="space-around">
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Box ref={boxRef}>
            <Scrollbar sx={{ overflowY: 'hidden' }}>
              <Chart
                dir="ltr"
                type="bar"
                series={chartSeries}
                options={chartOptions}
                height={450}
                width={_.max([boxWidth, _widthPorQuantidade])}
              />
            </Scrollbar>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}

ParticipacaoGridChart.propTypes = {
  title: PropTypes.string,
  chartSeries: PropTypes.array,
  options: PropTypes.object,
};
