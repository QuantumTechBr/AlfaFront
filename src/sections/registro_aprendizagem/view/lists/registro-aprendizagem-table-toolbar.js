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
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';
import { saveCSVFile } from 'src/utils/functions';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemTableToolbar({
  filters,
  onFilters,
  anoLetivoOptions,
  escolaOptions,
  turmaOptions,
  bimestreOptions,
  disciplinaOptions,
  export_type,
}) {
  // if(typeof filters.anoLetivo === 'number'){
  //   filters.anoLetivo = anoLetivoOptions.filter((item) => item.ano == filters.anoEscolar)[0];
  // }
  const popover = usePopover();

  

  const handleFilterAnoLetivo = useCallback(
    (event) => onFilters('anoLetivo', event.target.value),
    [onFilters]
  );

  const handleFilterEscola = useCallback(
    (event) =>
      onFilters(
        'escola', event.target.value
      ),
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

  const handleFilterDisciplina = useCallback(
    (event) =>
      onFilters(
        'disciplina',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      ),
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
            >
              {anoLetivoOptions.map((option) => (
                <MenuItem key={option.id} value={option}>
                  {option.ano}
                </MenuItem>
              ))}
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
              renderValue={(selected) => `${selected.nome}`}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {escolaOptions.map((option) => (
                <MenuItem key={option.id} value={option}>
                  {option.nome}
                </MenuItem>
              ))}
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
            <InputLabel>Turmas</InputLabel>

            <Select
              multiple
              value={filters.turma}
              onChange={handleFilterTurma}
              input={<OutlinedInput label="Turma" />}
              renderValue={(selected) =>
                selected.map((item) => `${item.ano_escolar}º ${item.nome} (${item.turno})`).join(', ')
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
                    <Checkbox disableRipple size="small" checked={filters.turma.includes(option)} />
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
              multiple
              value={filters.bimestre}
              onChange={handleFilterBimestre}
              input={<OutlinedInput label="Bimestre" />}
              renderValue={(selected) => selected.map((item) => `${item.ordinal}º`).join(', ')}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {bimestreOptions.map((option) => {
                return (
                  <MenuItem key={option.id} value={option}>
                    <Checkbox
                      disableRipple
                      size="small"
                      checked={filters.bimestre.includes(option)}
                    />
                    {`${option.ordinal} º`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}

        {disciplinaOptions && (
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 120 },
            }}
          >
            <InputLabel>Disciplina</InputLabel>

            <Select
              multiple
              value={filters.disciplina}
              onChange={handleFilterDisciplina}
              input={<OutlinedInput label="Disciplina" />}
              renderValue={(selected) => selected.join(', ')}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {disciplinaOptions.map((option) => {
                return (
                  <MenuItem key={option} value={option}>
                    <Checkbox
                      disableRipple
                      size="small"
                      checked={filters.disciplina.includes(option)}
                    />
                    {option}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}


        <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            let exportFilters = Object.assign({}, filters);
            exportFilters.anoLetivo = exportFilters.anoLetivo.id;
            exportFilters.turma = exportFilters.turma.map((item) => item.id);
            exportFilters.escola = exportFilters.escola.id;
            exportFilters.bimestre = exportFilters.bimestre.map((item) => item.id);

            exportFilters = { ...exportFilters, export: 'csv' };
            const query = new URLSearchParams(exportFilters).toString();

            if (export_type == `fase`) {
              registroAprendizagemMethods.exportFileFaseList(query).then((csvFile) => {
                saveCSVFile(
                  'Avaliação de Fases do Desenvolvimento da Leitura e da Escrita',
                  csvFile.data
                );
              });
            } else if (export_type == `diagnostico`) {
              registroAprendizagemMethods.exportFileDiagnosticoList(query).then((csvFile) => {
                saveCSVFile('Avaliação Diagnóstica', csvFile.data);
              });
            }
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

RegistroAprendizagemTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  anoLetivoOptions: PropTypes.array,
  turmaOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
  export_type: PropTypes.string,
};
