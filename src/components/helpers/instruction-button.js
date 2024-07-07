import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Iconify from 'src/components/iconify/iconify';
import { IconButton, Tooltip } from '@mui/material';
import { CloseIcon } from 'yet-another-react-lightbox';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function InstructionButton({ youtubeLink }) {

    const open = useBoolean(false);

    const handleOpen = () => {
        open.onTrue();
    }

    const onClose = (retorno = null) => {
        open.onFalse();
    };



    return (

        <>
            <Tooltip title="Vídeo Instrucional">
                <IconButton
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
                        sx: { maxWidth: 1330,
                            maxHeight: 850,
                         },
                    }}
                >
                    <DialogTitle>Como devo utilizar essa tela?</DialogTitle>

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

                            <iframe
                                width="1280"
                                height="720"
                                src={youtubeLink}
                                title="YouTube video player"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            >
                            </iframe>


                        </Box>

                    </DialogContent>

                </Dialog >}
        </>
    );
}

InstructionButton.propTypes = {
    youtubeLink: PropTypes.string,
};

