import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
// components
import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { RegistroAprendizagemFases, RegistroAprendizagemFasesColors } from 'src/_mock';
import { fNumber } from 'src/utils/format-number';
import Scrollbar from 'src/components/scrollbar';

import _ from 'lodash';

// ----------------------------------------------------------------------

export default function DesempenhoAlunosWidget({ title, subheader, chart, ...other }) {
  const popover = usePopover();

  const [series, setSeries] = useState([]);
  const [seriesYearData, setSeriesYearData] = useState('');

  const colors = Object.values(RegistroAprendizagemFasesColors);

  const { categories: bimestres, series: chartSeries, options } = chart;

  const chartOptions = useChart({
    chart: { toolbar: { show: true } },
    colors: colors,
    xaxis: {
      categories: bimestres.map((_bimestre) => _bimestre.replace(`-`, `º `)),
      labels: {
        style: {
          fontSize: '14px',
          fontWeigth: 'bold',
        },
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '95%',
        borderRadius: 12,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: 0,
      dropShadow: {
        enabled: true,
      },
      style: {
        fontSize: '14px',
        colors: ['#fff'],
      },
      formatter: (value, opts) => {
        return `${opts.config.series[opts.seriesIndex].porcentagem[opts.dataPointIndex]}%`;
      },
    },
    stroke: {
      show: true,
      width: 10,
      colors: ['transparent'],
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
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => fNumber(value),
      },
    },

    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
    ...options,
  });

  const handleChangeSeries = useCallback(
    (newValue) => {
      popover.onClose();
      setSeriesYearData(newValue);
    },
    [popover]
  );

  const prepareData = useCallback((originalData) => {
    const newData = [];

    for (const [key, fase] of Object.entries(RegistroAprendizagemFases)) {
      const valoresParaFase = originalData.find((item) => item.name == fase);
      if (valoresParaFase?.data) {
        newData.push(valoresParaFase);
      } else {
        newData.push({
          name: fase,
          data: _.times(bimestres.length, _.constant(0)),
        });
      }
    }

    newData.map((itemData) => {
      itemData.totalBimestre = [];
      itemData.porcentagem = [];
      for (let indexBimestre = 0; indexBimestre < bimestres.length; indexBimestre++) {
        const bimestreQuant = newData.reduce((total, item) => total + item.data[indexBimestre], 0);
        itemData.totalBimestre[indexBimestre] = bimestreQuant;

        itemData.porcentagem[indexBimestre] = Math.round(
          (itemData.data[indexBimestre] / bimestreQuant) * 100
        );
      }

      return itemData;
    });

    return newData;
  }, [bimestres.length]);

  useEffect(() => {
    if (chartSeries.length) {
      const _series = chartSeries.map((item) => {
        item.data = prepareData(item.data);
        return item;
      });
      setSeries(_series);
    }
  }, [chartSeries, prepareData]);

  useEffect(() => {
    if (chartSeries.length) {
      const _lastYear = _.last(chartSeries)?.year;
      setSeriesYearData(`${_lastYear}`);
    }
  }, [chartSeries]);

  if (chart === undefined) {
    return <>Carregando...</>;
  }

  if (chartSeries.length == 0) {
    return <>Sem dados para exibir.</>;
  }

  const getChartSeries = (_seriesYearData) => {
    return series.find((item) => item.year === _seriesYearData)?.data ?? [];
  };

  return (
    <>
      <Card sx={{paddingBottom: 3}} {...other}>
        <CardHeader
          title={title}
          subheader={subheader}
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
              {seriesYearData}

              <Iconify
                width={16}
                icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                sx={{ ml: 0.5 }}
              />
            </ButtonBase>
          }
        />

        {series.length && series.find((item) => item.year === seriesYearData) && (
          <Box sx={{ mt: 3, mx: 3 }}>
            <Scrollbar sx={{overflowY:'hidden'}}>
              <Chart
                dir="ltr"
                type="bar"
                height={364}
                series={getChartSeries(seriesYearData)}
                options={chartOptions}
                width={chart.categories.length * getChartSeries(seriesYearData).length * 60}
              />
            </Scrollbar>
          </Box>
        )}
      </Card>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 77 }}>
        {series.map((option) => (
          <MenuItem
            key={option.year}
            selected={option.year === seriesYearData}
            onClick={() => handleChangeSeries(option.year)}
          >
            {option.year}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}

DesempenhoAlunosWidget.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
