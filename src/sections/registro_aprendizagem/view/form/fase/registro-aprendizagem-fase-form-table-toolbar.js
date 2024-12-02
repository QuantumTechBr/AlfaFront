import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import { useFormContext, Controller } from 'react-hook-form';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { CSVLink } from "react-csv";
import { getValue } from '@mui/system';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormTableToolbar({
  filters,
  onFilters,
  anoLetivoOptions,
  escolaOptions,
  turmaOptions,
  bimestreOptions,
  showSearch,
  nomeArquivo,
  dataArquivo,
  getRegistros,
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
  const popover = usePopover();
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
          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          arrow="left-top"
        // sx={{ width: 140 }}
        >
          <MenuItem>
            <CSVLink className='downloadCSVBtn' filename={nomeArquivo} data={dataArquivo} >
              Exportar para CSV
            </CSVLink>
          </MenuItem>

        </CustomPopover>
        <Button
              disabled={filters.anoLetivo && filters.escola && filters.turma && filters.bimestre ? false : true}
              variant="contained"
              sx={{
                width: {
                  xs: '100%',
                  md: '15%',
                },
              }}
              onClick={() => {
                getRegistros();
              }}
            >
              Aplicar filtros
            </Button>
      </Stack>
      {showSearch && (
        <Stack
          spacing={2}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          direction={{
            xs: 'column',
            md: 'row',
          }}
          sx={{
            pb: 2.5,
            pl: 2.5,

            pr: { xs: 2.5, md: 1 },
          }}
        >
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
