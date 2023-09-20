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
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}) {
  const {
    id,
    ano_escolar,
    ano_serie,
    turma,
    turno,
    alunos,
    bimestre,
    escola,
    created_at,
    updated_at,
    deleted_at,
  } = row;

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_escolar}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_serie}°</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{turma.nome}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{turno}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{alunos}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{bimestre}&ordm;</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{escola}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Editar" placement="top" arrow>
            <IconButton color="inherit" onClick={onEditRow}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

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

RegistroAprendizagemFaseTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
