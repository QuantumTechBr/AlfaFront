import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
// @mui
import Button from '@mui/material/Button';
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
// auth
import { useAuthContext } from 'src/auth/hooks';
import Label from 'src/components/label';
import { Alert } from '@mui/material';

// ----------------------------------------------------------------------

export default function UserTableRow({ row, onEditRow, onDeleteRow, quickEdit }) {
  const { checkPermissaoModulo } = useAuthContext();

  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    buscaFuncoes().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de funções');
    });
  }, [buscaFuncoes]);

  const confirm = useBoolean();
  const popover = usePopover();

  const deleteRow = () => {
    onDeleteRow();
    confirm.onFalse();
  };

  // const renderTurma = (row.turma ?? []).length > 0 ? row.turma?.reduce((acc, item) => acc + " Turma " + item.nome) : '';

  const renderFuncao = () => {
    if (row.funcao_usuario.length > 0) {
      return funcoes.find((f) => f.id == _.first(row.funcao_usuario).funcao.id)?.nome ?? '';
    }
    return '';
  };

  return (
    <>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {!errorMsg && (
        <TableRow hover>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.nome || row.profissional}</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.email}</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
            {renderFuncao()}
          </TableCell>
          <TableCell>
            <Label
              variant="soft"
              color={
                (row.status === 'true' && 'success') ||
                (row.status === 'pending' && 'warning') ||
                (row.status === 'false' && 'error') ||
                'default'
              }
            >
              {row.status === 'true' ? 'Ativo' : 'Inativo'}
            </Label>
          </TableCell>

          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <Tooltip title="Edição Rápida" placement="top" arrow>
              {checkPermissaoModulo('usuario', 'editar') && (
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
        {checkPermissaoModulo('usuario', 'editar') && (
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

        {checkPermissaoModulo('usuario', 'deletar') && (
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
        title="Excluir Usuário"
        content="Tem certeza que deseja excluir este usuário?"
        action={
          <Button variant="contained" color="error" onClick={deleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}

UserTableRow.propTypes = {
  row: PropTypes.object,
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  quickEdit: PropTypes.func,
};
