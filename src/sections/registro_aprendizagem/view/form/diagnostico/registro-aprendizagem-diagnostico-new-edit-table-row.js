import PropTypes, { number } from 'prop-types';
// @mui
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
//
import { _habilidades, habilidades_options, frequencia_options, r_options } from 'src/_mock';
import { RHFSelect } from 'src/components/hook-form';
import TextField from '@mui/material/TextField';
import { useFormContext, Controller } from 'react-hook-form';
import { FormControl, Tooltip } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from 'src/auth/context/alfa';
import { RegistroAprendizagemContext } from 'src/sections/registro_aprendizagem/context/registro-aprendizagem-context';
import Iconify from 'src/components/iconify';
import { Box } from '@mui/material';
// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoNewEditTableRow({ row, selected, habilidades, periodo, onEditRow, onSelectRow, onDeleteRow, turma }) {
  const { id, nome, aluno, mapHabilidades, frequencia, status, funcao, funcao_usuario, permissao_usuario, created_at, updated_at, deleted_at } = row;
  // const { mapResultadosAlunoTurmaInicial } = useContext(RegistroAprendizagemContext);
  const { user } = useContext(AuthContext);
  // const [mapResultados, setMapResultados] = useState([]);
  const { control, getValues, watch, setValue } = useFormContext();
  // const [mapDesabilitarSelect, setMapDesabilitarSelect] = useState([]);
  const desabilitaResposta = useBoolean(false);
  const eAdmin = useBoolean(false);
  const values = watch();

  const freqCheck = values.registros[id]?.frequencia;

  const anoEscolar = turma?.ano_escolar;

  const nomeAluno = () => {
    let necessidades_especiais = '';
    try {
      necessidades_especiais = JSON.parse(aluno.necessidades_especiais);
    } catch (e) {
      necessidades_especiais = [aluno.necessidades_especiais];
    }
    return (
      <Box>
        {row.aluno.nome}
        {!!necessidades_especiais &&
          <Tooltip title={necessidades_especiais}>
            <Iconify
              icon="mdi:alphabet-n-circle-outline"
              sx={{
                ml: 1,
              }}
            />
          </Tooltip>}
      </Box>
    );
  };

  const renderTooltip = (rNota, rNumero) => {
    if (anoEscolar == '1') {
      if ((rNumero == 9 || rNumero == 19)) {
        if (rNota === "") {
          return ""
        }
        else if (rNota === "NR") {
          return "Não Respondeu"
        } else if (rNota === 0) {
          return "Insuficiente"
        } else if (rNota === 1) {
          return "Parcial"
        }
      } else {
        if (rNota === "") {
          return ""
        }
        else if (rNota === "NR") {
          return "Não Respondeu"
        } else if (rNota === 0) {
          return "Não Domina"
        } else if (rNota === 1) {
          return "Domina"
        }
      }
    } else if (anoEscolar == '2') {
      if ((rNumero == 8 || rNumero == 9 || rNumero == 18 || rNumero == 19)) {
        if (rNota === "") {
          return ""
        }
        else if (rNota === "NR") {
          return "Não Respondeu"
        } else if (rNota === 0) {
          return "Insuficiente"
        } else if (rNota === 1) {
          return "Parcial"
        }
      } else {
        if (rNota === "") {
          return ""
        }
        else if (rNota === "NR") {
          return "Não Respondeu"
        } else if (rNota === 0) {
          return "Não Domina"
        } else if (rNota === 1) {
          return "Domina"
        }
      }
    } else if (anoEscolar == '3') {
      if ((rNumero == 7 || rNumero == 8 || rNumero == 9 || rNumero == 17 || rNumero == 18 || rNumero == 19)) {
        if (rNota === "") {
          return ""
        }
        else if (rNota === "NR") {
          return "Não Respondeu"
        } else if (rNota === 0) {
          return "Insuficiente"
        } else if (rNota === 1) {
          return "Parcial"
        }
      } else {
        if (rNota === "") {
          return ""
        }
        else if (rNota === "NR") {
          return "Não Respondeu"
        } else if (rNota === 0) {
          return "Não Domina"
        } else if (rNota === 1) {
          return "Domina"
        }
      }
    }
  }


  const preenche_R = () => {
    const retorno = []
    for (let index = 0; index < 20; index++) {
      retorno.push(
        <TableCell key={id + 'rcell' + index} sx={{ whiteSpace: 'nowrap' }}>
          <RHFSelect
            disabled={desabilitaResposta.value}
            name={'registros[' + id + '].r[' + index + ']'}
            label="">
            {r_options.map((r) => (
              <MenuItem
                  key={id + '_r_' + index + r} value={r} sx={{ height: '34px' }}>
              <Tooltip placement="top" title={renderTooltip(r, index)}>
                    {r}
               </Tooltip>
                </MenuItem>
            ))}
            {
              (((index == 9 || index == 19) && anoEscolar == '1') ||
                ((index == 8 || index == 9 || index == 18 || index == 19) && anoEscolar == '2') ||  // AQUI DEFINIMOS EM BASE NO ANO ESCOLAR, QUAIS R PODEM TER A OPÇÃO '2' COMO RESPOSTA
                ((index == 7 || index == 8 || index == 9 || index == 17 || index == 18 || index == 19) && anoEscolar == '3'))
              &&
                <MenuItem key={id + '_r_' + index + 'r'} value={2} sx={{ height: '34px' }}>
              <Tooltip placement="top" title="Completo">
                  {2}
                </Tooltip> 
                </MenuItem>
              }
          </RHFSelect>
        </TableCell>
      )
    }
    return retorno;
  }

  const mediaLP = useCallback(() => {
    let pt = true;
    let media = 0;

    for (let index = 0; index < 10; index++) {
      if (getValues('registros[' + id + '].r[' + index + ']') === "") {
        pt = false;
      }
      media += getValues('registros[' + id + '].r[' + index + ']') == "" || getValues('registros[' + id + '].r[' + index + ']') == 'NR' ? 0 : getValues('registros[' + id + '].r[' + index + ']')

    }
    if (anoEscolar == '1') {
      media = (media * 10) / 11.00;
    } else if (anoEscolar == '2') {
      media = (media * 10) / 12.00;
    } else if (anoEscolar == '3') {
      media = (media * 10) / 13.00;
    }
    // media = media * 10 // MULTIPLICAMOS POR 10 PARA PEGAR A PRIMERA CARA APÓS A VÍRGULA

    if (pt) {
      return media;
    } else {
      return '-'
    }
  }, [getValues])

  const nivelEscritaLP = () => {
    if (getValues('registros[' + id + '].r[9]') == 2) {
      return 'Completo';
    } else if (getValues('registros[' + id + '].r[9]') == 1) {
      return 'Parcial';
    } else if (getValues('registros[' + id + '].r[9]') === 0) {
      return 'Insuficiente';
    } else {
      return '-';
    }
  }

  const nivelLP = () => {
    if (mediaLP() <= 4) {
      return 'N1';
    } else if (mediaLP() <= 8) {
      return 'N2';
    } else if (mediaLP() > 8) {
      return 'N3';
    } else {
      return '-';
    }
  }

  const mediaMAT = useCallback(() => {
    let mat = true;
    let media = 0;
    for (let index = 10; index < 20; index++) {
      if (getValues('registros[' + id + '].r[' + index + ']') === "") {
        mat = false;
      }
      media += getValues('registros[' + id + '].r[' + index + ']') == "" || getValues('registros[' + id + '].r[' + index + ']') == 'NR' ? 0 : getValues('registros[' + id + '].r[' + index + ']')
    }
    if (anoEscolar == '1') {
      media = (media * 10) / 11.00;
    } else if (anoEscolar == '2') {
      media = (media * 10) / 12.00;
    } else if (anoEscolar == '3') {
      media = (media * 10) / 13.00;
    }

    // media = media * 10 // MULTIPLICAMOS POR 10 PARA PEGAR A PRIMERA CARA APÓS A VÍRGULA
    if (mat) {
      return media;
    } else {
      return '-'
    }
  }, [getValues])

  const nivelResProb = () => {
    if (getValues('registros[' + id + '].r[19]') == 2) {
      return 'Completo'
    } else if (getValues('registros[' + id + '].r[19]') == 1) {
      return 'Parcial'
    } else if (getValues('registros[' + id + '].r[19]') === 0) {
      return 'Insuficiente'
    } else {
      return '-'
    }
  }

  const nivelMAT = () => {
    if (mediaMAT() <= 4) {
      return 'N1';
    } else if (mediaMAT() <= 8) {
      return 'N2';
    } else if (mediaMAT() > 8) {
      return 'N3';
    } else {
      return '-';
    }
  }

  const mediaFinal = useCallback(() => {
    let pt_mat = true;
    let media = 0;
    for (let index = 0; index < 20; index++) {
      if (getValues('registros[' + id + '].r[' + index + ']') === "") {
        pt_mat = false;
      }
      media += getValues('registros[' + id + '].r[' + index + ']') == "" || getValues('registros[' + id + '].r[' + index + ']') == 'NR' ? 0 : getValues('registros[' + id + '].r[' + index + ']')
    }
    if (anoEscolar == '1') {
      media = (media * 10) / 22.00;
    } else if (anoEscolar == '2') {
      media = (media * 10) / 24.00;
    } else if (anoEscolar == '3') {
      media = (media * 10) / 26.00;
    }

    // media = media * 10 // MULTIPLICAMOS POR 10 PARA PEGAR A PRIMERA CARA APÓS A VÍRGULA

    if (pt_mat) {
      return media;
    } else {
      return '-'
    }
  }, [getValues])

  const nivelFinal = () => {
    if (mediaFinal() <= 4) {
      return 'N1';
    } else if (mediaFinal() <= 8) {
      return 'N2';
    } else if (mediaFinal() > 8) {
      return 'N3';
    } else {
      return '-';
    }
  }

  useEffect(() => {
    if (freqCheck == 'Ausente') {
      for (let index = 0; index < 20; index++) {
        setValue('registros[' + id + '].r[' + index + ']', "")
      }
      desabilitaResposta.onTrue()
    }
    else {
      desabilitaResposta.onFalse()
    }
  }, [freqCheck]);

  useEffect(() => {
    user?.permissao_usuario.map((perm) => {
      if (perm.nome === "SUPERADMIN" || perm.nome === "ADMIN") {
        eAdmin.onTrue();
      }
    })
  }, [user]);

  return (
    <TableRow hover selected={selected}>

      <TableCell sx={{ whiteSpace: 'nowrap', display: 'none' }} >
        <Controller
          name={`registros[${id}].id_aluno_turma`}
          control={control}
          defaultValue={id}
          render={({ field, fieldState: { error } }) => (
            <FormControl>
              <TextField
                color='primary'
                value={id}
              />
            </FormControl>
          )}
        />
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.aluno.matricula}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nomeAluno()}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <RHFSelect key={id + 'freq'} name={'registros[' + id + '].frequencia'} >
          <MenuItem key={id + '_freq_'} value='' sx={{ height: '34px' }}>

          </MenuItem>
          {frequencia_options.map((freq) => (
            <MenuItem
              disabled={(freq == 'Ausente' && frequencia_options.includes(row?.frequencia) && !eAdmin)}
              key={id + '_freq_' + freq} value={freq} sx={{ height: '34px' }}>
              {freq}
            </MenuItem>
          ))}
        </RHFSelect>
      </TableCell>

      {/* {habilidades.map((habilidade) => {
          return (
            <TableCell key={id+'habcell'+habilidade.id}sx={{ whiteSpace: 'nowrap' }}>
              <RHFSelect disabled={mapHabilidades ? disableSelect(mapHabilidades[habilidade.id]) : false} name={'registros['+id+'].habilidades_registro_aprendizagem['+habilidade.id+']'}  label="">
                {habilidades_options.map((hab) => (
                  <MenuItem disabled={disableMenuItem(hab, habilidade.id)} key={id + '_hab_' + hab} value={hab} sx={{ height: '34px' }}>
                      <Label
                        variant="soft"
                        color={(hab === 'D' && 'success') ||
                          (hab === 'DP' && 'warning') ||
                          (hab === 'ND' && 'error') ||
                          'default'}
                      >
                        {hab}
                      </Label> 
                    </MenuItem>
                ))}
              </RHFSelect>
            </TableCell>
          );
        })} */}

      {preenche_R()}

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {
          mediaLP() == '-' ? mediaLP() : mediaLP().toFixed(1)
          // Math.trunc(mediaLP()) / 10 // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
        }
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nivelEscritaLP()}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nivelLP()}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {
          mediaMAT() == '-' ? mediaMAT() : mediaMAT().toFixed(1)
          // Math.trunc(mediaMAT()) / 10 // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
        }
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nivelResProb()}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nivelMAT()}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {
          mediaFinal() == '-' ? mediaFinal() : mediaFinal().toFixed(1)
          // Math.trunc(mediaFinal()) / 10 // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
        }
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nivelFinal()}
      </TableCell>

    </TableRow>
  );
}

RegistroAprendizagemDiagnosticoNewEditTableRow.propTypes = {
  periodo: PropTypes.string,
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  turma: PropTypes.object,
};
