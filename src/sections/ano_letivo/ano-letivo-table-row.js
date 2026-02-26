import PropTypes from 'prop-types';
// @mui
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function AnoLetivoTableRow({ row, onEditRow }) {
  const { ano, data_inicio, data_fim } = row;

  const popover = usePopover();

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={onEditRow}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(data_inicio)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(data_fim)}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={(e) => {
              e.stopPropagation();
              popover.onOpen(e);
            }}
          >
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
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Editar
        </MenuItem>
      </CustomPopover>
    </>
  );
}

AnoLetivoTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
};
