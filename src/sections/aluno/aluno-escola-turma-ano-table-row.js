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

export default function AlunoEscolaTurmaAnoTableRow({ row, onEditRow, onDeleteRow }) {
  const { checkPermissaoModulo } = useAuthContext();
  const {
    id,
    ano_letivo,
    escola,
    turma,
  } = row;

  let ano_escolar = '';
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
        {!!necessidades_especiais && (
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
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{escola?.nome ?? ''}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{turma?.nome ? `${turma?.ano_escolar}º ${turma?.nome} (${turma?.turno})` : ''} </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_letivo?.ano ?? ''}</TableCell>
        
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Edição Rápida" placement="top" arrow>
            {checkPermissaoModulo('aluno', 'editar') && (
              <IconButton onClick={onEditRow}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            )}
          </Tooltip>
          {(checkPermissaoModulo('aluno', 'deletar') || checkPermissaoModulo('aluno', 'editar')) && (
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

AlunoEscolaTurmaAnoTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};
