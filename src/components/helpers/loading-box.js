import PropTypes from 'prop-types';
// mui
import { Box, Button, CircularProgress } from '@mui/material';

export default function LoadingBox({texto, ...other}) {
  return (
    <Box
      sx={{
        height: 100,
        textAlign: 'center',
      }}
      {...other}
    >
      <Button
        disabled
        variant="outlined"
        startIcon={<CircularProgress />}
        sx={{
          bgcolor: 'white',
        }}
      >
        {texto ?? 'Carregando'}
      </Button>
    </Box>
  );
}

LoadingBox.propTypes = {
  texto: PropTypes.string,
};
