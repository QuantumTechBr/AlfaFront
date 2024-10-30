import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Iconify from 'src/components/iconify/iconify';
import { IconButton, Tooltip, Button } from '@mui/material';
import { CloseIcon } from 'yet-another-react-lightbox';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function ImportHelperButton({ ordemImportacao, nomeTela, linkDownload }) {

    const open = useBoolean(false);

    const handleOpen = () => {
        open.onTrue();
    }

    const onClose = (retorno = null) => {
        open.onFalse();
    };



    return (

        <>
            <Tooltip title="Como Importar ?">
                <IconButton
                    sx={{
                        marginBottom: "0.5em"
                    }}
                    onClick={handleOpen}

                >
                    <Iconify icon="gravity-ui:circle-question" />
                </IconButton>
            </Tooltip>
            {open &&
                <Dialog
                    fullWidth
                    maxWidth={false}
                    open={open.value}
                    onClose={onClose}
                    PaperProps={{
                        sx: {
                            maxWidth: 1330,
                            maxHeight: 850,
                        },
                    }}
                >
                    <DialogTitle>Como fazer a importação de dados dessa tela?</DialogTitle>

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
                        <br></br>
                        <Box sx={{
                            mb: 2
                        }} >
                            <Button
                                variant="contained"
                                fullWidth
                                color="info"
                                endIcon=''
                                href={linkDownload ?? ''}
                                download
                            >
                                BAIXAR MODELO DE IMPORTAÇÃO DE {nomeTela ?? ''}
                            </Button>
                            <br></br><br></br>
                            PASSO A PASSO PARA IMPORTAÇÃO:
                            <br></br><br></br>
                            1- Certifique-se que as colunas do que arquivo estão com nome exatamente igual ao modelo <br></br>
                            2- Certifique-ser que não há nenhuma coluna faltando no arquivo<br></br>
                            3- Colunas sobrando serão ignoradas. Recomendado excluí-las para deixar o arquivo mais leve.<br></br>
                            4- Certifique-se que o as linhas são referentes SOMENTE aos dados de 1º a 3º ano do fundamental. TODAS as linhas serão importadas. Dados sobressalentes podem interferir nas estatíscas e até mesmo causar lentidão dependendo do volume de dados.<br></br>
                            5- O arquivo deve ser em formato .csv ou .xlsx.<br></br>
                            6- Antes de importar dados deste módulo, certifique-se que os seguintes módulos já foram devidamente importados: {ordemImportacao ?? ''}<br></br>
                            7- Após iniciar a importação, acompanhe seu processo através do Django Admin. Evite iniciar processos de importação simultâneos.<br></br>
                            8- Lembre-se que caso um processo de importação retorne erro, por QUALQUER motivo, nenhum dado será atualizado.<br></br>

                        </Box>

                    </DialogContent>

                </Dialog >}
        </>
    );
}

ImportHelperButton.propTypes = {
    ordemImportacao: PropTypes.string,
    nomeTela: PropTypes.string,
    linkDownload: PropTypes.string,
};

