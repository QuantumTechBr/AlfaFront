import PropTypes from 'prop-types';
import { useEffect, useState, useContext, useCallback } from 'react';
// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// routes
import { useRouter } from 'src/routes/hook';

import { IconButton } from '@mui/material';
import { CloseIcon } from 'yet-another-react-lightbox';

import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';
import Typography from '@mui/material/Typography';
import userMethods from '../user/user-repository';


// ----------------------------------------------------------------------

export default function VisualizaImportacao({ open, onClose, importacao }) {
  const {
    descricao,
    criadoPor,
    quantidadeLinhas,
    inicioValidacao,
    inicioProcessamnto,
    conclusaoValidacao,
    conclusaoProcessamento,
    erros,
  } = importacao;

  const [nomeCriadoPor, setNomeCriadoPor] = useState('');

  useEffect( async () => {
    await userMethods.getUserById(criadoPor).then((resultado) => {
      setNomeCriadoPor(resultado.data.nome)
    })
      
  }, []);

  function formatarData(dataString) {
    // Cria um objeto Date a partir da string
    const data = new Date(dataString);
  
    // Extrai os componentes da data
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    const segundos = data.getSeconds().toString().padStart(2, '0');
  
    // Concatena os componentes no formato desejado
    return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
  }

  const data_inicioValidacao = inicioValidacao ? formatarData(inicioValidacao) : '';
  const data_inicioProcessamnto = inicioProcessamnto ? formatarData(inicioProcessamnto) : '';
  const data_conclusaoValidacao = conclusaoValidacao ? formatarData(conclusaoValidacao) : '';
  const data_conclusaoProcessamento = conclusaoProcessamento ? formatarData(conclusaoProcessamento) : '';


  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 1500, minHeight: 600 },
      }}
    >
      <DialogTitle>Visualização de Importação</DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(4, 1fr)',
                }}
                sx={{
                  minHeight: 450,
                }}
              >
                <div>
                  <Label>Descrição</Label>
                  <Typography>{descricao}</Typography>
                </div>
                <div>
                  <Label>Criado Por</Label>
                  <Typography>{nomeCriadoPor}</Typography>
                </div>
                <div>
                  <Label>Data de Início de Validação</Label>
                  <Typography>{data_inicioValidacao}</Typography>
                </div>
                <div>
                  <Label>Data de Conclusão de Validação</Label>
                  <Typography>{data_conclusaoValidacao}</Typography>
                </div>
                <div>
                  <Label>Data de Início de Processamento</Label>
                  <Typography>{data_inicioProcessamnto}</Typography>
                </div>
                <div>
                  <Label>Data de Conclusão de Processamento</Label>
                  <Typography>{data_conclusaoProcessamento}</Typography>
                </div>
                <div>
                  <Label>Quantidade de Linhas</Label>
                  <Typography>{quantidadeLinhas}</Typography>
                </div>
                
              </Box>
              <div>
                  <Label>Erros</Label>
                  <Typography>{erros}</Typography>
                </div>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

VisualizaImportacao.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  importacao: PropTypes.object,
};
