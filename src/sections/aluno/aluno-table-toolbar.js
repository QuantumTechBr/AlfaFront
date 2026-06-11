import PropTypes from 'prop-types';
import { useCallback, useState, useEffect, Fragment, useContext } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
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
import { parseBlobError } from 'src/utils/axios';
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
  const [csvBlob, setCsvBlob] = useState(null);
  const [csvFilename, setCsvFilename] = useState('');

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

  useEffect(() => {
    return () => {
      if (csvBlob) {
        setCsvBlob(null);
        setCsvFilename('');
      }
    };
  }, [csvBlob]);

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

      {(!buscandoCSV.value && csvBlob) && (
        <Alert
          severity="success"
          sx={{ mx: 2.5, mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="material-symbols:download" />}
              onClick={() => {
                const url = URL.createObjectURL(csvBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = csvFilename || 'exportacao_alunos.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Baixar relatório
            </Button>
          }
        >
          Relatório pronto para download.
        </Alert>
      )}

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
            texto="Gerando arquivo CSV... Aguarde. Não saia desta tela."
          />
        }
        {(!buscandoCSV.value) &&
          <MenuItem
            onClick={() => {
              setWarningMsg('O arquivo está sendo gerado. Dependendo do número de registros, isso pode levar alguns minutos. ' +
                'Para uma resposta mais rápida, tente filtrar menos registros. ' +
                'O arquivo ficará disponível para download nesta tela. ' +
                'ATENÇÃO: se você sair desta tela antes de concluir, o download será perdido e será necessário solicitar novamente.'
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
              alunoMethods.exportFile(query).then((result) => {
                const filename = result.headers['content-disposition']
                  ?.split('filename=')[1]?.replace(/"/g, '') ?? 'exportacao_alunos.csv';
                setCsvBlob(result.data);
                setCsvFilename(filename);
                setWarningMsg('');
                buscandoCSV.onFalse();
              })
              .catch(async (error) => {
                const msg = error instanceof Blob ? await parseBlobError(error) : String(error);
                setErrorMsg(msg || 'Erro de comunicação com a API.');
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
