import PropTypes from 'prop-types';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// components
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function MetaComponent({ title, total, color = 'primary', sx, ...other }) {
  const theme = useTheme();

  const chartOptions = useChart({
    chart: {
      offsetY: -21,
      sparkline: {
        enabled: true,
      },
    },
    grid: {
      padding: { top: 0, bottom: 18 },
    },
    legend: {
      show: false,
    },

    stroke: {
      lineCap: 'square',
    },
    states: {
      hover: {
        filter: {
          type: 'none' /* none, lighten, darken */,
        },
      },
      active: {
        filter: {
          type: 'none' /* none, lighten, darken */,
        },
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: alpha(theme.palette.common.white, 0.2),
          strokeWidth: '97%',
        },
        hollow: {
          size: '50%',
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: 0,
            color: theme.palette.common.white,
            fontWeight: 400,
          },
        },
      },
    },
    color: theme.palette.error.main,
    fill: {
      colors: [theme.palette.common.white],
    },
  });

  return (
    <Stack
      height="100%"
      alignItems="center"
      direction="row"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        py: 0,
        borderRadius: 2,
        textAlign: 'center',
        color: `white`,
        backgroundColor: theme.palette[color].main,
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h2" fontWeight="300">
        {title}
      </Typography>

      <Chart type="radialBar" series={[total]} options={chartOptions} height={250} width={190} />
    </Stack>
  );
}

MetaComponent.propTypes = {
  color: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.string,
  total: PropTypes.number,
};
