import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
// utils
import { fShortenNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function NumeroWidget({ title, total, icon, sx, ...other }) {
  return (
    <Card
      sx={{
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
        <Box sx={{ mb: 1, typography: 'h2', fontWeight: 400 }}>{fShortenNumber(total)}</Box>
        <Box sx={{ color: 'text.primary', typography: 'h5', fontWeight: 400 }}>{title}</Box>
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

NumeroWidget.propTypes = {
  title: PropTypes.string,
  total: PropTypes.number,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  sx: PropTypes.object,
};
