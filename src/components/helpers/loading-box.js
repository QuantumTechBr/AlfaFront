'use client';

import { Box, Button, CircularProgress } from '@mui/material';

export default function LoadindBox() {
  return (
    <Box
      sx={{
        height: 100,
        textAlign: 'center',
      }}
    >
      <Button
        disabled
        variant="outlined"
        startIcon={<CircularProgress />}
        sx={{
          bgcolor: 'white',
        }}
      >
        Carregando
      </Button>
    </Box>
  );
}
