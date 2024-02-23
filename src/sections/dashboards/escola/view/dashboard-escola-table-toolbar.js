import PropTypes from 'prop-types';

import { useCallback, useContext } from 'react';

// @mui
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Unstable_Grid2';


// components
import { AuthContext } from 'src/auth/context/alfa';

// ----------------------------------------------------------------------

export default function DashboardEscolaTableToolbar({
  filters,
  onFilters,
  anoLetivoOptions,
  ddzOptions,
  escolaOptions,
  anoEscolarOptions,
}) {
  const { user } = useContext(AuthContext);

  const handleFilterAnoLetivo = useCallback(
    (event) => onFilters('anoLetivo', event.target.value),
    [onFilters]
  );

  const handleFilterZona = useCallback(
    (event) => {
      onFilters(
        'zona',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterEscola = useCallback(
    (event) => {
      onFilters(
        'escola',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterAnoEscolar = useCallback(
    (event) => onFilters('anoEscolar', event.target.value),
    [onFilters]
  );

  const renderValueEscola = (selected) =>
    selected.map((item) => escolaOptions.find((option) => option.id == item.id)?.nome).join(', ');

  return (
    <Grid container spacing={2}>
      {anoLetivoOptions && !!anoLetivoOptions.length && (
        <Grid xs={6} md="auto">
        <FormControl sx={{ width: {xs: "100%", md: 120 } }}>
          <InputLabel size="small">Ano Letivo</InputLabel>

          <Select
            size="small"
            value={filters.anoLetivo}
            onChange={handleFilterAnoLetivo}
            input={<OutlinedInput fullWidth label="Ano Letivo" />}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {anoLetivoOptions.map((option) => (
              <MenuItem key={option.id} value={option}>
                {option.ano}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </Grid>
      )}
      {ddzOptions && (
        <Grid xs={6} md="auto">
        <FormControl sx={{ width: {xs: "100%", md: 140 } }}>
          <InputLabel size="small">DDZ</InputLabel>
          <Select
            size="small"
            multiple
            disabled={user?.funcao_usuario?.length > 0 ? true : false}
            value={filters.zona}
            onChange={handleFilterZona}
            input={<OutlinedInput fullWidth label="DDZ" />}
            renderValue={(selected) => selected.map((value) => value.nome).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {ddzOptions?.map((option) => (
              <MenuItem key={option.id} value={option}>
                <Checkbox disableRipple size="small" checked={filters.zona.includes(option)} />
                {option.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </Grid>
      )}
      {escolaOptions && (
        <Grid xs={6} md="auto">
        <FormControl sx={{ width: {xs: "100%", md: 300 } }}>
          <InputLabel size="small">Escolas</InputLabel>

          <Select
            size="small"
            multiple
            value={filters.escola}
            onChange={handleFilterEscola}
            input={<OutlinedInput fullWidth label="Escolas" />}
            renderValue={renderValueEscola}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {escolaOptions?.map((option) => (
              <MenuItem key={option.id} value={option}>
                <Checkbox disableRipple size="small" checked={filters.escola.includes(option)} />
                {option.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </Grid>
      )}

      {anoEscolarOptions && (
        <Grid xs={6} md="auto">
        <FormControl sx={{ width: {xs: "100%", md: 160 } }}>
          <InputLabel size="small">Ano Escolar</InputLabel>
          <Select
            size="small"
            multiple
            value={filters.anoEscolar}
            onChange={handleFilterAnoEscolar}
            input={<OutlinedInput fullWidth label="Ano Escolar" />}
            renderValue={(selected) =>
              `${_.sortBy(selected, [(opt) => opt])
                .map((value) => `${value}º`)
                .join(', ')} ano`
            }
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {anoEscolarOptions?.map((option) => (
              <MenuItem key={`anoEscolarOption_${option}`} value={option}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.anoEscolar.includes(option)}
                />
                {option}º ano
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </Grid>
      )}
    </Grid>
  );
}

DashboardEscolaTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  anoLetivoOptions: PropTypes.array,
  ddzOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
  anoEscolarOptions: PropTypes.array,
};
