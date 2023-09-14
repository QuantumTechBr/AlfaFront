import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
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
  turmaOptions,
  turmaSelected,
  handleChangeTurma,
  bimestreOptions,
  bimestreSelected,
  handleChangeBimestre,
}) {
  const popover = usePopover();

  const { control } = useFormContext();

  const handleFilterNome = useCallback(
    (event) => {
      onFilters('nome', event.target.value);
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
        {turmaOptions && (
          <Controller
            name="turma"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                sx={{
                  flexShrink: 0,
                  width: { xs: 1, md: 120 },
                }}
              >
                <InputLabel>Turma</InputLabel>

                <Select
                  value={turmaSelected}
                  onChange={(event) => {
                    handleChangeTurma(event);
                    field.onChange(event.target.value);
                  }}
                  input={<OutlinedInput label="Turma" />}
                  renderValue={(selected) => `${selected.ano_escolar}º ${selected.nome}`}
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 240 },
                    },
                  }}
                >
                  {turmaOptions.map((option) => {
                    return (
                      <MenuItem key={option.id} value={option}>
                        {` ${option.ano_escolar}º ${option.nome}`}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}
          />
        )}

        {bimestreOptions && (
          <Controller
            name="bimestre"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                sx={{
                  flexShrink: 0,
                  width: { xs: 1, md: 120 },
                }}
              >
                <InputLabel>Bimestre</InputLabel>

                <Select
                  name="bimestre"
                  value={bimestreSelected}
                  onChange={(event) => {
                    handleChangeBimestre(event);
                    field.onChange(event.target.value);
                  }}
                  input={<OutlinedInput label="Bimestre" />}
                  renderValue={(selected) => `${selected}º`}
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 240 },
                    },
                  }}
                >
                  {bimestreOptions.map((option) => {
                    return (
                      <MenuItem key={`${option}bimestre`} value={option}>
                        {`${option}º`}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}
          />
        )}

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
      </CustomPopover>
    </>
  );
}

RegistroAprendizagemFaseFormTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  turmaOptions: PropTypes.array,
};
