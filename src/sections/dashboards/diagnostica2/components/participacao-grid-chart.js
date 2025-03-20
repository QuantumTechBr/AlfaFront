import PropTypes from 'prop-types';
import { useState, useCallback, useMemo } from 'react';

import _ from 'lodash';

// @mui
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Grid } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';

// components
import Chart, { useChart } from 'src/components/chart';
import Scrollbar from 'src/components/scrollbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';

import '../../components/style.css';
import { fNumber } from 'src/utils/format-number';
import { height } from '@mui/system';

// ----------------------------------------------------------------------

export default function ParticipacaoGridChart({ title, chartSeries = [], options, ...other }) {
  const theme = useTheme();
  const [seriesTipo, setSeriesTipo] = useState('');
  if(!seriesTipo) {setSeriesTipo('Entrada')}

  const getChartSeries = (_tipo) => {
    const _t = _tipo ?? seriesTipo;
    const _retorno = chartSeries.filter((item) => item.tipo === _t);
    return _retorno ?? [];
  };

  const memoizedValues = useMemo(
    () => ({
      hasSaida: chartSeries.filter((_item) => _item.tipo == 'Saída').length > 0,
    }),
    [chartSeries]
  );

  const colors = ['#134EB4', '#009a50'];
  const _columnWith = options.plotOptions.bar.columnWidth;

  const chartOptions = useChart({
    colors: colors,
    // title: {
    //   text: title,
    //   offsetX: 13,
    //   style: {
    //     fontSize: '18px',
    //     fontWeight: 'bold',
    //     fontFamily: theme.typography.fontFamily,
    //     color: 'inherit',
    //   },
    // },
    chart: {
      toolbar: { show: true },
      stacked: true,
      stackOnlyBar: true,
    },

    xaxis: options.xaxis,

    plotOptions: {
      bar: {
        columnWidth: _columnWith,
        borderRadius: 11,
        borderRadiusApplication: 'end', // around
        borderRadiusWhenStacked: 'last', // last
        ...options.plotOptions.bar,
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
          // console.log(seriesTipo);
          // let seriesTeste = getChartSeries();
          return _series[opts.seriesIndex].quantidade[opts.dataPointIndex]
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
      // formatter: (seriesName) => `% ${seriesName}`,
      itemMargin: {
        vertical: 30,
      },
    },

    yaxis: [{ show: options.plotOptions.bar.horizontal, min: 0, max: 100, decimalsInFloat: 0 }],
  });

  // DIMENSÕES
  const [boxWidth, setBoxWidth] = useState(null);
  const [boxHeight, setBoxHeight] = useState(null);
  const boxRef = useCallback((node) => {
    if (node !== null) {
      setBoxWidth(node.getBoundingClientRect().width);
      setBoxHeight(node.getBoundingClientRect().height);
    }
  }, []);

  const _series = getChartSeries();

  const _widthPorQuantidade = useMemo(
    () => (Number.isInteger(_columnWith) ? _series.length * _columnWith : 0),
    [_series]
  );

  const _heightPorQuantidade = useMemo(() => {
    return (
      (_.maxBy(_series, (item) => {
        return item.data.length;
      })?.data.length ?? 0) * 45
    );
  }, [_series]);

  const popover = usePopover();

  const handleChangeTipo = (newValue) => {
      setSeriesTipo(newValue);
      popover.onClose();
    }

  return (
    <>
      <Card {...other}>
        <CardHeader
          title={title}
          action={
            <ButtonBase
              onClick={popover.onOpen}
              sx={{
                pl: 1,
                py: 0.5,
                pr: 0.5,
                borderRadius: 1,
                typography: 'subtitle2',
                bgcolor: 'background.neutral',
              }}
            >
              {seriesTipo}

              <Iconify
                width={16}
                icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                sx={{ ml: 0.5 }}
              />
            </ButtonBase>
          }
        />

        {!options.plotOptions.bar.horizontal && (
          <Grid container justifyContent="space-around">
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box ref={boxRef}>
                <Scrollbar sx={{ overflowY: 'hidden' }}>
                  <Chart
                    dir="ltr"
                    type="bar"
                    series={_series}
                    options={chartOptions}
                    height={450}
                    width={_.max([boxWidth, _widthPorQuantidade])}
                  />
                </Scrollbar>
              </Box>
            </Grid>
          </Grid>
        )}

        {options.plotOptions.bar.horizontal && (
          <Grid
            item
            xs={12}
            sx={{ mt: 3, ...(options.plotOptions.bar.horizontal ? { height: 450 } : {}) }}
          >
            <Scrollbar>
              <Chart
                dir="ltr"
                type="bar"
                series={_series}
                options={chartOptions}
                height={_.max([450, _heightPorQuantidade])}
                width="100%"
              />
            </Scrollbar>
          </Grid>
        )}
      </Card>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 77 }}>
        <MenuItem
          key="MenuItem-Entrada"
          selected={'Entrada' === seriesTipo}
          onClick={() => handleChangeTipo('Entrada')}
        >
          Entrada
        </MenuItem>

        {memoizedValues.hasSaida && (
          <MenuItem
            key="MenuItem-Saida"
            selected={'Saída' === seriesTipo}
            onClick={() => handleChangeTipo('Saída')}
          >
            Saída
          </MenuItem>
        )}
      </CustomPopover>
    </>
  );
}

ParticipacaoGridChart.propTypes = {
  title: PropTypes.string,
  chartSeries: PropTypes.array,
  options: PropTypes.object,
};
