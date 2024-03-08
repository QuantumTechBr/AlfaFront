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
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

// auth
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function UserTableRow({
  row,
  onEditRow,
  onDeleteRow,
  quickEdit,
}) {
  const { checkPermissaoModulo } = useAuthContext();
  const {
    nome,
    email,
    funcao_usuario,
    status,
  } = row;

  const funcaoNome =
    funcao_usuario?.length > 0 && funcao_usuario[0].funcao ? funcao_usuario[0].funcao.nome : '';

  const confirm = useBoolean();
  const popover = usePopover();

  const deteleRow = () => {
    onDeleteRow();
    confirm.onFalse();
  };

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{email}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{funcaoNome}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'true' && 'success') ||
              (status === 'pending' && 'warning') ||
              (status === 'false' && 'error') ||
              'default'
            }
          >
            {status === 'true' ? 'Ativo' : 'Inativo'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Edição Rápida" placement="top" arrow>
            {checkPermissaoModulo('usuario', 'editar') && (
              <IconButton onClick={() => quickEdit(row)}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            )}
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
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
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir Usuário"
        content="Tem certeza que deseja excluir o usuário?"
        action={
          <Button variant="contained" color="error" onClick={deteleRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}

UserTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  quickEdit: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
