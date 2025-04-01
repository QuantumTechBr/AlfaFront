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
import { use, useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from 'src/auth/context/alfa';
import Iconify from 'src/components/iconify';
import { Box } from '@mui/material';
import { set } from 'lodash';
// ----------------------------------------------------------------------

export default function AvaliacaoDiagnosticoNewEditTableRow({ row, selected, habilidades, periodo, onEditRow, onSelectRow, onDeleteRow, turma, versaoAvaliacao }) {
  const { id, nome, aluno, mapHabilidades, frequencia, status, funcao, funcao_usuario, permissao_usuario, created_at, updated_at, deleted_at } = row;
  const { user } = useContext(AuthContext);
  const { control, getValues, watch, setValue } = useFormContext();
  const desabilitaResposta = useBoolean(false);
  const eAdmin = useBoolean(false);
  const values = watch();
  const [media_lp, setMedia_lp] = useState('-');
  const [media_mat, setMedia_mat] = useState('-');
  const [media_final, setMedia_final] = useState('-');

  let somaPesosPt = 0;
  let somaPesosMat = 0;
  let somaPesosFinal = 0;
  if (versaoAvaliacao?.questoes) {
    for (const questao of versaoAvaliacao.questoes) {
      if (questao.disciplina.nome == 'Língua Portuguesa') {
        somaPesosPt += questao.peso;
      } else if (questao.disciplina.nome == 'Matemática') {
        somaPesosMat += questao.peso;
      }
      somaPesosFinal += questao.peso;
    }
  } else {
    // throw new Error('Não foi possível carregar as questões da avaliação');
  }

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

  const preenche_R = () => {
    const retorno = []
    if (!versaoAvaliacao?.questoes) {
      return retorno
    }
    for (const questao of versaoAvaliacao.questoes) {
      retorno.push(
        <TableCell key={id + 'rcell' + questao.numero_questao} sx={{ whiteSpace: 'nowrap' }}>
          <RHFSelect
            disabled={desabilitaResposta.value}
            name={'registros[' + id + '].r[' + questao.numero_questao + ']'}
            label="">
            {questao.alternativas.map((alternativa) => (
              <MenuItem
                  key={id + '_r_' + questao.numero_questao + '_' + alternativa.numero_alternativa} value={alternativa.id} sx={{ height: '34px' }}>
                <Tooltip placement="top" title={alternativa.observacao ?? alternativa.resposta}>
                  <span>{alternativa.resposta}</span>
                </Tooltip>
              </MenuItem>
            ))}
          </RHFSelect>
        </TableCell>
      )
    }
    return retorno;
  }


  const nivelDisciplina = (disciplina) => {
    if (!getValues('registros[' + id + '].r') || !versaoAvaliacao?.questoes?.length) {
      return '-';
    }
    // definido na ultima questao de portugues
    const ultimaQuestaoPt = versaoAvaliacao.questoes.filter((questao) => questao.disciplina.nome == disciplina).pop();
    const ultimaRespostaPt = ultimaQuestaoPt.alternativas.find((alternativa) => alternativa.id == getValues('registros[' + id + '].r[' + ultimaQuestaoPt.numero_questao + ']'));
    if (ultimaRespostaPt?.valor_resposta == 2) {
      return 'Completo'
    } else if (ultimaRespostaPt?.valor_resposta == 1) {
      return 'Parcial'
    } else if (ultimaRespostaPt?.valor_resposta == 0) {
      return 'Insuficiente'
    } else {
      return '-'
    }
  }

  const nivelLP = () => {
    if (media_lp < 5) {
      return 'FASE PRÉ-ALFABÉTICA';
    } else if (media_lp < 10) {
      return 'FASE ALFABÉTICA PARCIAL';
    } else if (media_lp >= 10) {
      return 'FASE ALFABÉTICA COMPLETA';
    } else {
      return '-';
    }
  }


  const nivelMAT = () => {
    if (media_mat < 5) {
      return 'FASE PRÉ-LETRAMENTO';
    } else if (media_mat < 10) {
      return 'FASE LETRAMENTO PARCIAL';
    } else if (media_mat >= 10) {
      return 'FASE LETRAMENTO COMPLETO';
    } else {
      return '-';
    }
  }


  const nivelFinal = () => {
    if (media_final <= 4) {
      return 'N1';
    } else if (media_final <= 8) {
      return 'N2';
    } else if (media_final > 8) {
      return 'N3';
    } else {
      return '-';
    }
  }

  useEffect(() => {
    if (freqCheck == 'Ausente') {
        setValue('registros[' + id + '].r', new Map());
      desabilitaResposta.onTrue()
    }
    else {
      desabilitaResposta.onFalse()
    }
  }, [freqCheck]);

  useEffect(() => {
    user.permissao_usuario.map((perm) => {
      if (perm.nome === "SUPERADMIN" || perm.nome === "ADMIN") {
        eAdmin.onTrue();
      }
    })
  }, [user]);

  useEffect(() => {
    let pt = true;
    let mat = true;
    let pt_mat = true;
    let mediaPt = 0;
    let mediaMat = 0;
    let mediaFinal = 0;
    for (const index in getValues('registros[' + id + '].r')) {
      const respostaId = getValues('registros[' + id + '].r[' + index + ']');
      const questao = versaoAvaliacao?.questoes.find((questao) => questao.numero_questao == index);
      if (!questao) {
        console.log('Questão não encontrada: ', index);
        continue;
      }
      if (!respostaId) {
        if (questao.disciplina.nome == 'Língua Portuguesa') {
          pt = false;
        } else if (questao.disciplina.nome == 'Matemática') {
          mat = false;
        }
        pt_mat = false;
        continue;
      }
      const resposta = questao?.alternativas.find((resposta) => resposta.id == respostaId);
      if (resposta?.valor_resposta != undefined) {
        mediaFinal += resposta.valor_resposta;
      }
      if (questao?.disciplina?.nome == 'Matemática') {
        if (resposta?.valor_resposta != undefined) {
          mediaMat += resposta.valor_resposta;
        } 
      } else if (questao?.disciplina?.nome == 'Língua Portuguesa') {
        if (resposta?.valor_resposta != undefined) {
          mediaPt += resposta.valor_resposta;
        } 
      }
    }

    if (pt_mat) {
      setMedia_final(mediaFinal*10/somaPesosFinal);
      
    } else {
      setMedia_final('-');
    }
    if (mat) {
      setMedia_mat(mediaMat*10/somaPesosMat);
    } else {
      setMedia_mat('-');
    }
    if (pt) {
      setMedia_lp(mediaPt*10/somaPesosPt);
    } else {
      setMedia_lp('-');
    }
  },[watch()])

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

      {preenche_R()}

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {
          media_lp == '-' ? media_lp : media_lp.toFixed(1)
        }
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nivelDisciplina('Língua Portuguesa')}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nivelLP()}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {
          media_mat == '-' ? media_mat : media_mat.toFixed(1)
          // Math.trunc(mediaMAT()) / 10 // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
        }
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nivelDisciplina('Matemática')}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nivelMAT()}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {
          media_final == '-' ? media_final : media_final.toFixed(1)
          // Math.trunc(mediaFinal()) / 10 // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
        }
      </TableCell>

      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nivelFinal()}
      </TableCell> */}

    </TableRow>
  );
  
}

AvaliacaoDiagnosticoNewEditTableRow.propTypes = {
  periodo: PropTypes.string,
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  turma: PropTypes.object,
};
