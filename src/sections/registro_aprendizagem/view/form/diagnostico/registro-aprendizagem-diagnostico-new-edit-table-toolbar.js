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
import turmaMethods from 'src/sections/turma/turma-repository';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoNewEditTableToolbar({
  filters,
  onFilters,
  anoLetivoOptions,
  escolaOptions,
  freqOptions,
  turma,
  handleTurma,
}) {
  const [turmas, setTurmas] = useState([]);
  const [escola, setEscola] = useState([]);

  useEffect(() => {
    turmaMethods.getAllTurmas().then((response) => {
      setTurmas(response.data);
    });
  }, []);

  useEffect(() => {
    const esc = escolaOptions.filter((_escola) => turma.escola.id == _escola.id);
    setEscola(esc[0]);
  }, [escolaOptions, turma]);

  const handleFilterAnoLetivo = useCallback(
    (event) => onFilters('anoLetivo', event.target.value),
    [onFilters]
  );

  const handleFilterEscola = useCallback(
    (event) => setEscola(event.target.value),
    [setEscola],
  );

  const handleFilterNome = useCallback(
    (event) => {
      onFilters('nome', event.target.value);
    },
    [onFilters]
  );

  const handleFilterFreq = useCallback(
    (event) => {
      onFilters(
        'frequencia',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  return (
    <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
        }}
      >

        {/* {anoLetivoOptions && !!anoLetivoOptions.length && (
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
        )} */}

        {escolaOptions && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 300 },
            }}
          >
            <InputLabel>Escola</InputLabel>

            <Select
              name='escola_teste'
              value={escola}
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
            {turmas.filter((_turma) => escola?.id == _turma.escola_id).map((option) => (
              <MenuItem key={option.id} value={option}>
                {` ${option.ano_escolar}º ${option.nome} (${option.turno})`}
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
          <InputLabel>Frequência</InputLabel>

          <Select
            multiple
            value={filters.frequencia}
            onChange={handleFilterFreq}
            input={<OutlinedInput label="Frequência" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            <MenuItem key="freq_vazio" value="">
              <Checkbox
                disableRipple
                size="small"
                checked={filters.frequencia.includes('')}
              />
              Não Preenchido
            </MenuItem>
            {freqOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.frequencia.includes(option)}
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
            placeholder="Nome/Matrícula..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>
  );
}

RegistroAprendizagemDiagnosticoNewEditTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  anoLetivoOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
  freqOptions: PropTypes.array,
  handleTurma: PropTypes.func,
};
