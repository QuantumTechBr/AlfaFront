const TipoVersaoAvaliacao = Object.freeze({
    FASE: 'FASE',
    DIAGNOSTICA: 'DIAGNOSTICA',
});

const StatusVersaoAvaliacao = Object.freeze({
    ATIVO: 'Ativo',
    INATIVO: 'Inativo'
});

const FrequenciaAvaliacaoAluno = Object.freeze({
    PRESENTE: 'Presente',
    AUSENTE: 'Ausente',
    TRANSFERIDO: 'Transferido(a)',
    NAO_RESPONDEU: 'Presente mas não respondeu o teste',
    ALUNO_NOVO: 'Aluno novo',
});

const PeriodoAvaliacaoAluno = Object.freeze({
    ENTRADA: 'Entrada',
    SAIDA: 'Saída'
});

export { 
    TipoVersaoAvaliacao, 
    StatusVersaoAvaliacao,
    FrequenciaAvaliacaoAluno
};
