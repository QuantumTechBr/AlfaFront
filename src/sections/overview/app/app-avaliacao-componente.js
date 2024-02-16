import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
// utils
import { fNumber } from 'src/utils/format-number';
// components
import Scrollbar from 'src/components/scrollbar';
import { useChart } from 'src/components/chart';
import ChartColumnStacked from 'src/sections/overview/app/chart-column-stacked';
import { _disciplinas } from 'src/_mock';

export default function AppAvaliacaoComponente({ title, subheader, list = [], ...other }) {
  const chartOptions = useChart({
    chart: {
      type: 'bar',
      stacked: false,
      stackType: '100%',
      zoom: {
        enabled: false,
      },
    },
    legend: {
      itemMargin: {
        horizontal: 17,
        vertical: 20,
      },
      horizontalAlign: 'left',
      position: 'bottom',
      offsetY: 0,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '90%',
        distributed: true,
        dataLabels: {
          position: 'top',
        },
      },
    },
    labels: {
      style: {
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value, { _series_, seriesIndex, dataPointIndex, w }) => {
        return list[seriesIndex].data[dataPointIndex];
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
    xaxis: {
      categories: _disciplinas,
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Scrollbar>
        <ChartColumnStacked series={list} options={chartOptions} />
      </Scrollbar>
    </Card>
  );
}

AppAvaliacaoComponente.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array,
};
