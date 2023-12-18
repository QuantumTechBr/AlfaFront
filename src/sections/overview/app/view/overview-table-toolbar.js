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

// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSettingsContext } from 'src/components/settings';
import turmaMethods from 'src/sections/turma/turma-repository';
import { AuthContext } from 'src/auth/context/alfa';

// ----------------------------------------------------------------------

export default function OverviewTableToolbar({
  filters,
  onFilters,
  zonaOptions,
  escolaOptions,
  turmaOptions,
  bimestreOptions,
}) {

  const { user } = useContext(AuthContext);


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
        sx={
          {
            // p: 2.5,
            // pr: { xs: 2.5, md: 1 },
          }
        }
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
            {zonaOptions?.map((option) => (
              <MenuItem key={option.id} value={option}>
                <Checkbox disableRipple size="small" checked={filters.zona.includes(option)} />
                {option.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 450 },
          }}
        >
          <InputLabel size="small">Escola</InputLabel>

          <Select
            size="small"
            multiple
            value={filters.escola}
            onChange={handleFilterEscola}
            input={<OutlinedInput fullWidth label="Escola" />}
            renderValue={renderValueEscola}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240},
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
