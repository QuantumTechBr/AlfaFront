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

export default function AlunoEscolaTableRow({
  row,
  allAlunos,
  selected,
  currentEscola,
  onSelectRow,
}) {
  const { id, nome, data_nascimento, matricula, created_at, updated_at, deleted_at } = row;

  let date = parse(data_nascimento, 'yyyy-MM-dd', new Date());

  let outrasEscolas = allAlunos.filter((aluno) => {
    return (
      aluno.alunoEscolas.filter((ae) => {
        ae.escola != currentEscola.id;
      }).length > 0
    );
  });

  let emOutraEscola = allAlunos.length == 0 ? false : outrasEscolas.length > 0;
  selected = emOutraEscola ? false : selected;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox
            {...(emOutraEscola ? { disabled: 'disabled' } : null)}
            checked={selected}
            onClick={onSelectRow}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{matricula}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{date.toLocaleDateString('pt-br')}</TableCell>
      </TableRow>
    </>
  );
}

AlunoEscolaTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  allAlunos: PropTypes.array,
  currentEscola: PropTypes.object,
  onSelectRow: PropTypes.func,
};