import PropTypes from 'prop-types';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
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

export default function RegistroAprendizagemDiagnosticoTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const { id, ano_escolar, ano, nome, turno, turmas_alunos, periodo, escola, created_at, updated_at, deleted_at } = row;

  const router = useRouter();

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  const editarRegistros = () => {
    const dadosDiagnostico = {
      turma: id,
      periodo: periodo,
    }
    sessionStorage.setItem('dadosDiagnosticoTurma', dadosDiagnostico.turma);
    sessionStorage.setItem('dadosDiagnosticoPeriodo', dadosDiagnostico.periodo);
    router.push(paths.dashboard.registro_aprendizagem.new_diagnostico);
  }

  return (
    <>
      <TableRow hover selected={selected} >
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano.ano}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_escolar}°</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nome}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{turno}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{turmas_alunos.length}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{periodo}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{escola.nome}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Editar" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={editarRegistros}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
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

RegistroAprendizagemDiagnosticoTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
