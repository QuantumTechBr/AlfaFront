import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function PlanoIntervencaoTableToolbar({
  filters,
  onFilters,
  //
  roleOptions,
  zonaOptions,
  escolaOptions,
  anoLetivoOptions
}) {
  const popover = usePopover();

  const handleFilterNome = useCallback(
    (event) => {
      onFilters('nome', event.target.value);
    },
    [onFilters]
  );

  const handleFilterRole = useCallback(
    (event) => {
      onFilters(
        'role',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
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

  const handleFilterAnoLetivo = useCallback(
    (event) => {
      onFilters(
        'anoLetivo',
        event.target.value
      );
    },
    [onFilters]
  );

  const renderValueFuncao = (selected) =>
    selected.map((funcaoId) => {
      return roleOptions.find((option) => option.id == funcaoId)?.nome;
    }).join(', ');

  const renderValueEscola = (selected) => 
    selected.map((escolaId) => {
      return escolaOptions.find((option) => option.id == escolaId)?.nome;
    }).join(', ');


  const renderValueZona = (selected) => 
    selected.map((zonaId) => {
      return zonaOptions.find((option) => option.id == zonaId)?.nome;
    }).join(', ');


  // const renderValueAnoLetivo = (selected) =>
  //   anoLetivoOptions.find((option) => selected.ano === option.ano)?.ano;

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

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 100 },
          }}
        >
          <InputLabel>ANO</InputLabel>

          <Select
            value={filters.anoLetivo}
            onChange={handleFilterAnoLetivo}
            input={<OutlinedInput label="ANO" />}
            // renderValue={renderValueAnoLetivo}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 }, 
              },
            }}
          >
            {anoLetivoOptions.map((option) => (
              <MenuItem key={option.ano} value={option.ano}>
                {option?.ano}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

       <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 100 },
          }}
        >
          <InputLabel>DDZ</InputLabel>

          <Select
            multiple
            value={filters.zona}
            onChange={handleFilterZona}
            input={<OutlinedInput label="DDZ" />}
            renderValue={renderValueZona}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {zonaOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                <Checkbox disableRipple size="small" checked={filters.zona.includes(option.id)} />
                {option?.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 300 },
          }}
        >
          <InputLabel>Escola</InputLabel>

          <Select
            multiple
            value={filters.escola}
            onChange={handleFilterEscola}
            input={<OutlinedInput label="Escola" />}
            renderValue={renderValueEscola}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {escolaOptions?.map((escola) => (
              <MenuItem key={escola.id} value={escola.id}>
                <Checkbox disableRipple size="small" checked={filters.escola.includes(escola.id)} />
                {escola.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.nome}
            onChange={handleFilterNome}
            placeholder="Pesquisar..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack> */}
      </Stack>

      {/* <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Imprimir
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Importar
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Exportar
        </MenuItem>
      </CustomPopover> */}
    </>
  );
}

PlanoIntervencaoTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  ddzOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
};
