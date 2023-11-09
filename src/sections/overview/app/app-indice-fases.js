import PropTypes from 'prop-types';
import { useCallback } from 'react';

// @mui
import { useTheme, styled } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
// utils
import { fNumber } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
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

export default function AppIndiceFases({
  title,
  subheader,
  chart,
  bimestres,
  selectedBimestre,
  onChangeBimestre,
  ...other
}) {
  const theme = useTheme();

  const popover = usePopover();

  const { series, options } = chart;

  const totalItems = series.reduce((total, item) => total + item.value, 0);
  series.forEach((element) => {
    element.porcentagem = Math.round((element.value / totalItems) * 100);
  });

  const handleChangeBimestre = useCallback(
    (newValue) => {
      popover.onClose();
      onChangeBimestre(newValue);
    },
    [popover]
  );

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
      offsetY: 0,
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
              {selectedBimestre?.ordinal}º Bimestre
              <Iconify
                width={16}
                icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                sx={{ ml: 0.5 }}
              />
            </ButtonBase>
          }
          sx={{ mb: 0 }}
        />

        <Chart
          dir="ltr"
          width={'100%'}
          type="bar"
          series={chartSeries}
          options={chartOptions}
          height={290}
        />
      </Card>
      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 120 }}>
        {bimestres.map((option) => (
          <MenuItem
            key={option.id}
            selected={option === selectedBimestre}
            onClick={() => handleChangeBimestre(option)}
          >
            {option.ordinal}º Bimestre
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}

AppIndiceFases.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
