import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
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
import { fNumber, fPercent } from 'src/utils/format-number';

import last from 'lodash/last';
import _ from 'lodash';

// ----------------------------------------------------------------------

export default function DesempenhoAlunosWidget({ title, subheader, chart, ...other }) {
  const theme = useTheme();

  if (chart === undefined) {
    return <>Carregando...</>;
  }

  const colors = Object.values(RegistroAprendizagemFasesColors);

  const { categories: bimestres, series, options } = chart;

  const popover = usePopover();

  const [seriesYearData, setSeriesYearData] = useState();
  const [preparedData, setPreparedData] = useState();

  const chartOptionsBase = {
    colors: colors,
    xaxis: {
      categories: bimestres.map((bimestre) => bimestre.replace(`-`, `º `)),
      labels: {
        style: {
          fontSize: '14px',
          fontWeigth: 'bold',
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth:50,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (value, { _series, seriesIndex, dataPointIndex, w }) {
        // return preparedData[dataPointIndex]?.porcentagem;
        return 1;
      },
      offsetY: 0,
      dropShadow: {
        enabled: true,
      },
      style: {
        fontSize: '14px',
        colors: ['#fff'],
      },
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['#fff'],
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => fNumber(value),
      },
    },
    ...options,
  };

  const handleChangeSeries = useCallback(
    (newValue) => {
      popover.onClose();
      setSeriesYearData(newValue);
    },
    [popover]
  );

  useEffect(() => {
    if (series.length) {
      setSeriesYearData(`${last(series)?.year}`);
    }
  }, [series]);

  const prepareData = useCallback((originalData) => {
    const newData = [];

    for (const [key, fase] of Object.entries(RegistroAprendizagemFases)) {
      let valoresParaFase = originalData.find((item) => item.name == fase);
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
        let bimestreQuant = newData.reduce((total, item) => total + item.data[indexBimestre], 0);
        itemData.totalBimestre[indexBimestre] = bimestreQuant;

        itemData.porcentagem[indexBimestre] = Math.round(
          (itemData.data[indexBimestre] / bimestreQuant) * 100
        );
      }

      return itemData;
    });

    // console.log(newData);

    return newData;
  }, []);

  if (series.length == 0) {
    return <>Sem dados para exibir.</>;
  }

  return (
    <>
      <Card {...other}>
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

        {series.map((item) => {
          let preparedData = prepareData(item.data);
          let chartOptionsMod = chartOptionsBase;
          chartOptionsMod.dataLabels.formatter = function (
            value,
            { _series, seriesIndex, dataPointIndex, w }
          ) {
            return `${preparedData[seriesIndex].porcentagem[dataPointIndex]}%`;
          };
          let chartOptions = useChart(chartOptionsBase);
          return (
            <Box key={item.year} sx={{ mt: 3, mx: 3 }}>
              {item.year === seriesYearData && (
                <Chart
                  dir="ltr"
                  type="bar"
                  height={364}
                  series={preparedData}
                  options={chartOptions}
                  width="100%"
                />
              )}
            </Box>
          );
        })}
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
