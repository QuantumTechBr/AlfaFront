import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import alunoMethods from './aluno-repository';
import { saveCSVFile } from 'src/utils/functions';

// ----------------------------------------------------------------------

export default function AlunoTableToolbar({
  filters,
  onFilters,
  escolaOptions,
  turmaOptions,
  faseOptions,
}) {
  const popover = usePopover();

  const handleFilterNome = useCallback(
    (event) => {
      onFilters('nome', event.target.value);
    },
    [onFilters]
  );

  const handleFilterMatricula = useCallback(
    (event) => {
      onFilters('matricula', event.target.value);
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

  const handleFilterFase = useCallback(
    (event) => {
      onFilters(
        'fase',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const renderValueEscola = (selected) =>
    selected
      .map((escolaId) => {
        return escolaOptions.find((option) => option.id == escolaId)?.nome;
      })
      .join(', ');

  const renderValueTurma = (selected) =>
    selected
      .map((turmaId) => {
        const turma = turmaOptions.find((option) => option.id == turmaId);
        return turma?.ano_escolar.concat('º ', turma?.nome);
      })
      .join(', ');

  const renderValueFase = (selected) =>
    selected
      .map((fase) => {
        return faseOptions.find((option) => option == fase);
      })
      .join(', ');

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
          width: "100%"
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.nome}
            onChange={handleFilterNome}
            placeholder="Nome..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            value={filters.matricula}
            onChange={handleFilterMatricula}
            placeholder="Matrícula..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

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
                  <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.escola.includes(escola.id)}
                  />
                  {escola.nome}
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
            <InputLabel>Turma</InputLabel>

            <Select
              multiple
              value={filters.turma}
              onChange={handleFilterTurma}
              input={<OutlinedInput label="Turma" />}
              renderValue={renderValueTurma}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {turmaOptions?.map((turma) => (
                <MenuItem key={turma.id} value={turma.id}>
                  <Checkbox disableRipple size="small" checked={filters.turma.includes(turma.id)} />
                  {turma.ano_escolar}º {turma.nome}
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
            <InputLabel>Fase</InputLabel>

            <Select
              multiple
              value={filters.fase}
              onChange={handleFilterFase}
              input={<OutlinedInput label="Fase" />}
              renderValue={renderValueFase}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {faseOptions?.map((fase) => (
                <MenuItem key={fase} value={fase}>
                  <Checkbox disableRipple size="small" checked={filters.fase.includes(fase)} />
                  {fase}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            const exportFilters = { ...filters, export: 'csv' };
            const query = new URLSearchParams(exportFilters).toString();
            alunoMethods.exportFile(query).then((csvFile) => {
              saveCSVFile('Estudantes', csvFile.data);
            });
            popover.onClose();
            // window.open(alunoMethods.exportFile(query));
            // router.push(paths.dashboard.post.details(title));
          }}
        >
          <Iconify icon="solar:export-bold" />
          Exportar
        </MenuItem>
      </CustomPopover>
    </>
  );
}

AlunoTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
};
