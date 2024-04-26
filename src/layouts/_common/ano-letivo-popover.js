import PropTypes from 'prop-types';

import { useEffect, useCallback, useContext } from 'react';
import _ from 'lodash';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// @mui
import MenuItem from '@mui/material/MenuItem';
// context
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';

// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Box, Button, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function AnoLetivoPopover({ sx }) {
  const { anosLetivos, buscaAnosLetivos, systemAnoLetivo, changeAnoLetivo } =
    useContext(AnosLetivosContext);
  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);

  const popover = usePopover();

  const handleChangeAnoLetivo = useCallback(
    (newValue) => {
      changeAnoLetivo(newValue);
      // TODO MODAL DE ALERTA PARA REAPLICAR FILTROS
      popover.onClose();
    },
    [anosLetivos, popover]
  );

  const preparacaoInicial = useCallback(() => {
    if (!preparacaoInicialRunned.value) {
      preparacaoInicialRunned.onTrue();
      Promise.all([
        buscaAnosLetivos().then((_anosLetivos) => {
          if (!systemAnoLetivo || systemAnoLetivo == '') {
            changeAnoLetivo(_.first(_anosLetivos).ano);
          }
        }),
      ]).then(() => {
        contextReady.onTrue();
      });
    }
  }, [preparacaoInicialRunned, buscaAnosLetivos, contextReady]);

  useEffect(() => {
    preparacaoInicial(); // chamada unica
  }, []);

  return (
    <>
      {!!contextReady && (
        <Box sx={sx}>
          <Button
            variant="text"
            endIcon={<Iconify icon="solar:calendar-line-duotone" />}
            onClick={popover.onOpen}
            sx={{
              ...(popover.open && {
                bgcolor: 'action.selected',
              }),
            }}
          >
            {systemAnoLetivo?.ano || '-'}
          </Button>

          <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 160 }}>
            <Typography variant="subtitle1" align="center" py={1}>
              Ano Letivo
            </Typography>
            {anosLetivos.map((option) => (
              <MenuItem
                key={option.id}
                selected={option.ano === systemAnoLetivo.ano}
                onClick={() => handleChangeAnoLetivo(option.ano)}
                sx={{ textAlign: 'center' }}
              >
                <Typography width="100%">{option.ano}</Typography>
              </MenuItem>
            ))}
          </CustomPopover>
        </Box>
      )}
    </>
  );
}

AnoLetivoPopover.propTypes = {
  sx: PropTypes.object,
};
