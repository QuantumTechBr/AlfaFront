import PropTypes from 'prop-types';
import { useEffect, useState, useCallback, useContext } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';

// components
import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';


// utils
import axios, { endpoints } from 'src/utils/axios';


// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { insertDocumentoIntervencao } from './documento-intervencao-repository';



export default function PlanoIntervencaoFileManagerNewFolderDialog({
  title = 'Enviar arquivos',
  open,
  onClose,
  //
  onCreate,
  onUpdate,
  //
  folderName,
  onChangeFolderName,
  planoId,
  ...other
}) {
  const [files, setFiles] = useState([]);

  const [descricao, setDescricao] = useState([]);
  
  const uploading = useBoolean(false); 

  useEffect(() => {
    if (!open) {
      setFiles([]);
    }
  }, [open]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles([...files, ...newFiles]);
    },
    [files]
  );

  const handleUpload = async () => {
    let response;
    const promises = [];

    
    try {

      files.forEach(async file => {
      
        
        const formData = new FormData();
        
        formData.append('plano_id', planoId);
        formData.append('arquivo', file)
        const config = {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }
        response = insertDocumentoIntervencao(formData).catch(erro => {
          console.log("upload erro");
          throw erro;
        });
        promises.push(response);
        
      })


      
    } catch (err) {
      console.log('Erro ao fazer upload', err);
      throw err;
    } finally {
      Promise.all(promises).then(() =>{
        onClose(true);
        uploading.onFalse();
      })
    }
    
  };

  const handleRemoveFile = (inputFile) => {
    const filtered = files.filter((file) => file !== inputFile);
    setFiles(filtered);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> {title} </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none'}}>
        {(onCreate || onUpdate) && (
          <TextField
            fullWidth
            label="Nome da pasta"
            value={folderName}
            onChange={onChangeFolderName}
            sx={{ mb: 3 }}
          />
        )}
        {uploading.value ? 
          <Box sx={{ display: 'flex', minHeight: '100px', alignItems: 'center', justifyContent: 'center', gap: '1em' }}>
            <CircularProgress />
            Enviando...
          </Box> :
          <Upload multiple files={files} onDrop={handleDrop} onRemove={handleRemoveFile} />
        }

      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          onClick={() => {uploading.onTrue(); handleUpload();}}
        >
          Subir documento
        </Button>

        {!!files.length && (
          <Button variant="outlined" color="inherit" onClick={handleRemoveAllFiles}>
            Remover todos
          </Button>
        )}

        {(onCreate || onUpdate) && (
          <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
            <Button variant="soft" onClick={onCreate || onUpdate}>
              {onUpdate ? 'Save' : 'Create'}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}

PlanoIntervencaoFileManagerNewFolderDialog.propTypes = {
  folderName: PropTypes.string,
  onChangeFolderName: PropTypes.func,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
};
