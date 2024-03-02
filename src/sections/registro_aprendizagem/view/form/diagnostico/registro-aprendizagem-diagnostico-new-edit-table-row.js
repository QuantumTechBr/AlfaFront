import PropTypes from 'prop-types';
// @mui
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
//
import { _habilidades, habilidades_options, promo_options } from 'src/_mock';
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

export default function RegistroAprendizagemDiagnosticoNewEditTableRow({ row, selected, habilidades, periodo, onEditRow, onSelectRow, onDeleteRow }) {
  const { id, nome, necessidades_especiais, aluno, mapHabilidades, promo_ano_anterior, status, funcao, funcao_usuario, permissao_usuario, created_at, updated_at, deleted_at } = row;
  const { mapResultadosAlunoTurmaInicial } = useContext(RegistroAprendizagemContext);
  const { user } = useContext(AuthContext);

  const [mapResultados, setMapResultados] = useState([]);
  const { control } = useFormContext();

  const getMapResultados = useCallback(async () => {
    const mp = await mapResultadosAlunoTurmaInicial({
      alunoTurmaId: id,
    });
    setMapResultados(mp)
  }, [id, setMapResultados, mapResultadosAlunoTurmaInicial]);

  const preparacaoInicial = useCallback(async () => {
    if (periodo == 'Final') {
      getMapResultados();
    }
  }, [periodo, getMapResultados]);

  const nomeAluno = () => {
    return (
        <Box>
          {row.aluno.nome}
         {necessidades_especiais &&
          <Tooltip title={necessidades_especiais}>
            <Iconify 
              icon="mdi:wheelchair"
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
    '' : 5,
    'ND': 2,
    'DP': 3,
    'D': 4,
  };

  const disableSelect = (notaHab) => {
    if (notaHab == '') {
      return false    
    }
    if (user?.permissao_usuario[0]?.nome === "PROFESSOR" || user?.permissao_usuario[0]?.nome === "DIRETOR") {
      return true
    } else {
      return false;
    }
  }

  const disableMenuItem = (hab, habId) => {
    if (user?.permissao_usuario[0]?.nome == "PROFESSOR") {
      if (mapResultados[habId] == '') {
        return false
      } else {
        return mapDesabilitarMenuItem[hab] < mapDesabilitarMenuItem[mapResultados[habId]] ? true : false;
      }
    }
    if (user?.permissao_usuario[0]?.nome === "DIRETOR") {
      return true
    } else {
      return false
    }
  }

  return (
    <TableRow hover selected={selected}>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {nomeAluno()}  
        </TableCell>

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
            <RHFSelect key={id+'promo'} name={'registros[' + id + '].promo_ano_anterior'} > 
                <MenuItem key={id + '_promo_vazio'} value='' sx={{ height: '34px' }}>
                  
                </MenuItem>
              {promo_options.map((promo) => (
                <MenuItem key={id + '_promo_' + promo} value={promo} sx={{ height: '34px' }}>
                  {promo}
                </MenuItem>
              ))}
            </RHFSelect>
        </TableCell>

        {habilidades.map((habilidade) => {
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
        })}
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
};
