import PropTypes from 'prop-types';
import { useCallback, useContext } from 'react';
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
import profissionalMethods from './profissional-repository';
import { saveCSVFile } from 'src/utils/functions';
import { useBoolean } from 'src/hooks/use-boolean';
import LoadingBox from 'src/components/helpers/loading-box';
import { AuthContext } from 'src/auth/context/alfa';
// ----------------------------------------------------------------------

export default function ProfissionalTableToolbar({
  filters,
  onFilters,
  roleOptions,
  ddzOptions,
  escolaOptions,
  setErrorMsg,
  setWarningMsg
}) {
  const { user } = useContext(AuthContext);
  const popover = usePopover();
  const buscandoCSV = useBoolean(false);

  const handleFilterPesquisa = useCallback(
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

  const handleFilterRole = useCallback(
    (event) => {
      onFilters(
        'role',
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

  const renderValueFuncao = (selected) =>
    selected
      .map((funcao_nome_exibicao) => {
        return roleOptions.find((option) => option.nome_exibicao == funcao_nome_exibicao)?.nome_exibicao;
      })
      .join(', ');

  const renderValueEscola = (selected) =>
    selected
      .map((escolaId) => {
        return escolaOptions.find((option) => option.id == escolaId)?.nome;
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
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
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
            onChange={handleFilterPesquisa}
            placeholder="Pesquisar nome do profissional..."
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
                'Quando o processo for concluído, um email será enviado com o arquivo em anexo para ' + user.email +
                ' e essa mensagem irá sumir. Enquanto isso, você pode continuar utilizando o sistema normalmente.'
              );
              setErrorMsg('');
              buscandoCSV.onTrue();
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

ProfissionalTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  ddzOptions: PropTypes.array,
  escolaOptions: PropTypes.array,
};
