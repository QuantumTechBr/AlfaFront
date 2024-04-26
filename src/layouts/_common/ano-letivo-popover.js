import PropTypes from 'prop-types';

import { useEffect, useCallback, useContext } from 'react';
import _ from 'lodash';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// @mui
import MenuItem from '@mui/material/MenuItem';
import { Box, Dialog, Button, Typography } from '@mui/material';

// context
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';

// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import LoadingBox from 'src/components/helpers/loading-box';

// ----------------------------------------------------------------------

export default function AnoLetivoPopover({ sx }) {
  const { anosLetivos, buscaAnosLetivos, systemAnoLetivo, localStorageAnoLetivo, changeAnoLetivo } =
    useContext(AnosLetivosContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { bimestres, buscaBimestres } = useContext(BimestresContext);

  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);

  const popover = usePopover();
  const dialogCarregandoInformacoes = useBoolean();

  const handleChangeAnoLetivo = useCallback(
    (newValue) => {
      changeAnoLetivo(newValue);

      dialogCarregandoInformacoes.onTrue();
      popover.onClose();

      const promiseList = [
        buscaTurmas({ force: true }).then(async () => {
          await buscaBimestres({ force: true });
        }),
      ];

      // AGUARDE MINIMO DE 4s PARA VISUALIZAÇÃO DAS MENSAGENS
      Promise.all([_.delay(() => {}, 4000), ...promiseList]).then(() => {
        dialogCarregandoInformacoes.onFalse();
      });
    },
    [anosLetivos, popover]
  );

  const preparacaoInicial = useCallback(() => {
    if (!preparacaoInicialRunned.value) {
      preparacaoInicialRunned.onTrue();
      Promise.all([
        buscaAnosLetivos().then((_anosLetivos) => {
          if (!localStorageAnoLetivo) {
            changeAnoLetivo(_.first(_anosLetivos));
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
                selected={option.ano === (systemAnoLetivo?.ano ?? '')}
                onClick={() => handleChangeAnoLetivo(option)}
                sx={{ textAlign: 'center' }}
              >
                <Typography width="100%">{option.ano}</Typography>
              </MenuItem>
            ))}
          </CustomPopover>

          <Dialog open={dialogCarregandoInformacoes.value} disableEscapeKeyDown={true}>
            <Box p={5}>
              <LoadingBox
                texto="Carregando informações de turmas e bimestres"
                sx={{
                  height: 50,
                  textAlign: 'center',
                }}
              />
              <Typography textAlign="center" variant="body2" fontWeight="bold" mt={2}>
                então aplique os filtros da sua pesquisa novamente
              </Typography>
            </Box>
          </Dialog>
        </Box>
      )}
    </>
  );
}

AnoLetivoPopover.propTypes = {
  sx: PropTypes.object,
};
