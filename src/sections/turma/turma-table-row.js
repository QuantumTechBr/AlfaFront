import { useContext } from 'react';
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
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function TurmaTableRow({ row, showEscola, quickEdit, onEditRow, onDeleteRow }) {
  const {
    id,
    nome,
    escola,
    ano_escolar,
    ano,
    turno,
    turmas_alunos,
    media,
    status,
    created_at,
    updated_at,
    deleted_at,
  } = row;

  const { checkPermissaoModulo, checkFuncao } = useAuthContext();

  const turnoRender = turno.toLowerCase();

  const confirm = useBoolean();
  const popover = usePopover();

  const deleteRow = () => {
    onDeleteRow();
    confirm.onFalse();
  };

  const listarAlunosTurma = () => {
    const turmaId = id;
    // sessionStorage.setItem('filtroTurmaId', turmaId);
    // router.push(paths.dashboard.aluno.list);
  };

  const isProfessor = checkFuncao('PROFESSOR');

  return (
    <>
      <TableRow hover>

        {showEscola && <TableCell sx={{ whiteSpace: 'nowrap' }}>{escola.nome}</TableCell>}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_escolar}° ano</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
          {turnoRender}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano.ano}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {turmas_alunos?.length > 0 ? turmas_alunos.length : 0}
          {/* <Button
              onClick={listarAlunosTurma}
              variant="contained"
              sx={{
                margin: 1,
                bgcolor: "#00A5AD",
                minWidth: 40,
                width: 40,
              }}
            >
            <Iconify icon="carbon:user-filled" />
            </Button> */}
        </TableCell>

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
          {/*  TODO: trocar por teste de permissão */}
          {!isProfessor && (
            <Tooltip title="Edição Rápida" placement="top" arrow>
              {checkPermissaoModulo('turma', 'editar') && (
                <IconButton onClick={quickEdit}>
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
              )}
            </Tooltip>
          )}

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
        {/*  TODO: trocar por teste de permissão */}
        {checkPermissaoModulo('turma', 'editar') && (
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
        {!isProfessor && checkPermissaoModulo('turma', 'deletar') && (
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
        title="Excluir Turma"
        content="Tem certeza que deseja excluir a turma?"
        action={
          <Button variant="contained" color="error" onClick={deleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}

TurmaTableRow.propTypes = {
  row: PropTypes.object,
  showEscola: PropTypes.bool,
  quickEdit: PropTypes.func,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};
