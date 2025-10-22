import PropTypes from 'prop-types';
import { useMemo } from 'react';
// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

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

export default function UserFuncaoTableRow({ row, professorTurmas, anosLetivos, onEditRow, onDeleteRow }) {
  const { checkPermissaoModulo } = useAuthContext();
  const {
    funcao_usuario_id,
    funcao,
    usuario_id,
    user_id,
    permissao,
    escola,
    zona,
    nome_exibicao
  } = row;

  const escolaOuZona = escola ? escola?.nome : zona ? zona?.nome : '';
  const isProfessor = funcao?.nome === 'PROFESSOR' || nome_exibicao === 'PROFESSOR';

  const confirm = useBoolean();
  const popover = usePopover();

  const turmasEscola = useMemo(() => {
    if (!isProfessor || !escola || !professorTurmas) return [];
    return professorTurmas.filter(
      (pt) => (pt?.turma?.escola?.id || pt?.turma?.escola_id) === escola.id
    );
  }, [isProfessor, escola, professorTurmas]);

  const deleteRow = () => {
    onDeleteRow();
    confirm.onFalse();
  };

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {nome_exibicao ?? funcao?.nome ?? ''}
          
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{escolaOuZona} </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {isProfessor && turmasEscola.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
              {turmasEscola.map((pt) => (
                <Chip
                  key={pt.id}
                  label={`${pt.turma?.ano_escolar ? `${pt.turma.ano_escolar}` : ''}${pt.turma.nome ?? ''}${pt.turma?.turno ? ` - ${pt.turma.turno}` : ''}${pt.turma?.ano_id ? ` - ${anosLetivos.find(ano => ano.id == pt.turma.ano_id)?.ano ?? ''}` : ''}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Stack>
          )}
        </TableCell>
        
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Edição Rápida" placement="top" arrow>
            {checkPermissaoModulo('usuario', 'editar') && (
              <IconButton onClick={onEditRow}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            )}
          </Tooltip>
          {(checkPermissaoModulo('aluno', 'deletar') || checkPermissaoModulo('usuario', 'editar')) && (
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
        title="Excluir Função do Usuário"
        content="Tem certeza que deseja essa função?"
        action={
          <Button variant="contained" color="error" onClick={deleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}

UserFuncaoTableRow.propTypes = {
  row: PropTypes.object,
  professorTurmas: PropTypes.array,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};
