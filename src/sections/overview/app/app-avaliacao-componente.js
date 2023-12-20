import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
// utils
import { fNumber, fPercent, fShortenNumber } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import Chart, { useChart } from 'src/components/chart';
import ChartColumnStacked from 'src/sections/_examples/extra/chart-view/chart-column-stacked';

export default function AppAvaliacaoComponente({ title, subheader, list, ...other }) {
  const randomColor = () => {
    let corAleatoria = '#' + Math.floor(Math.random() * 16777215).toString(16);
    console.log(corAleatoria);
    return corAleatoria;
  };

  const colors = ['#009a50', '#d11400'];
  const _materias = ['Matemática', 'Português', 'Ciências', 'História', 'Geografia'];

  const [_randomColors, setRandomColors] = useState(colors);
  const [_series, setSeries] = useState([]);

  useEffect(() => {
    console.log('use effect');

    const newData = [];
    list.map((itemList) => {
      //   for (let indexList = 0; indexList < list.length; indexList++) {
      //     const data = list[indexList].data;
      // }

      if (itemList.total === undefined) itemList.total = [];

      for (let indexMateria = 0; indexMateria < _materias.length; indexMateria++) {
        let xAxisCount = list.reduce((total, item) => {
            return total + item.data[indexMateria];
        }, 0);
        itemList.total[indexMateria] = xAxisCount;
      }

      newData.push(itemList);
    });

    console.table(newData);

    setSeries(newData);
  }, []);

  const chartOptions = useChart({
    colors: _randomColors,
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
        horizontal: 10,
      },
      horizontalAlign: 'left',
      position: 'bottom',
      offsetY: 0,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: 50,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (value, { _series_, seriesIndex, dataPointIndex, w }) {
        return `${fPercent((_series[seriesIndex].data[dataPointIndex] / _series[seriesIndex].total[dataPointIndex] * 100))}`;
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
    xaxis: {
      categories: _materias,
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Scrollbar>
        <ChartColumnStacked series={_series} options={chartOptions} width={86} height={16} />
      </Scrollbar>
    </Card>
  );
}

AppAvaliacaoComponente.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array,
};
