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

import Iconify from 'src/components/iconify';


// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseTableRow({
  row,
  
  onEditRow,
  
}) {
  const {
    id,
    ano_letivo,
    ano_escolar,
    nome,
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
      <TableRow hover>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_letivo}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_escolar}°</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nome}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{turno}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{alunos}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{bimestre.ordinal}&ordm;</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{escola}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Editar" placement="top" arrow>
            <IconButton color="inherit" onClick={onEditRow}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      
    </>
  );
}

RegistroAprendizagemFaseTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  
};
