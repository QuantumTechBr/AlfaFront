import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import AlunoQuickEditForm from './aluno-quick-edit-form';
import parse from 'date-fns/parse';
import { useAuthContext } from 'src/auth/hooks';


// ----------------------------------------------------------------------

export default function AlunoTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow, onSaveRow }) {
  const { checkPermissaoModulo } = useAuthContext();
  const { id, turma_ano_escolar, turma_nome, turma_turno, turma, turno, escola_nome, resultado_fase, nome, matricula, data_nascimento, created_at, updated_at, deleted_at } = row;

  const date = parse(data_nascimento, 'yyyy-MM-dd', new Date())

  let ano_escolar = '';

  if (turma_ano_escolar === '') {
    ano_escolar = turma_ano_escolar;
  } else {
    ano_escolar = (turma_ano_escolar) ? turma_ano_escolar.concat('º ') : '';
  }

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  const saveAndClose = (retorno=null) => {
    onSaveRow({...row, ...retorno});
    quickEdit.onFalse();
  }

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{matricula}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_escolar}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{turma_nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{turma_turno}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{escola_nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{resultado_fase}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{date.toLocaleDateString('pt-br')}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Edição Rápida" placement="top" arrow>
          {checkPermissaoModulo('aluno', 'editar') && 
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>}
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {checkPermissaoModulo('aluno', 'editar') && 
        <AlunoQuickEditForm id={row.id} open={quickEdit.value} onClose={quickEdit.onFalse} onSave={saveAndClose}  />
      }

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {checkPermissaoModulo('aluno', 'deletar') && 
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Deletar
        </MenuItem>}

        {checkPermissaoModulo('aluno', 'editar') && 
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Editar
        </MenuItem>}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir Estudante"
        content="Tem certeza que deseja excluir o estudante?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}

AlunoTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onSaveRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
