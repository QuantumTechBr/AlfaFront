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

import { necessidades_especiais } from 'src/_mock';

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

  const handleFilterPne = useCallback((event) => onFilters('pne', event.target.value), [onFilters]);
  const handleFilterPneItem = useCallback(
    (event) => onFilters('pneItem', event.target.value),
    [onFilters]
  );

  return (
    <Grid container spacing={2}>
      {anoLetivoOptions && anoLetivoOptions.length > 0 && (
        <Grid xs={6} md="auto">
          <FormControl sx={{ width: { xs: '100%', md: 120 } }}>
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
          <FormControl sx={{ width: { xs: '100%', md: 140 } }}>
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
        </Grid>
      )}

      {anoEscolarOptions && (
        <Grid xs={6} md="auto">
          <FormControl sx={{ width: { xs: '100%', md: 140 } }}>
            <InputLabel size="small">Ano de Ensino</InputLabel>
            <Select
              size="small"
              multiple
              value={filters.anoEscolar}
              onChange={handleFilterAnoEscolar}
              input={<OutlinedInput fullWidth label="Ano de Ensino" />}
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

      <Grid xs={6} md="auto">
        <FormControl sx={{ width: { xs: '100%', md: 180 } }}>
          <InputLabel size="small">PNE</InputLabel>
          <Select
            size="small"
            value={filters.pne}
            onChange={handleFilterPne}
            input={<OutlinedInput fullWidth label="Laudo PNE" />}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            <MenuItem key="pneOption_unset" value="-">
              Todos os estudantes
            </MenuItem>
            <MenuItem key="pneOption_semPne" value="false">
              Fora da Educação Especial
            </MenuItem>
            <MenuItem key="pneOption_comPne" value="true">
              Público-alvo da Educação Especial
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {filters.pne === 'true' && (
        <Grid xs={6} md="auto">
          <FormControl sx={{ width: { xs: '100%', md: 180 } }}>
            <InputLabel size="small">PNE</InputLabel>
            <Select
              size="small"
              value={filters.pneItem}
              onChange={handleFilterPneItem}
              input={<OutlinedInput fullWidth label="Laudo PNE" />}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              <MenuItem key="pneItemOption_unset" value="-">
                Todas as necessidades
              </MenuItem>

              {necessidades_especiais?.slice(1).map((option) => (
                <MenuItem key={`pneItemOption_${option}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
}

DashboardDDZTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  anoLetivoOptions: PropTypes.array,
  ddzOptions: PropTypes.array,
  anoEscolarOptions: PropTypes.array,
};
