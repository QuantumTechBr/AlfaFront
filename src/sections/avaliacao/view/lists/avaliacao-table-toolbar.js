import PropTypes from 'prop-types';
import { useCallback, useState, useEffect } from 'react';
import { usePopover } from 'src/components/custom-popover';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';
// components

// ----------------------------------------------------------------------

export default function AvaliacaoTableToolbar({
  filters,
  onFilters,
  anoLetivoOptions,
  zonaOptions,
  escolaOptions,
  turmaOptions,
  bimestreOptions,
  periodoOptions,
  export_type,
}) {

  const [escolasFiltered, setEscolasFiltered] = useState([]);
  const [escolasACTotal, setEscolasACTotal] = useState([]);

  useEffect(() => {
    const escolasAC = [];
    escolaOptions.map((escola) => {
      const ea = {
        label: escola.nome,
        id: escola.id,
      }
      escolasAC.push(ea)
    })
    setEscolasFiltered(escolasAC);
    setEscolasACTotal(escolasAC);
  }, [escolaOptions]);
  
  const popover = usePopover();

  const handleFilterAnoLetivo = useCallback(
    (event) => onFilters('ano', event.target.value),
    [onFilters]
  );

  const handleFilterDdz = useCallback(
    (event, newValue) => {
      onFilters(
        'zona',
        newValue,
      );
    },
    [onFilters]
  );

  const handleFilterEscola = useCallback(
    (event, newValue) => {
      onFilters(
        'escola',
        newValue,
      );
    },
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

  const handleFilterPeriodo = useCallback(
    (event) =>
      onFilters(
        'periodo',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      ),
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
              value={filters.ano}
              onChange={handleFilterAnoLetivo}
              input={<OutlinedInput label="Ano Letivo" />}
            >
              {anoLetivoOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.ano}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {zonaOptions && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 300 },
            }}
          >
            <Autocomplete
              multiple
              disablePortal
              id="zona"
              options={zonaOptions}
              sx={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label="DDZ" />}
              value={filters.zona}
              onChange={handleFilterDdz}
            />
          </FormControl>
        )}

        {escolasFiltered && (
          <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 300 },
          }}
        >

          <Autocomplete
            multiple
            disablePortal
            id="escola"
            options={escolasFiltered}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Escola" />}
            value={filters.escola}
            onChange={handleFilterEscola}
          />
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
              multiple
              value={filters.turma}
              onChange={handleFilterTurma}
              input={<OutlinedInput label="Turma" />}
              renderValue={(selected) =>
                selected
                  .map((item) => `${item.ano_escolar}º ${item.nome} (${item.turno})`)
                  .join(', ')
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
                    <Checkbox disableRipple size="small" checked={filters.turma.includes(option)} />
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
              multiple
              value={filters.bimestre}
              onChange={handleFilterBimestre}
              input={<OutlinedInput label="Bimestre" />}
              renderValue={(selected) => selected.map((item) => `${item.ordinal}º`).join(', ')}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {bimestreOptions.map((option) => {
                return (
                  <MenuItem key={option.id} value={option}>
                    <Checkbox
                      disableRipple
                      size="small"
                      checked={filters.bimestre.includes(option)}
                    />
                    {`${option.ordinal} º`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}

        {periodoOptions && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 120 },
            }}
          >
            <InputLabel>Perfil</InputLabel>

            <Select
              multiple
              value={filters.periodo}
              onChange={handleFilterPeriodo}
              input={<OutlinedInput label="Perfil" />}
              renderValue={(selected) => selected.map((item) => `${item}`).join(', ')}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {periodoOptions.map((option) => {
                return (
                  <MenuItem key={option} value={option}>
                    <Checkbox
                      disableRipple
                      size="small"
                      checked={filters.periodo.includes(option)}
                    />
                    {`${option}`}
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

AvaliacaoTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  anoLetivoOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
  turmaOptions: PropTypes.array,
  bimestreOptions: PropTypes.array,
  periodoOptions: PropTypes.array,
  export_type: PropTypes.string,
};
