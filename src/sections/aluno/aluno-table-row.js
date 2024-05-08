import PropTypes from 'prop-types';
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
//
import parse from 'date-fns/parse';
import { useAuthContext } from 'src/auth/hooks';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

export default function AlunoTableRow({ row, quickEdit, onEditRow, onDeleteRow }) {
  const { checkPermissaoModulo } = useAuthContext();
  const {
    id,
    necessidades_especiais,
    turma_ano_escolar,
    turma_nome,
    turma_turno,
    turma,
    turno,
    escola_nome,
    resultado_fase,
    nome,
    matricula,
    data_nascimento,
    created_at,
    updated_at,
    deleted_at,
  } = row;

  const date = parse(data_nascimento, 'yyyy-MM-dd', new Date());

  let ano_escolar = '';

  if (turma_ano_escolar === '') {
    ano_escolar = turma_ano_escolar;
  } else {
    ano_escolar = turma_ano_escolar ? turma_ano_escolar.concat('º ') : '';
  }

  const confirm = useBoolean();
  const popover = usePopover();

  const deleteRow = () => {
    onDeleteRow();
    confirm.onFalse();
  };

  const nomeAluno = () => {
    return (
      <Box>
        {nome}
        {necessidades_especiais != '' && (
          <Tooltip title={necessidades_especiais}>
            <Iconify
              icon="mdi:alphabet-n-circle-outline"
              sx={{
                ml: 1,
              }}
            />
          </Tooltip>
        )}
      </Box>
    );
  };

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nomeAluno()}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{matricula}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{escola_nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {ano_escolar} {turma_nome}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
          {turma_turno}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{resultado_fase}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{date.toLocaleDateString('pt-br')}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Edição Rápida" placement="top" arrow>
            {checkPermissaoModulo('aluno', 'editar') && (
              <IconButton onClick={quickEdit}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            )}
          </Tooltip>
          {checkPermissaoModulo('aluno', 'deletar') || checkPermissaoModulo('aluno', 'editar') && (
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
          )}
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {checkPermissaoModulo('aluno', 'editar') && (
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

        {checkPermissaoModulo('aluno', 'deletar') && (
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
        title="Excluir Estudante"
        content="Tem certeza que deseja excluir o estudante?"
        action={
          <Button variant="contained" color="error" onClick={deleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}

AlunoTableRow.propTypes = {
  row: PropTypes.object,
  quickEdit: PropTypes.func,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};
