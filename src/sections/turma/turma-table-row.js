
import { useContext } from 'react';
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
import TurmaQuickEditForm from './turma-quick-edit-form';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { AuthContext } from 'src/auth/context/alfa';

// ----------------------------------------------------------------------

export default function TurmaTableRow({ row, showEscola, selected, onEditRow, onSelectRow, onDeleteRow, onSaveRow }) {
  const { id, nome, escola, ano_escolar, ano, turno, turmas_alunos, media, status, created_at, updated_at, deleted_at } = row;

  // console.log(row)
  
  const { user } = useContext(AuthContext);
  
  const turnoRender = turno.toLowerCase();

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const router = useRouter();

  const popover = usePopover();

  const listarAlunosTurma = () => {
    const turmaId = id
    // sessionStorage.setItem('filtroTurmaId', turmaId);
    // router.push(paths.dashboard.aluno.list);
  }

  const saveAndClose = (retorno=null) => {
    onSaveRow({...row, ...retorno});
    quickEdit.onFalse();
  }

  const checkProfessor = user?.funcao_usuario[0]?.funcao?.nome == 'PROFESSOR';

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        {showEscola && (<TableCell sx={{ whiteSpace: 'nowrap' }}>{escola.nome}</TableCell>)}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_escolar}° ano</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nome}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{turnoRender}</TableCell>

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
            {status === 'true' ?  'Ativo' : 'Inativo'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          
        {/*  TODO: trocar por teste de permissão */}
          {!checkProfessor &&
            <Tooltip title="Edição Rápida" placement="top" arrow>
              <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          }

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* TODO TRAZER PARA PÁGINA PRINCIPAL O MODAL, RETIRAR DE CADA LINHA */}
      <TurmaQuickEditForm id={row.id} open={quickEdit.value} onClose={quickEdit.onFalse} onSave={saveAndClose} />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
      {/*  TODO: trocar por teste de permissão */}
        {!checkProfessor &&
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
        }

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
        title="Excluir Turma"
        content="Tem certeza que deseja excluir a turma?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}

TurmaTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onSaveRow: PropTypes.func,
  row: PropTypes.object,
  showEscola: PropTypes.bool,
  selected: PropTypes.bool,
};
