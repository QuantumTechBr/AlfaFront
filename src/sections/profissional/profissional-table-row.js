import PropTypes from 'prop-types';
import { useMemo, useContext, useEffect, useState, useCallback } from 'react';
// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
//
import Typography from '@mui/material/Typography';
// auth
import { useAuthContext } from 'src/auth/hooks';
import { Alert } from '@mui/material';

// ----------------------------------------------------------------------

export default function ProfissionalTableRow({ row, onEditRow, onDeleteRow, quickEdit }) {
  const { checkPermissaoModulo } = useAuthContext();

  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    buscaFuncoes().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de funções');
    });
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
    });
  }, [buscaFuncoes, buscaEscolas, buscaZonas]);

  const confirm = useBoolean();

  const newDeleteRow = () => {
    onDeleteRow();
    confirm.onFalse();
  };

  const popover = usePopover();

  // const renderTurma = (row.turma ?? []).length > 0 ? row.turma?.reduce((acc, item) => acc + " Turma " + item.nome) : '';

  const renderFuncao = () => {
    if (row.funcao_usuario.length > 0) {
      return funcoes.find((f) => f.id == _.first(row.funcao_usuario).funcao.id)?.nome ?? '';
    }
    return '';
  };

  const renderZona = () => {
    if (row.zona) {
      return zonas.find((z) => z.id == row.zona)?.nome ?? '';
    }
    return '';
  };

  const renderEscola = () => {
    let list_retorno = [];
    if (row.funcao_usuario.length > 0) {
      list_retorno = escolas.filter((e) => row.escola.includes(e.id));
    }

    return (
      <>
        {list_retorno.map((li, index) => (
          <Typography key={index}>
            {li.nome}
            <br />
          </Typography>
        ))}
      </>
    );
  };

  return (
    <>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {!errorMsg && (
        <TableRow hover>
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.profissional}</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.email}</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
            {renderFuncao()}
          </TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{renderEscola()}</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{renderZona()}</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.turma ? 'SIM' : 'NÃO'}</TableCell>
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <Tooltip title="Edição Rápida" placement="top" arrow>
              {checkPermissaoModulo('profissionais', 'editar') && (
                <IconButton onClick={quickEdit}>
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
              )}
            </Tooltip>

            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>
        </TableRow>
      )}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {checkPermissaoModulo('profissionais', 'editar') && (
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        )}

        {checkPermissaoModulo('profissionais', 'deletar') && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Deletar
          </MenuItem>
        )}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir Profissional"
        content="Tem certeza que deseja excluir este profissional?"
        action={
          <Button variant="contained" color="error" onClick={newDeleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}

ProfissionalTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  quickEdit: PropTypes.func,
  row: PropTypes.object,
};
