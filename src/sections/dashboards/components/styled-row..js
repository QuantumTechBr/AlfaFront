// TODO IMPLEMENTAR LOCAL UNICO
'use client';
import PropTypes from 'prop-types';

import { TableRow } from '@mui/material';
import { styled } from '@mui/system';

export default function StyledTableRow() {
  return styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
}

StyledTableRow.propTypes = {};
