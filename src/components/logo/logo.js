import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
// routes
import { RouterLink } from 'src/routes/components';
import { useSettingsContext } from '../settings';


// ----------------------------------------------------------------------

const Logo = forwardRef(({ disabledLink = false, sx, ...other }, ref) => {
  const settings = useSettingsContext();
  const isNavMini = settings.themeLayout === 'mini';
  
  const theme = useTheme();
  
  const PRIMARY_LIGHT = theme.palette.primary.light;

  const PRIMARY_MAIN = theme.palette.primary.main;

  const PRIMARY_DARK = theme.palette.primary.dark;

  // using local (public folder)
  // -------------------------------------------------------
  const logo = !isNavMini ? (
    <Box
      component="img"
      src="/assets/illustrations/escudo_prefeitura_manaus.png"
      sx={{ width: 173, height: 60, cursor: 'pointer', ...sx }}
    />
  ) : <Box
      component="img"
      src="/assets/illustrations/escudo_prefeitura_manaus.png"
      sx={{ width: '32%', height: 'calc(13vw)', maxHeight:40, objectFit: 'cover', objectPosition: 2, cursor: 'pointer', ...sx }}
    />
  ;


  if (disabledLink) {
    return logo;
  }

  return (
    <Link component={RouterLink} href="/" sx={{ display: 'contents' }}>
      {logo}
    </Link>
  );
});

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default Logo;
