import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';

// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
// components
import Iconify from 'src/components/iconify';
// ----------------------------------------------------------------------

export default function DashboardGridFilters({ filters, onFilters }) {
  const handleFilterSearch = useCallback(
    (event) => {
      onFilters('pesquisa', event.target.value);
    },
    [onFilters]
  );
  const handleBimestreFilter = useCallback(
    (event) => {
      setBimestre(event.target.value);
      onFilters('bimestre', event.target.value);
    },
    [onFilters]
  );

  const [bimestre, setBimestre] = useState('');


  return (
    <Stack
      spacing={1}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        p: 2.5,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={0} sx={{ width: "80%" }}>
        <TextField
          fullWidth
          value={filters.pesquisa}
          onChange={handleFilterSearch}
          placeholder="Pesquisar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Stack flexGrow={1}>
        <FormControl >
          <InputLabel id="bimestre-filter-label">Bimestre</InputLabel>
          <Select
              sx={{}}
              id="bimestres_filter"
              name="bimestre"
              label="Bimestre"
              labelId="bimestre-filter-label"
              value={bimestre}
              onChange={(event) => handleBimestreFilter(event)}
              input={<OutlinedInput label="Bimestre" />}
            >
              <MenuItem key='' value=''>
                  Todos
              </MenuItem>
              {[1, 2, 3, 4].map((i) => (
                <MenuItem key={i} value={i}>
                  {i}º
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}

DashboardGridFilters.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
};
