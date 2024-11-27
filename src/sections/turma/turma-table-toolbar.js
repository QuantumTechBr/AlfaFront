import PropTypes from 'prop-types';
import { useEffect, useState, useCallback, useContext } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import turmaMethods from './turma-repository';
import { saveCSVFile } from 'src/utils/functions';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { useBoolean } from 'src/hooks/use-boolean';
import LoadingBox from 'src/components/helpers/loading-box';
import { AuthContext } from 'src/auth/context/alfa';
import { escolas_piloto } from 'src/_mock';
// ----------------------------------------------------------------------

export default function TurmaTableToolbar({
  filters,
  onFilters,
  ddzOptions,
  escolaOptions,
  anoOptions,
  setErrorMsg,
  setWarningMsg,
}) {
  const { user } = useContext(AuthContext);
  const popover = usePopover();
  const buscandoCSV = useBoolean(false);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const [escolasFiltered, setEscolasFiltered] = useState([]);
  const [escolasACTotal, setEscolasACTotal] = useState([]);

  useEffect(() => {
    buscaEscolas().then((retorno) => {
      const escolasAC = [];
      retorno.map((escola) => {
        const ea = {
          label: escola.nome,
          id: escola.id,
        }
        escolasAC.push(ea)
      })
      setEscolasFiltered(escolasAC);
      setEscolasACTotal(escolasAC);
    }).catch((error) => {
      // setErrorMsg('Erro de comunicação com a API de escolas');
    })

  }, []);

  // useEffect(() => {
  //   const escolasAC = [];
  //   escolaOptions.map((escola) => {
  //     const ea = {
  //       label: escola.nome,
  //       id: escola.id,
  //     }
  //     escolasAC.push(ea)
  //   })
  //   setEscolasFiltered(escolasAC);
  //   setEscolasACTotal(escolasAC);
  // }, [escolaOptions]);

  // useEffect(() => {
  //   const escolasAC = [];
  //   escolaOptions.map((escola) => {
  //     const ea = {
  //       label: escola.nome,
  //       id: escola.id,
  //     }
  //     escolasAC.push(ea)
  //   })
  //   setEscolasFiltered(escolasAC);
  //   setEscolasACTotal(escolasAC);
  // }, []);

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

  const handleFilterEscola = useCallback(
    (event, newValue) => {
      onFilters(
        'escola',
        newValue,
      );
    },
    [onFilters]
  );

  useEffect(() => {

    if (filters.ddz.length > 0) {
      const escAC = [];
      const _escolasFiltered = escolas.filter((escola) => filters.ddz.includes(escola.zona.id));
      _escolasFiltered.map((escola) => {
        const ea2 = {
          label: escola.nome,
          id: escola.id,
        }
        escAC.push(ea2)
      })
      setEscolasFiltered(escAC);
    } else {
      setEscolasFiltered(escolasACTotal);
    }
  }, [filters.ddz]);

  const renderValueZona = (selected) =>
    selected.map((zonaId) => {
      return ddzOptions.find((option) => option.id == zonaId)?.nome;
    }).join(', ');

  const renderValueAno = (selected) =>
    selected.map((anoId) => {
      return anoOptions.find((option) => option.id == anoId)?.ano;
    }).join(', ');

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
          width: '100%'
        }}
      >
        <FormControl
          sx={{
            flexShrink: 0,
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
            flexShrink: 0,
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
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 300 },
          }}
        >

          <Autocomplete
            multiple
            disablePortal
            id="escola"
            options={escolasFiltered}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Escola" />}
            value={filters.escola}
            onChange={handleFilterEscola}
          />
        </FormControl>

        {/* <FormControl
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
           {escolasFiltered
           .map((escola) => (
              <MenuItem key={escola.id} value={escola.id}>
                <Checkbox disableRipple size="small" checked={filters.escola.includes(escola.id)} />
                {escola.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          {/* <TextField
            fullWidth
            value={filters.nome}
            onChange={handleFilterNome}
            placeholder="Pesquisar por nome da escola..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          /> */}

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
      // sx={{ width: 140 }}
      >
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
              const exportFilters = {
                nome: filters.nome,
                status: filters.status,
                ddzs: filters.ddz,
                escolas: filters.escola?.length > 0 ? filters.escola?.map((esc) => esc.id) : [],
                export: 'csv'
              };
              let escFiltered = [];
              if (exportFilters.escolas.length == 0 && sessionStorage.getItem('escolasPiloto') == 'true') {
                escolaOptions.map((esc) => {
                  if (escolas_piloto.includes(esc.nome)) {
                    escFiltered.push(esc.id);
                  }
                })
              }
              if (escFiltered.length > 0) {
                exportFilters.escolas = escFiltered;
              }
              const query = new URLSearchParams(exportFilters).toString();
              turmaMethods.exportFile(query).then((csvFile) => {
                setWarningMsg('Arquivo enviado com sucesso para o email ' + user.email);
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

TurmaTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,

  ddzOptions: PropTypes.array,
};
