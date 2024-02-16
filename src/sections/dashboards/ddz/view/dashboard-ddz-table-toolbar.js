import PropTypes from 'prop-types';

import { useCallback, useContext } from 'react';

// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';

// components
import { AuthContext } from 'src/auth/context/alfa';

// ----------------------------------------------------------------------

export default function DashboardDDZTableToolbar({
  filters,
  onFilters,
  anoLetivoOptions,
  ddzOptions,
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

  const handleFilterAnoEscolar = useCallback(
    (event) => onFilters('anoEscolar', event.target.value),
    [onFilters]
  );

  return (
    <Stack
      spacing={1}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
    >
      {anoLetivoOptions && !!anoLetivoOptions.length && (
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 120 },
          }}
        >
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
      )}
      {ddzOptions && (
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 140 },
          }}
        >
          <InputLabel size="small">DDZ</InputLabel>
          <Select
            size="small"
            disabled={user?.funcao_usuario?.length > 0 ? true : false}
            value={filters.zona}
            onChange={handleFilterZona}
            input={<OutlinedInput fullWidth label="DDZ" />}
            // renderValue={(selected) => selected.map((value) => value.nome).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {ddzOptions?.map((option) => (
              <MenuItem key={option.id} value={option}>
                {option.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {anoEscolarOptions && (
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 160 },
          }}
        >
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
      )}
    </Stack>
  );
}

DashboardDDZTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  anoLetivoOptions: PropTypes.array,
  ddzOptions: PropTypes.array,
  anoEscolarOptions: PropTypes.array,
};
