'use client';

import axios, { endpoints } from 'src/utils/axios';
import { TipoVersaoAvaliacao } from './enums';

export const getVersaoAvaliacao = ({tipo='', anoEscolar='', dataAplicavel='', status='ATIVO'}) => axios.get(endpoints.avaliacao.versaoAvaliacao.concat(`?tipo=${tipo}&ano_escolar=${anoEscolar}&periodo_aplicavel=${dataAplicavel}&status=${status}`));

export const insertRegistroAprendizagem = payload => axios.post(endpoints.avaliacao.post, payload);
export const getAllRegistrosAprendizagem = () => axios.get(endpoints.avaliacao.list);
export const updateRegistroAprendizagemById = (id, payload) => axios.patch(endpoints.avaliacao.update.concat(id), payload);
export const deleteRegistroAprendizagemById = id => axios.delete(endpoints.avaliacao.delete.concat(id));
export const getRegistroAprendizagemById = id => axios.get(endpoints.avaliacao.get_by_id.concat(id));
export const deleteAvaliacaoAlunoByFilter = ({tipo='', bimestreId='', turmaId='', periodo='', alunoTurmaId=''}) => axios.delete(endpoints.avaliacao.delete_by_filter.concat(`?tipo=${tipo}&bimestre=${bimestreId}&turma=${turmaId}&periodo=${periodo}&aluno_turma=${alunoTurmaId}`));

export const getListIdTurmaAvaliacaoAluno = (payload) => axios.post(endpoints.avaliacao.idsTurmaList.concat(`/?limit=${payload.limit}&offset=${payload.offset}`), payload);

export const insertAvaliacaoDiagnostico = payload => axios.post(endpoints.avaliacao.diagnostico.baseUrl, payload);
export const getAllAvaliacaoDiagnostico = ({turmaId=[], nome='', periodo='', promoAnoAnterior='', alunoTurmaId=[]}) => axios.get(endpoints.avaliacao.baseUrl.concat(`?tipo=${TipoVersaoAvaliacao.DIAGNOSTICA}&turma_id=${turmaId}&periodo=${periodo}&aluno_turma=${alunoTurmaId}`));
export const updateRegistroAprendizagemDiagnosticoById = (id, payload) => axios.patch(endpoints.avaliacao.diagnostico.update.concat(id), payload);
export const exportFileDiagnosticoList = (query) => axios.get(endpoints.avaliacao.diagnostico.list.concat(`/?`).concat(query));
export const importFileDiagnostico = (payload) => axios.post(endpoints.avaliacao.diagnostico.import, payload, { headers: { 'Content-Type': 'multipart/form-data' } });

export const insertRegistroAprendizagemFase = payload => axios.post(endpoints.avaliacao.fase.post, payload);
export const getAllRegistrosAprendizagemFase = ({turmaId='', bimestreId='', alunoTurmaId=''}) => axios.get(endpoints.avaliacao.fase.list.concat(`/?turma=${turmaId}&bimestre=${bimestreId}&aluno_turma=${alunoTurmaId}`));
export const updateRegistroAprendizagemFaseById = (id, payload) => axios.patch(endpoints.avaliacao.fase.update.concat(id), payload);
export const getRegistroAprendizagemFaseById = id => axios.get(endpoints.avaliacao.fase.get_by_id.concat(id));
export const exportFileFaseList = (query) => axios.get(endpoints.avaliacao.fase.list.concat(`/?`).concat(query));
export const importFileFase = (payload) => axios.post(endpoints.avaliacao.fase.import, payload, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getRelatorioAvaliacaoPorTurma = (payload) => axios.post(endpoints.avaliacao.relatorioAvaliacaoFasePorTurma, payload);
export const getRelatorioAvaliacaoPorEscola = (payload) => axios.post(endpoints.avaliacao.relatorioAvaliacaoFasePorEscola, payload);

const avaliacaoMethods = {
    getVersaoAvaliacao,
    insertRegistroAprendizagem,
    getAllRegistrosAprendizagem,
    updateRegistroAprendizagemById,
    deleteRegistroAprendizagemById,
    getRegistroAprendizagemById,
    deleteAvaliacaoAlunoByFilter,
    insertAvaliacaoDiagnostico,
    getAllAvaliacaoDiagnostico,
    updateRegistroAprendizagemDiagnosticoById,
    getListIdTurmaAvaliacaoAluno,
    exportFileDiagnosticoList,
    insertRegistroAprendizagemFase,
    getAllRegistrosAprendizagemFase,
    updateRegistroAprendizagemFaseById,
    getRegistroAprendizagemFaseById,
    exportFileFaseList,
    importFileDiagnostico,
    importFileFase,
    getRelatorioAvaliacaoPorTurma,
    getRelatorioAvaliacaoPorEscola
};

export default avaliacaoMethods;




