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

export default function DashboardRedeTableToolbar({
  filters,
  onFilters,
  anoLetivoOptions,
  ddzOptions,
  escolaOptions,
  anoTurmaOptions,
  bimestreOptions,
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

  const handleFilterTurma = useCallback(
    (event) => {
      onFilters(
        'turma',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterBimestre = useCallback(
    (event) => {
      onFilters('bimestre', event.target.value);
    },
    [onFilters]
  );

  const renderValueTurma = (selected) =>
    selected.map((item) => `${item.ano_escolar}º ${item.nome}`).join(', ');

  const renderValueEscola = (selected) =>
    selected.map((item) => escolaOptions.find((option) => option.id == item.id)?.nome).join(', ');

  return (
    <>
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
              width: { xs: 1, md: 120 },
            }}
          >
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
        )}
        {escolaOptions && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 300 },
            }}
          >
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
        )}

        {anoTurmaOptions && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 230 },
            }}
          >
            <InputLabel size="small">Ano - Turma</InputLabel>

            <Select
              size="small"
              multiple
              value={filters.turma}
              onChange={handleFilterTurma}
              input={<OutlinedInput fullWidth label="Ano - Turma" />}
              renderValue={renderValueTurma}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {anoTurmaOptions?.map((option) => (
                <MenuItem key={option.id} value={option}>
                  <Checkbox disableRipple size="small" checked={filters.turma.includes(option)} />
                  {` ${option.ano_escolar}º ${option.nome} (${option.turno}) ${
                    filters.escola.length != 1 ? ` (${option.escola.nome})` : ''
                  } `}
                </MenuItem>
              ))}
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
            <InputLabel size="small">Bimestre</InputLabel>
            <Select
              size="small"
              value={filters.bimestre}
              onChange={handleFilterBimestre}
              input={<OutlinedInput fullWidth label="Bimestre" />}
              renderValue={(selected) => `${selected.ordinal}º`}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {bimestreOptions.map((option) => {
                return (
                  <MenuItem key={`bimestre_${option.id}`} value={option}>
                    {`${option.ordinal}º`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}
      </Stack>
    </>
  );
}

DashboardRedeTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  anoLetivoOptions: PropTypes.array,
  ddzOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
  anoTurmaOptions: PropTypes.array,
  bimestreOptions: PropTypes.array,
};
