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

// ----------------------------------------------------------------------

export default function AppDesempenhoAlunos({ title, subheader, chart, ...other }) {
  const theme = useTheme();

  if (chart === undefined) {
    return <>Carregando...</>;
  }

  const {
    colors = ['#ffbb00', '#f17105', '#006abc', '#d11400', '#009a50'],
    categories,
    series,
    options,
  } = chart;

  const popover = usePopover();

  const [seriesData, setSeriesData] = useState();

  const chartOptions = useChart({
    colors: colors,
    xaxis: {
      categories,
    },
    ...options,
  });

  const handleChangeSeries = useCallback(
    (newValue) => {
      popover.onClose();
      setSeriesData(newValue);
    },
    [popover]
  );

  useEffect(() => {
    if (series.length) {
      setSeriesData(`${series[0]?.year}`);
    }
  }, [series]);

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
              {seriesData}

              <Iconify
                width={16}
                icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                sx={{ ml: 0.5 }}
              />
            </ButtonBase>
          }
        />

        {series.map((item) => (
          <Box key={item.year} sx={{ mt: 3, mx: 3 }}>
            {item.year === seriesData && (
              <Chart
                dir="ltr"
                type="line"
                series={item.data}
                options={chartOptions}
                height={364}
                width="100%"
              />
            )}
          </Box>
        ))}
      </Card>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 77 }}>
        {series.map((option) => (
          <MenuItem
            key={option.year}
            selected={option.year === seriesData}
            onClick={() => handleChangeSeries(option.year)}
          >
            {option.year}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}

AppDesempenhoAlunos.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};