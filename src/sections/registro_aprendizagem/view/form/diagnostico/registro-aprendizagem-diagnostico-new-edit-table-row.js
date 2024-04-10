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
  const { mapResultadosAlunoTurmaInicial } = useContext(RegistroAprendizagemContext);
  const { user } = useContext(AuthContext);
  const [mapResultados, setMapResultados] = useState([]);
  const { control, getValues } = useFormContext();
  const [mapDesabilitarSelect, setMapDesabilitarSelect] = useState([]);

  const anoEscolar = turma?.ano_escolar;

  const getMapResultados = useCallback(async () => {
    const mp = await mapResultadosAlunoTurmaInicial({
      alunoTurmaId: id,
    });
    setMapResultados(mp)
  }, [id, setMapResultados, mapResultadosAlunoTurmaInicial]);

  const disableSelect = () => {
    let mds = []
    for (let index = 0; index < 20; index++) {
      if (getValues('registros['+id+'].r['+index+']') === '') {
        console.log(getValues('registros['+id+'].r['+index+']'))
        mds[index] = false;
      } else if (user?.permissao_usuario[0]?.nome === "PROFESSOR" || user?.permissao_usuario[0]?.nome === "DIRETOR") {
        mds[index] = true
      } else {
        mds[index] = false;
      }
    }
    setMapDesabilitarSelect(mds);
  }

  const preparacaoInicial = useCallback(async () => {
    disableSelect();
    if (periodo == 'Final') {
      getMapResultados();
    }
  }, [periodo, getMapResultados]);

  const nomeAluno = () => {
    const  necessidades_especiais = row.aluno.necessidades_especiais ?JSON.parse(aluno.necessidades_especiais) : '';
    return (
        <Box>
          {row.aluno.nome}
         {necessidades_especiais != "" &&
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

 

  useEffect(() => {
    preparacaoInicial() 
  }, []);

  const mapDesabilitarMenuItem = {
    '' : 6,
    'NR': 2,
    '0': 3,
    '1': 4,
    '2': 5
  };

  const disableMenuItem = (rNota, rNumero) => {
    if (user?.permissao_usuario[0]?.nome == "PROFESSOR") {
      if (mapResultados[rNumero] == '') {
        return false
      } else {
        return mapDesabilitarMenuItem[rNota] < mapDesabilitarMenuItem[mapResultados[rNumero]] ? true : false;
      }
    }
    if (user?.permissao_usuario[0]?.nome === "DIRETOR") {
      return true
    } else {
      return false
    }
  }

  const preenche_R = () => {
    const retorno = []
    for (let index = 0; index < 20; index++) {
      retorno.push(
        <TableCell key={id+'rcell'+index}sx={{ whiteSpace: 'nowrap' }}>
              <RHFSelect 
              disabled={mapDesabilitarSelect[index]} 
              name={'registros['+id+'].r['+index+']'}  
              label="">
                {r_options.map((r) => (
                  <MenuItem 
                  disabled={disableMenuItem(r, index)} 
                  key={id + '_r_' + index} value={r} sx={{ height: '34px' }}>
                        {r}
                    </MenuItem>
                ))}
                { //AQUI DEFINIMOS EM BASE NO ANO ESCOLAR, QUAIS R PODEM TER A OPÇÃO '2' COMO RESPOSTA
                  (((index == 9 || index == 19) && anoEscolar == '1' ) ||
                  ((index == 8 || index == 9 || index == 18 || index == 19) && anoEscolar == '2' ) ||
                  ((index == 7 || index == 8 || index == 9 || index == 17 || index == 18 || index == 19) && anoEscolar == '3' ))
                  && 
                <MenuItem key={id + '_r_' + index+1} value={2} sx={{ height: '34px' }}>
                  {2}
                </MenuItem>}
              </RHFSelect>
        </TableCell>
      ) 
    }
    return retorno;
  }

  const mediaLP = () => {
    let media = 0;
    
    for (let index = 0; index < 10; index++) {
      media += getValues('registros['+id+'].r['+index+']') == "" || getValues('registros['+id+'].r['+index+']') == 'NR' ? 0 : getValues('registros['+id+'].r['+index+']')

    }
    if (anoEscolar == '1') {
      media = (media * 10) / 11.00;
    }else if (anoEscolar == '2') {
      media = (media * 10) / 12.00;
    }else if (anoEscolar == '3') {
      // console.log((media * 10) / 13.00)
      media = (media * 10) / 13.00; 
    }
    // media = media * 10 // MULTIPLICAMOS POR 10 PARA PEGAR A PRIMERA CARA APÓS A VÍRGULA

    return media ;
  }

  const nivelEscritaLP = () => {
    if (getValues('registros['+id+'].r[9]') == 2) {
      return 'Completo';
    } else if (getValues('registros['+id+'].r[9]') == 1) {
      return 'Parcial';
    } else if (getValues('registros['+id+'].r[9]') === 0) {
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
   
  const mediaMAT = () => {
    let media = 0;
    for (let index = 10; index < 20; index++) {
      media += getValues('registros['+id+'].r['+index+']') == "" || getValues('registros['+id+'].r['+index+']') == 'NR' ? 0 : getValues('registros['+id+'].r['+index+']')
    }
    if (anoEscolar == '1') {
      media = (media * 10) / 11.00;
    }else if (anoEscolar == '2') {
      media = (media * 10) / 12.00;
    }else if (anoEscolar == '3') {
      media = (media * 10) / 13.00;
    }

    // media = media * 10 // MULTIPLICAMOS POR 10 PARA PEGAR A PRIMERA CARA APÓS A VÍRGULA

    return media;
  }
   
  const nivelResProb = () => {
    if (getValues('registros['+id+'].r[19]') == 2) {
      return 'Completo'
    } else if (getValues('registros['+id+'].r[19]') == 1) {
      return 'Parcial'
    } else if (getValues('registros['+id+'].r[19]') === 0) {
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
   
  const mediaFinal = () => {
    let media = 0;
    for (let index = 0; index < 20; index++) {
      media += getValues('registros['+id+'].r['+index+']') == "" || getValues('registros['+id+'].r['+index+']') == 'NR' ? 0 : getValues('registros['+id+'].r['+index+']')
    }
    if (anoEscolar == '1') {
      media = (media * 10) / 22.00;
    }else if (anoEscolar == '2') {
      media = (media * 10) / 24.00;
    }else if (anoEscolar == '3') {
      media = (media * 10) / 26.00;
    }

    // media = media * 10 // MULTIPLICAMOS POR 10 PARA PEGAR A PRIMERA CARA APÓS A VÍRGULA

    return media;
  }
   
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
  
  return (
    <TableRow hover selected={selected}>

        <TableCell sx={{ whiteSpace: 'nowrap', display: 'none'}} >
          <Controller
            name={`registros[${id}].id_aluno_turma`}
            control={control}
            defaultValue = {id}
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
            <RHFSelect key={id+'freq'} name={'registros[' + id + '].frequencia'} > 
                <MenuItem key={id + 'freq'} value='' sx={{ height: '34px' }}>
                  
                </MenuItem>
              {frequencia_options.map((freq) => (
                <MenuItem key={id + '_freq_' + freq} value={freq} sx={{ height: '34px' }}>
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
         mediaLP().toFixed(1) // Math.trunc(mediaLP()) / 10 // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
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
          mediaMAT().toFixed(1)
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
            mediaFinal().toFixed(1)
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
