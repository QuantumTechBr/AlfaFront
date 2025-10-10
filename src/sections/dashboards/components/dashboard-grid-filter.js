import PropTypes from 'prop-types';
import { use, useCallback, useState, useContext, useEffect } from 'react';
import _ from 'lodash';

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
// contexts
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';
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
  const { bimestres, buscaBimestres } = useContext(BimestresContext);

  useEffect(() => {
    buscaBimestres();
  }, []); 

  useEffect(() => {
    if (filters.bimestre) {
      setBimestre(filters.bimestre);
    } else {
      const hoje = new Date();
      let bimestreAtual = _.first(bimestres);

      bimestres?.forEach((bim) => {
        let dataInicio = null;
        let dataFim = null;
        if(bim.data_inicio) {
          dataInicio = new Date(bim.data_inicio);
        }
        if(bim.data_fim) {
          dataFim = new Date(bim.data_fim);
        }
        if (hoje >= dataInicio && hoje <= dataFim && bim.ordinal > bimestreAtual.ordinal) {
          bimestreAtual = bim;
        }
      });
      if(bimestreAtual) {
        setBimestre(bimestreAtual.ordinal);
        onFilters('bimestre', bimestreAtual.ordinal);
      }
    }
  }, [filters.bimestre, bimestres]);


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
