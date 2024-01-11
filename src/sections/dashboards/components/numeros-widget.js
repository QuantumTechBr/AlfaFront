import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
// utils
import { fShortenNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function NumerosWidget({ title, total, icon, sx, ...other }) {
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        pl: 3,
        ...sx,
      }}
      {...other}
    >
      <Box>
        <Box sx={{ mb: 0, typography: 'h2', fontWeight:400 }}>{fShortenNumber(total)}</Box>
        <Box sx={{ color: 'text.primary', typography: 'subtitle1' }}>{title}</Box>
      </Box>

      <Box
        sx={{
          width: 120,
          height: 120,
          lineHeight: 0,
          display: 'flex',
          alignItems: 'center',
          //   borderRadius: '50%',
          //   bgcolor: 'background.neutral',
        }}
      >
        {icon}
      </Box>
    </Card>
  );
}

NumerosWidget.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  sx: PropTypes.object,
  title: PropTypes.string,
  total: PropTypes.number,
};
