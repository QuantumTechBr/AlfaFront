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

import parse from 'date-fns/parse';
import { disableCache } from '@iconify/react';

// ----------------------------------------------------------------------

export default function AlunoTurmaTableRow({ row, selected, currentTurma, onSelectRow }) {
  const { id, nome, matricula, data_nascimento, alunos_turmas, created_at, updated_at, deleted_at } = row;

  let date = parse(data_nascimento, 'yyyy-MM-dd', new Date());

  let outrasTurmas = alunos_turmas.filter((at) => at.turma !=  currentTurma.id);
  let emOutraTurma = alunos_turmas.length == 0 ? false : outrasTurmas.length > 0 ;
  selected = emOutraTurma ? false : selected;
 
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox {...emOutraTurma ? {disabled:"disabled"} : null} checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{matricula}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{date.toLocaleDateString('pt-br')}</TableCell>
      </TableRow>
    </>
  );
}

AlunoTurmaTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  currentTurma: PropTypes.object,
  onSelectRow: PropTypes.func,
};
