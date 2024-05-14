import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
// utils
import { fNumber } from 'src/utils/format-number';
import { useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function NumeroComponent({ title, subtitle, total, icon, sx, ...other }) {
  const theme = useTheme();

  return (
    <Card
      direction="row"
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 3,
        pl: 4,
        pr: 2,
        ...sx,
      }}
      {...other}
    >
      <Box>
        <Box sx={{ typography: 'h3', fontWeight: 600 }}>{fNumber(total)}</Box>
        <Box sx={{ color: 'text.primary', typography: 'h6', fontWeight: 700 }}>{title}</Box>
        {subtitle && (
          <Box sx={{ opacity: 0.6, color: 'text.grey', typography: 'body2', fontWeight: 500 }}>
            {subtitle}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          width: 80,
          height: 120,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {icon}
      </Box>
    </Card>
  );
}

NumeroComponent.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  total: PropTypes.number,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  sx: PropTypes.object,
};
