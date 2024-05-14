import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import { useFormContext, Controller } from 'react-hook-form';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormTableToolbar({
  filters,
  onFilters,
  anoLetivoOptions,
  escolaOptions,
  turmaOptions,
  bimestreOptions,
  showSearch,
}) {
  const handleFilterAnoLetivo = useCallback(
    (event) => onFilters('anoLetivo', event.target.value),
    [onFilters]
  );
  const handleFilterEscola = useCallback(
    (event) => onFilters('escola', event.target.value),
    [onFilters]
  );
  const handleFilterTurma = useCallback(
    (event) =>
      onFilters(
        'turma',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      ),
    [onFilters]
  );

  const handleFilterBimestre = useCallback(
    (event) =>
      onFilters(
        'bimestre',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      ),
    [onFilters]
  );

  const handleFilterPesquisa = useCallback(
    (event) => {
      onFilters('pesquisa', event.target.value);
    },
    [onFilters]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        {anoLetivoOptions && !!anoLetivoOptions.length && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 120 },
            }}
          >
            <InputLabel>Ano Letivo</InputLabel>

            <Select
              value={filters.anoLetivo}
              onChange={handleFilterAnoLetivo}
              input={<OutlinedInput label="Ano Letivo" />}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {anoLetivoOptions.map((option) => {
                return (
                  <MenuItem key={option.id} value={option}>
                    {`${option.ano}`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}

        {escolaOptions && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 300 },
            }}
          >
            <InputLabel>Escola</InputLabel>

            <Select
              value={filters.escola}
              onChange={handleFilterEscola}
              input={<OutlinedInput label="Escola" />}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {escolaOptions.map((option) => {
                return (
                  <MenuItem key={option.id} value={option}>
                    {`${option.nome}`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}

        {turmaOptions && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 210 },
            }}
          >
            <InputLabel>Turma</InputLabel>

            <Select
              value={filters.turma}
              onChange={handleFilterTurma}
              input={<OutlinedInput label="Turma" />}
              renderValue={(selected) =>
                `${selected.ano_escolar}º ${selected.nome} (${selected.turno})`
              }
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {turmaOptions.map((option) => {
                return (
                  <MenuItem key={option.id} value={option}>
                    {` ${option.ano_escolar}º ${option.nome} (${option.turno})`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}

        {bimestreOptions && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 120 },
            }}
          >
            <InputLabel>Bimestre</InputLabel>

            <Select
              value={filters.bimestre}
              onChange={handleFilterBimestre}
              input={<OutlinedInput label="Bimestre" />}
              renderValue={(selected) => `${selected.ordinal}º`}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {bimestreOptions.map((option) => {
                return (
                  <MenuItem key={option.id} value={option}>
                    {`${option.ordinal}º`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}

        {showSearch && (
          <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
            <TextField
              fullWidth
              value={filters.pesquisa}
              onChange={handleFilterPesquisa}
              placeholder="Pesquisar aluno..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        )}
      </Stack>
    </>
  );
}

RegistroAprendizagemFaseFormTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  anoLetivoOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
  turmaOptions: PropTypes.array,
  bimestreOptions: PropTypes.array,
  showSearch: PropTypes.bool,
};
