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
import { Button } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
// components
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { CSVLink } from "react-csv";
import Iconify from 'src/components/iconify';
import turmaMethods from 'src/sections/turma/turma-repository';

// ----------------------------------------------------------------------

export default function AvaliacaoDiagnosticoNewEditTableToolbar({
  filters,
  onFilters,
  anoLetivoOptions,
  escolaOptions,
  freqOptions,
  turma,
  handleTurma,
  nomeArquivo,
  dataArquivo,
  getRegistros,
}) {
  const [turmas, setTurmas] = useState([]);
  const [escola, setEscola] = useState({});
  const [turmaSelect, setTurmaSelect] = useState(turma);
  const [anoLetivo, setAnoLetivo] = useState({});

  useEffect(() => {
    turmaMethods.getAllTurmas().then((response) => {
      setTurmas(response.data);
    });
  }, []);

  useEffect(() => {
    const esc = escolaOptions.filter((_escola) => turma.escola.id == _escola.id);
    setEscola(esc[0]);
    const ano = anoLetivoOptions.filter((_ano) => turma.ano.id == _ano.id);
    setAnoLetivo(ano[0]);
  }, [turma, escolaOptions, anoLetivoOptions]);

  const handleFilterAnoLetivo = useCallback(
    (event) => {
      setAnoLetivo(event.target.value)
      setTurmaSelect('');
    }, [setAnoLetivo]
  );

  const handleFilterEscola = useCallback(
    (event) => {
      setEscola(event.target.value);
      setTurmaSelect('');
    }, [setEscola],
  );

  const handleFilterTurma = useCallback(
    (event) => setTurmaSelect(event.target.value),
    [setTurmaSelect],
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
        }}
      >

        {anoLetivoOptions && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 120 },
            }}
          >
            <InputLabel>Ano Letivo</InputLabel>

            <Select
              value={anoLetivo}
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
              name='escola'
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
            value={turmaSelect}
            onChange={handleFilterTurma}
            input={<OutlinedInput label="Turma" />}
            renderValue={(selected) => ` ${selected.ano_escolar}º ${selected.nome}`}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {turmas.filter((_turma) => escola?.id == _turma.escola_id).filter((_turma) => anoLetivo?.id == _turma.ano_id).map((option) => (
              <MenuItem key={option.id} value={option}>
                {` ${option.ano_escolar}º ${option.nome} (${option.turno})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>


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
          disabled={escola && turmaSelect && anoLetivo ? false : true}
          variant="contained"
          sx={{
            width: {
              xs: '100%',
              md: '15%',
            },
          }}
          onClick={() => {
            handleTurma(turmaSelect);
          }}
        >
          Aplicar filtros
        </Button>
      </Stack>
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
        }}>
        <TextField
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
          sx={{
            width: 660,
          }}
        />
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
      </Stack>
    </>
  );
}

AvaliacaoDiagnosticoNewEditTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  anoLetivoOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
  freqOptions: PropTypes.array,
  handleTurma: PropTypes.func,
};
