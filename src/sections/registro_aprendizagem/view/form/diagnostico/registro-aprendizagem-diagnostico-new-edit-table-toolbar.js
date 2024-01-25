import PropTypes from 'prop-types';
import { useEffect, useState, useCallback, useContext } from 'react';
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
import turmaMethods from 'src/sections/turma/turma-repository';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';
import { saveCSVFile } from 'src/utils/functions';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoNewEditTableToolbar({
  filters,
  onFilters,
  promoOptions,
  turma,
  handleTurma,
}) {
  const popover = usePopover();
  const [turmas, setTurmas] = useState([]);

  useEffect(() => {
    turmaMethods.getAllTurmas().then((turmas) => {
      setTurmas(turmas.data);
    });
  }, []);

  const handleFilterNome = useCallback(
    (event) => {
      onFilters('nome', event.target.value);
    },
    [onFilters]
  );

  const handleFilterPromo = useCallback(
    (event) => {
      onFilters(
        'promo_ano_anterior',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
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
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 140 },
          }}
        >
          <InputLabel>Turma</InputLabel>

          <Select
            value={turma}
            onChange={handleTurma}
            input={<OutlinedInput label="Turma" />}
            renderValue={(selected) => ` ${selected.ano_escolar}º ${selected.nome}`}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {turmas.map((option) => (
              <MenuItem key={option.id} value={option}>
                {` ${option.ano_escolar}º ${option.nome}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Promoção no ano anterior</InputLabel>

          <Select
            multiple
            value={filters.promo_ano_anterior}
            onChange={handleFilterPromo}
            input={<OutlinedInput label="Promoçao no ano anterior" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            <MenuItem key="promo_vazio" value="">
              <Checkbox
                disableRipple
                size="small"
                checked={filters.promo_ano_anterior.includes('')}
              />
              Não Preenchido
            </MenuItem>
            {promoOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.promo_ano_anterior.includes(option)}
                />
                {option}
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
        <MenuItem
          onClick={() => {
            let exportFilters = { ...filters, export: 'csv' };
            let query = new URLSearchParams(exportFilters).toString();
            registroAprendizagemMethods.exportFileDiagnosticoList(query).then((csvFile) => {
              saveCSVFile(
                'Avaliação Diagnóstica',
                csvFile.data
              );
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

RegistroAprendizagemDiagnosticoNewEditTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  promoOptions: PropTypes.array,
  handleTurma: PropTypes.func,
};
