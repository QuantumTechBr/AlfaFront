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
  NotificationsPopover,
} from '../_common';
import { Box, Tooltip, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { Controller, useFormContext } from 'react-hook-form';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCallback } from 'react';
import { useState } from 'react';
import Label from 'src/components/label';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { useContext } from 'react';
// ----------------------------------------------------------------------

export default function Header({ onOpenNav }) {
  const theme = useTheme();
  const { user, logout } = useAuthContext();
  const { buscaEscolas } = useContext(EscolasContext);
  const settings = useSettingsContext();
  let ep = true;

  const [checkEP, setCheckEP] = useState(ep); 

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  // const showEscolaInfo =
  //   user?.permissao_usuario[0]?.nome == 'PROFESSOR' ||
  //   user?.permissao_usuario[0]?.nome == 'DIRETOR';
  // const showDDZInfo = user?.permissao_usuario[0]?.nome == 'ASSESSOR DDZ';
  // const showFullInfo = showEscolaInfo || showDDZInfo;

  let funcaoPermissaoNome = '';
  let funcaoPermissaoNomeTooltip = '';
  let escolasNomes = '';
  let escolaNomeAbreviado = '';
  let ddzNomeAbreviado = '';
  let ddzNomes = '';
  if (user?.funcao_usuario?.length == 0) {
    funcaoPermissaoNome = user?.permissao_usuario[0]?.nome;
    funcaoPermissaoNomeTooltip = user?.permissao_usuario[0]?.nome;
  } else if (user?.funcao_usuario?.length == 1) {
    funcaoPermissaoNome = user?.funcao_usuario[0]?.nome_exibicao;
    funcaoPermissaoNomeTooltip = user?.funcao_usuario[0]?.nome_exibicao;
    escolasNomes = user?.funcao_usuario[0]?.escola?.nome;
    escolaNomeAbreviado = user?.funcao_usuario[0]?.escola?.nome_abreviado;
    ddzNomeAbreviado = user?.funcao_usuario[0]?.zona?.nome_abreviado;
    ddzNomes = user?.funcao_usuario[0]?.zona?.nome;
  } else if (user?.funcao_usuario?.length > 1) {
    const nomesEscolas = []
    const nomesDDZ = []
    const nomesFuncoes = []
    for (let i = 1; i < user?.funcao_usuario.length; i++) {
      if (user?.funcao_usuario[i]?.escola && !nomesEscolas.includes(user?.funcao_usuario[i]?.escola?.nome)) {
        nomesEscolas.push(user?.funcao_usuario[i]?.escola?.nome)
      } else if (user?.funcao_usuario[i]?.zona && !nomesDDZ.includes(user?.funcao_usuario[i]?.zona?.nome)) {
        nomesDDZ.push(user?.funcao_usuario[i]?.zona?.nome)
      }
      if (!nomesFuncoes.includes(user?.funcao_usuario[i]?.nome_exibicao)) {
        nomesFuncoes.push(user?.funcao_usuario[i]?.nome_exibicao)
      }
    }
    funcaoPermissaoNomeTooltip = nomesFuncoes.join(', ');
    escolasNomes = nomesEscolas.join(', ')
    ddzNomes = nomesDDZ.join(', ')
    funcaoPermissaoNome = nomesFuncoes.length > 1 ? nomesFuncoes.length.toString() + ' funções' : nomesFuncoes[0];
    escolaNomeAbreviado = nomesEscolas.length > 1 ? nomesEscolas.length.toString() + ' escolas' : nomesEscolas[0];
    ddzNomeAbreviado = nomesDDZ.length > 1 ? nomesDDZ.length.toString() + ' DDZs' : nomesDDZ[0];
  }


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

        {/* <SettingsButton /> */}

        <Box>
          <Typography align="right" variant="subtitle2" noWrap>
            {(user?.nome ?? '') + ' - '}
            <Tooltip title={funcaoPermissaoNomeTooltip} placement="top" arrow>
              <span>{funcaoPermissaoNome}</span>
            </Tooltip>
          </Typography>

          <Typography align="right" variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {escolaNomeAbreviado ? 
              <Tooltip title={escolasNomes} placement="top" arrow>
                <span>{escolaNomeAbreviado}</span>
              </Tooltip> : null}
            {ddzNomeAbreviado && ddzNomeAbreviado ? 
            ' e ' : null}
            {ddzNomeAbreviado ?
              <Tooltip title={ddzNomes} placement="top" arrow>
                <span>{ddzNomeAbreviado}</span>
              </Tooltip> : null}

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
