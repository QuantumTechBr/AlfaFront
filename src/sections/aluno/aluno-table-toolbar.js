import PropTypes from 'prop-types';
import { useCallback, useState, Fragment, useContext } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import Label from 'src/components/label';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import { Box } from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import alunoMethods from './aluno-repository';
import { saveCSVFile } from 'src/utils/functions';
import { useBoolean } from 'src/hooks/use-boolean';
import LoadingBox from 'src/components/helpers/loading-box';
import { AuthContext } from 'src/auth/context/alfa';
import { stubTrue } from 'lodash';

// ----------------------------------------------------------------------

export default function AlunoTableToolbar({
  filters,
  onFilters,
  ddzOptions,
  escolaOptions,
  anoOptions,
  turmaOptions,
  faseOptions,
  setWarningMsg,
  setErrorMsg,
  enterAction = () => {}, // Function to call on enter key press
}) {

  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getEscola = useCallback((escolaId) => escolaOptions.find((e) => e.id == escolaId), [escolaOptions])
  const escolaAutocompleteOptions = escolaOptions.map((escola) => ({
    label: escola.nome,
    id: escola.id,
    zona: escola.zona,
  }));
  const { user } = useContext(AuthContext);
  const buscandoCSV = useBoolean(false);
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
    (event, newValue) => {
      onFilters(
        'escola',
        newValue,
      );
    },
    [onFilters]
  );
  
  // const handleFilterEscola = useCallback(
  //   (event) => {
  //     onFilters(
  //       'escola',
  //       typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
  //     );
  //   },
  //   [onFilters]
  // );

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

  const handleFilterAno = useCallback(
    (event) => {
      onFilters('ano', event.target.value);
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

  const renderValueZona = (selected) =>
    selected.map((zonaId) => {
      return ddzOptions.find((option) => option.id == zonaId)?.nome;
    }).join(', ');

  // const renderValueEscola = (selected) =>
  //   selected
  //     .map((escolaId) => {
  //       return escolaOptions.find((option) => option.id == escolaId)?.nome;
  //     })
  //     .join(', ');

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

  const handleClickError = () => {
    setOpenError(true);
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenError(false);
  };

  const actionError = (
    <Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseError}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  const handleFilterSemEscola = useCallback(() => {
    if (filters?.sem_escola) {
      onFilters('sem_escola', false);
    } else {
      onFilters('sem_escola', true);
    }

  }, [filters, onFilters])

  return (
    <>
      <Snackbar
        style={{ top: '120px' }}
        open={openError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        onClose={handleCloseError}
        action={actionError}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
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
          width: '100%',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }} flexWrap="wrap">
          <FormControl
            sx={{
              flexShrink: 1,
              width: { xs: 1, md: 100 },
            }}
          >
            <InputLabel>Ano</InputLabel>

            <Select
              value={filters.ano}
              onChange={handleFilterAno}
              input={<OutlinedInput label="Ano" />}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {anoOptions?.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.ano}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            sx={{
              flexGrow: 1,
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

          {filters.ddz.length > 0 &&
            <FormControl
              sx={{
                flexGrow: 1,
                width: { xs: 1, md: 300 },
              }}
            >
              <InputLabel>Escola</InputLabel>

    
              <Autocomplete
                multiple
                disablePortal
                id="escola"
                options={escolaAutocompleteOptions}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Escola" />}
                value={filters.escola}
                onChange={handleFilterEscola}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    enterAction(); // Call the function passed as prop on Enter key press
                  }
                }}
              />

              {/* <Select
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
                {escolaOptions?.filter((_escola) => filters.ddz.includes(_escola.zona.id)).map((escola) => (
                  <MenuItem key={escola.id} value={escola.id}>
                    <Checkbox
                      disableRipple
                      size="small"
                      checked={filters.escola.includes(escola.id)}
                    />
                    {escola.nome}
                  </MenuItem>
                ))}
              </Select> */}
            </FormControl>}

          {filters.escola.length > 0 && (
            <FormControl
              sx={{
                flexGrow: 1,
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
                {turmaOptions?.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    <Checkbox
                      disableRipple
                      size="small"
                      checked={filters.turma.includes(option.id)}
                    />
                    {` ${option.ano_escolar}º ${option.nome} (${option.turno}) ${filters.escola.length != 1 ? ` (${getEscola(option.escola_id)?.nome})` : ''
                      } `}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl
            sx={{
              flexShrink: 1,
              width: { xs: 1, md: 160 },
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

          <TextField
            value={filters.nome}
            onChange={handleFilterNome}
            placeholder="Nome..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                enterAction(); // Call the function passed as prop on Enter key press
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            value={filters.matricula}
            onChange={handleFilterMatricula}
            placeholder="Matrícula..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                enterAction(); // Call the function passed as prop on Enter key press
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <Box
            sx={{
              pr: 1,
            }}
          >
            <Checkbox
              checked={filters.sem_escola} onClick={handleFilterSemEscola} />
            <Label>Trazer Alunos Sem Escola</Label>
          </Box>
        </Stack>
          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>

      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
      // sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Imprimir
        </MenuItem> */}

        {(buscandoCSV.value) &&
          <LoadingBox
            sx={{ pt: 0.3, pl: 2.5 }}
            texto="Gerando CSV... Você receberá um email com o arquivo em anexo."
          />
        }
        {(!buscandoCSV.value) &&
          <MenuItem
            onClick={() => {
              setWarningMsg('O seu arquivo está sendo gerado. Dependendo do número de registros, isso pode levar alguns minutos. ' +
                'Para uma resposta mais rápida, tente filtrar menos registros. ' +
                'Quando o processo for concluído, um email será enviado com o arquivo em anexo para ' + (user?.email ?? '') +
                ' e essa mensagem irá sumir. Enquanto isso, você pode continuar utilizando o sistema normalmente.'
              );
              setErrorMsg('');
              buscandoCSV.onTrue();
              const exportFilters = {
                turmas: filters.turma,
                escolas: filters.escola?.length ? filters.escola.map((escola) => escola.id) : [],
                matricula: filters.matricula,
                nome: filters.nome,
                fase: filters.fase,
                pesquisa: filters.pesquisa ? filters.pesquisa : '',
                export: 'csv'
              };

              const query = new URLSearchParams(exportFilters).toString();
              alunoMethods.exportFile(query).then(() => {
                setWarningMsg('Arquivo enviado com sucesso para o email ' + (user?.email ?? ''));
                buscandoCSV.onFalse();
              });
            }}
          >
            <Iconify icon="solar:export-bold" />
            Exportar
          </MenuItem>
        }
      </CustomPopover>
    </>
  );
}

AlunoTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
};
