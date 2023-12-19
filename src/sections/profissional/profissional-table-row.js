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
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import ProfissionalQuickEditForm from './profissional-quick-edit-form';


// ----------------------------------------------------------------------

export default function ProfissionalTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const { id, profissional, email, funcao, escola, zona , turma, status } = row;

  const user = {
    id: row.id,
    nome: row.profissional,
    email: row.email,
    funcao: row.funcao.id,
    escola: row.escola?.id,
    zona: row.zona?.id,
    turma: row.turma,
    status: row.status
  }


  const profissionalRender = profissional.toLowerCase();

  const confirm = useBoolean();

  const newDeleteRow = () => {
    onDeleteRow();
    confirm.onFalse();
  }

  const quickEdit = useBoolean();

  const popover = usePopover();

  let turmaRender = '';
  turma?.map((item) => {
    turmaRender += " Turma " + item.nome;
  });

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{profissional}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{email}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{funcao.nome}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{escola?.nome}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{zona?.nome}</TableCell>

        <Tooltip title={turmaRender} enterDelay={500} leaveDelay={200}>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.turma?.length > 0 ? 'SIM' : 'NÃO'}</TableCell>
        </Tooltip>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <ProfissionalQuickEditForm currentUser={user} open={quickEdit.value} onClose={quickEdit.onFalse} />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
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

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Editar
        </MenuItem>
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
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
