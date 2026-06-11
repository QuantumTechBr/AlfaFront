import PropTypes from 'prop-types';
import { useCallback, useContext, useState, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import userMethods from './user-repository';
import { parseBlobError } from 'src/utils/axios';
import { useBoolean } from 'src/hooks/use-boolean';
import LoadingBox from 'src/components/helpers/loading-box';
import { AuthContext } from 'src/auth/context/alfa';
// ----------------------------------------------------------------------

export default function UserTableToolbar({
  filters,
  onFilters,
  //
  roleOptions,
  ddzOptions,
  escolaOptions,
  setErrorMsg,
  setWarningMsg,
  enterAction = () => {}, // Function to call on enter key press
}) {
  const { user } = useContext(AuthContext);
  const popover = usePopover();
  const buscandoCSV = useBoolean(false);
  const [csvBlob, setCsvBlob] = useState(null);
  const [csvFilename, setCsvFilename] = useState('');
  const handleFilterPesquisa = useCallback(
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
    (_, newValue) => {
      onFilters(
        'escola',
        newValue.map((escola) => escola.id)
      );
    },
    [onFilters]
  );

  const renderValueFuncao = (selected) =>
    selected
      .map((funcao_nome_exibicao) => {
        return roleOptions.find((option) => option.nome_exibicao == funcao_nome_exibicao)?.nome_exibicao;
      })
      .join(', ');

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
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 140 },
          }}
        >
          <InputLabel>Função</InputLabel>

          <Select
            multiple
            value={filters.role}
            onChange={handleFilterRole}
            input={<OutlinedInput label="Função" />}
            renderValue={renderValueFuncao}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {roleOptions.map((funcao) => (
              <MenuItem key={funcao.nome_exibicao} value={funcao.nome_exibicao}>
                <Checkbox disableRipple size="small" checked={filters.role.includes(funcao.nome_exibicao)} />
                {funcao.nome_exibicao}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          multiple
          disablePortal
          options={escolaOptions ?? []}
          value={(escolaOptions ?? []).filter((escola) => (filters.escola ?? []).includes(escola.id))}
          onChange={handleFilterEscola}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) => option?.nome ?? ''}
          sx={{
            flexShrink: 0,
            width: { xs: '100%', md: 300 },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Escola"
              placeholder="Selecionar escola..."
            />
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              enterAction();
            }
          }}
        />

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.nome}
            onChange={handleFilterPesquisa}
            placeholder="Pesquisar nome do usuário..."
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

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
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
                a.download = csvFilename || 'exportacao_usuarios.csv';
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
                nome: filters.nome,
                escola_id: filters.escola.join(','),
                zona_id: filters.ddz.join(','),
                funcao_usuario_nome_exibicao: filters.role.join(','),
                status: filters.status,
                export: 'csv'
              };

              const query = new URLSearchParams(exportFilters).toString();
              userMethods.exportFile(query).then((result) => {
                const filename = result.headers['content-disposition']
                  ?.split('filename=')[1]?.replace(/"/g, '') ?? 'exportacao_usuarios.csv';
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

UserTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  ddzOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
};
