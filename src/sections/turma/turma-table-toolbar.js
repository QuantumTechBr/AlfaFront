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
import turmaMethods from './turma-repository';
import { saveCSVFile } from 'src/utils/functions';

// ----------------------------------------------------------------------

export default function TurmaTableToolbar({
  filters,
  onFilters,
  ddzOptions,
  escolaOptions,
}) {
  const popover = usePopover();

  const handleFilterNome = useCallback(
    (event) => {
      onFilters('nome', event.target.value);
    },
    [onFilters]
  );

  const handleFilterDdz = useCallback(
    (event) => {
      onFilters(
        'ddz',
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

  const renderValueEscola = (selected) => 
    selected.map((escolaId) => {
      return escolaOptions.find((option) => option.id == escolaId)?.nome;
    }).join(', ');

  const renderValueZona = (selected) => 
    selected.map((zonaId) => {
      return ddzOptions.find((option) => option.id == zonaId)?.nome;
    }).join(', ');

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
          width: '100%'
        }}
      >


        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 100 },
          }}
        >
          <InputLabel>DDZ</InputLabel>

          <Select
            multiple
            value={filters.ddz}
            onChange={handleFilterDdz}
            input={<OutlinedInput label="DDZ" />}
            renderValue={renderValueZona}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {ddzOptions?.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                <Checkbox disableRipple size="small" checked={filters.ddz.includes(option.id)} />
                {option.nome}
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

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
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
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
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
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            const exportFilters = { ...filters, export: 'csv' };
            const query = new URLSearchParams(exportFilters).toString();
            turmaMethods.exportFile(query).then((csvFile) => {
              saveCSVFile('Turmas', csvFile.data);
            });
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Exportar
        </MenuItem>
      </CustomPopover>
    </>
  );
}

TurmaTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,

  ddzOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
};
