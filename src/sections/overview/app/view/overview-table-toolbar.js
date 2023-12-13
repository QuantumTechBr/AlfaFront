import PropTypes from 'prop-types';

import { useEffect, useState, useCallback, useContext } from 'react';

// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, TextField } from '@mui/material';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

// ----------------------------------------------------------------------

export default function OverviewTableToolbar({
  filters,
  onFilters,
  zonaOptions,
  escolaOptions,
  turmaOptions,
  bimestreOptions,
}) {
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
    (newValue) => {
      onFilters('escola', newValue);
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
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 150 },
          }}
        >
          <InputLabel size="small">DDZ</InputLabel>
          <Select
            size="small"
            multiple
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
            {zonaOptions?.map((option) => (
              <MenuItem key={option.id} value={option}>
                <Checkbox disableRipple size="small" checked={filters.zona.includes(option)} />
                {option.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {escolaOptions.length > 0 && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 450 },
            }}
          >
            <Autocomplete
              fullWidth
              size="small"
              multiple
              limitTags={1}
              options={escolaOptions}
              disableCloseOnSelect
              onChange={(event, newValue) => {
                handleFilterEscola(newValue);
              }}
              getOptionLabel={(option) => option.nome}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.nome}
                </li>
              )}
              // style={{ width: 500 }}
              renderInput={(params) => {
                return <TextField {...params} label="Escolas" placeholder="Digite para buscar" />;
              }}
            />
          </FormControl>
        )}

        {turmaOptions && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 135 },
            }}
          >
            <InputLabel size="small">Turma</InputLabel>

            <Select
              size="small"
              multiple
              value={filters.turma}
              onChange={handleFilterTurma}
              input={<OutlinedInput fullWidth label="Turma" />}
              renderValue={renderValueTurma}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {turmaOptions?.map((option) => (
                <MenuItem key={option.id} value={option}>
                  <Checkbox disableRipple size="small" checked={filters.turma.includes(option)} />
                  {` ${option.ano_escolar}º ${option.nome}`}
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

OverviewTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  zonaOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
  turmaOptions: PropTypes.array,
  bimestreOptions: PropTypes.array,
};
