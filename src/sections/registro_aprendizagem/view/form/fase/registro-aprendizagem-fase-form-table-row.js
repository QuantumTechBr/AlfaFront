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
//
// import RegistroAprendizagemQuickEditForm from './registro-aprendizagem-quick-edit-form';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const { id, aluno, resultado, observacao, created_at, updated_at, deleted_at } = row;


  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{aluno.nome}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{observacao}</TableCell>

      </TableRow>

      {/* <RegistroAprendizagemQuickEditForm currentRegistroAprendizagem={row} open={quickEdit.value} onClose={quickEdit.onFalse} /> */}

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
        title="Excluir Avaliação"
        content="Tem certeza que deseja excluir a avaliação?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}

RegistroAprendizagemFaseFormTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
