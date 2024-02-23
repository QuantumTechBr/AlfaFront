import PropTypes from 'prop-types';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

// components
import Chart, { useChart } from 'src/components/chart';
import { Box, Card, Stack } from '@mui/material';

// ----------------------------------------------------------------------

export default function MetaComponent({
  color = 'primary',
  title,
  subtitle,
  meta,
  alfabetizados,
  total,
  sx,
  ...other
}) {
  const theme = useTheme();
  const screenIsMdUp = useMediaQuery(theme.breakpoints.up('md'));


  // CALCULO DO TOTAL DA META
  const _percentAlfabetizados = (alfabetizados / total) * 100;
  let _percentDaMeta = isNaN(_percentAlfabetizados)
    ? 0
    : +((_percentAlfabetizados / meta) * 100).toFixed(2);
  if (_percentDaMeta > 100) {
    _percentDaMeta = 100;
  }

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
    <Card
      direction="row"
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingX: 2,
        paddingY: 2,
        color: `white`,
        backgroundColor: theme.palette[color].main,
        ...sx,
      }}
      {...other}
    >
      <Stack direction="row"  alignItems="center" spacing={2} justifyContent={'space-evenly'}  width={"100%"}>
        <Box>
          <Typography variant="h3" fontWeight="600">
            {title}
          </Typography>
          <Typography variant="body2" fontWeight="500">
            {subtitle}
          </Typography>
        </Box>

        <Box paddingTop={2}>
          <Chart
            type="radialBar"
            series={[_percentDaMeta]}
            options={chartOptions}
            width={screenIsMdUp ? 150 : 150 * 1.2}
            height={screenIsMdUp ? 200 : 200 * 1.2} 
          />
        </Box>
      </Stack>
    </Card>
  );
}

MetaComponent.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  meta: PropTypes.number,
  alfabetizados: PropTypes.number,
  total: PropTypes.number,
  sx: PropTypes.object,
};
