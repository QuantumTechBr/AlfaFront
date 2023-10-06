import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
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
import { S3Client, CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
//import { Upload } from '@aws-sdk/lib-storage';
import { Upload } from '@aws-sdk/lib-storage/dist-types';

import { AWS_S3 } from 'src/config-global';
import { insertDocumento, getAllDocumentos  } from './documento-repository';
// ----------------------------------------------------------------------

// Credencial AWS-S3
const s3Client = new S3Client({ region: AWS_S3.region, credentials: { accessKeyId: AWS_S3.accessKeyId, secretAccessKey: AWS_S3.secretAccessKey }});

export default function FileManagerNewFolderDialog({
  title = 'Enviar arquivos',
  open,
  onClose,
  //
  onCreate,
  onUpdate,
  //
  folderName,
  onChangeFolderName,
  ...other
}) {

  const [files, setFiles] = useState([]);

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

    onClose();
    const file = files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    const params = {
      Bucket: AWS_S3.bucketName,
      Key: file.name,
      Body: file,
      ContentType: file.type,
      ContentLength: file.size,
    }
    
    let multipartUpload = new CreateMultipartUploadCommand(params);

    const novoDocumento = {
      ano_id: 'e445d95b-e92c-4fe9-b6b2-10afc66178b9',  // Pegar o ano letivo current ver amanha com os meninos como pega o ano letivo current
      destino: file.name,
      link: AWS_S3.url + file.name,
    }

    try {
      const result = await s3Client.send(multipartUpload);
      console.log('Upload successful:', result);
    
      try {
        await insertDocumento(novoDocumento);
      } catch (error) {
        console.error(error);
        throw error;
      }

    } catch (error) {
      console.error('Upload error:', error);
      throw error;
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

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
        {(onCreate || onUpdate) && (
          <TextField
            fullWidth
            label="Nome da pasta"
            value={folderName}
            onChange={onChangeFolderName}
            sx={{ mb: 3 }}
          />
        )}

        <Upload multiple files={files} onDrop={handleDrop} onRemove={handleRemoveFile} />
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          onClick={handleUpload}
        >
          Subir documento
        </Button>

        {!!files.length && (
          <Button variant="outlined" color="inherit" onClick={handleRemoveAllFiles}>
            Remove all
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

FileManagerNewFolderDialog.propTypes = {
  folderName: PropTypes.string,
  onChangeFolderName: PropTypes.func,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
};
