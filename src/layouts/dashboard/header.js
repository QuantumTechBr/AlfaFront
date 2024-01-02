import PropTypes from 'prop-types';
// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
// theme
import { bgBlur } from 'src/theme/css';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Logo from 'src/components/logo';
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/auth/hooks';
//
import { HEADER, NAV } from '../config-layout';
import {
  Searchbar,
  AccountPopover,
  SettingsButton,
  LanguagePopover,
  ContactsPopover,
  NotificationsPopover,
} from '../_common';
import { Box, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function Header({ onOpenNav }) {
  const theme = useTheme();
  const { user, logout } = useAuthContext();

  const settings = useSettingsContext();

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const showEscolaInfo =
    user?.permissao_usuario[0]?.nome == 'PROFESSOR' ||
    user?.permissao_usuario[0]?.nome == 'DIRETOR';
  const showDDZInfo = user?.permissao_usuario[0]?.nome == 'ASSESSOR DDZ';
  const showFullInfo = showEscolaInfo || showDDZInfo;

  const renderContent = (
    <>
      {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}

      {/* <Searchbar /> */}

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        {/* <LanguagePopover /> */}

        {/* <NotificationsPopover /> */}

        {/* <ContactsPopover /> */}

        {/* <SettingsButton /> */}

        <Box>
          <Typography align="right" variant="subtitle2" noWrap>
            {user?.nome}
            {showFullInfo ? ` - ${user?.funcao_usuario[0]?.funcao?.nome}` : ''}
          </Typography>

          <Typography align="right" variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {showEscolaInfo
              ? [
                  user?.funcao_usuario[0]?.escola?.nome,
                  user?.funcao_usuario[0]?.escola?.cidade?.nome,
                  user?.funcao_usuario[0]?.escola?.zona?.nome,
                ].join(' - ')
              : null}

            {showDDZInfo
              ? [
                  user?.funcao_usuario[0]?.zona?.cidade?.nome,
                  user?.funcao_usuario[0]?.zona?.nome,
                ].join(' - ')
              : null}

            {!showFullInfo ? user?.permissao_usuario[0]?.nome : null}
          </Typography>
        </Box>

        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func,
};
