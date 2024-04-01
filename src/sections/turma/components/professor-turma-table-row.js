import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Label from 'src/components/label';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// components
import Iconify from 'src/components/iconify';

import parse from 'date-fns/parse';
import { disableCache } from '@iconify/react';

// ----------------------------------------------------------------------

export default function ProfessorTurmaTableRow({ row, selected, currentTurma, onSelectRow }) {
  const { id, profissional, email, escola, funcao, status, funcao_usuario, permissao_usuario, created_at, updated_at, deleted_at } = row;

  const emOutraTurma = useBoolean(false)

   console.log(row)
  // let outrasTurmas = alunos_turmas.filter((at) => at.turma !=  currentTurma.id);
  // let emOutraTurma = alunos_turmas.length == 0 ? false : outrasTurmas.length > 0 ;
  // selected = emOutraTurma ? false : selected;
 
  return (
    <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox 
          disabled={row?.turma ? true : false} 
          checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{profissional}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{email}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{funcao?.nome ?? '-'}</TableCell>

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
            {status? 'Ativo' : 'Inativo'}
          </Label>
        </TableCell>
      </TableRow>
  );
}

ProfessorTurmaTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  currentTurma: PropTypes.object,
  onSelectRow: PropTypes.func,
};
