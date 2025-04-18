import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useAuthContext } from 'src/auth/hooks';

// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { substr } from 'stylis';

// ----------------------------------------------------------------------

export default function UserTableRow({ row, quickEdit, onEditRow, onDeleteRow }) {
  const { checkPermissaoModulo } = useAuthContext();
  let funcaoNome = '';
  for (const funcao_usuario of row.funcao_usuario) {
    if (funcao_usuario.nome_exibicao && !funcaoNome.includes(funcao_usuario.nome_exibicao)) {
      funcaoNome = funcaoNome + ', ' + funcao_usuario.nome_exibicao;
    } else if (funcao_usuario.funcao?.nome && !funcaoNome.includes(funcao_usuario.funcao.nome)) {
      funcaoNome = funcaoNome + ', ' + funcao_usuario.funcao.nome;
    }
    
  }
  for (const permissao_usuario of row.permissao_usuario) {
    if (['ADMIN', 'SUPERADMIN'].includes(permissao_usuario?.nome) && !funcaoNome.includes(permissao_usuario.nome)) {
      funcaoNome = funcaoNome + ', ' + (permissao_usuario.nome);
    }
  }

  funcaoNome = funcaoNome.replace(/^, /, '');
  funcaoNome = funcaoNome.replace(/, $/, '');



  const confirm = useBoolean();
  const popover = usePopover();

  const deleteRow = () => {
    onDeleteRow();
    confirm.onFalse();
  };

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.email}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Tooltip title={funcaoNome}>
            {funcaoNome.length > 20 ? funcaoNome.substring(0, 30) + '...' :  funcaoNome}
          </Tooltip>
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

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

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
        content="Tem certeza que deseja excluir o usuário?"
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
  quickEdit: PropTypes.func,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};
