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

import { AWS_S3 } from 'src/config-global';
import { insertDocumento, getAllDocumentos } from './documento-repository';

import { HttpRequest } from '@aws-sdk/protocol-http';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { parseUrl } from '@aws-sdk/url-parser';
import { Sha256 } from '@aws-crypto/sha256-browser';
import { Hash } from '@aws-sdk/hash-node';
import { formatUrl } from '@aws-sdk/util-format-url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createRequest } from '@aws-sdk/util-create-request';
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
} from "@aws-sdk/client-transcribe";

// ----------------------------------------------------------------------

// Credencial AWS-S3
const s3Client = new S3Client({
  region: AWS_S3.region,
  credentials: { accessKeyId: AWS_S3.accessKeyId, secretAccessKey: AWS_S3.secretAccessKey },
});

// Create the AWS Transcribe transcription job.
const createTranscriptionJob = async (recording, jobName, bucket, key) => {
  // Set the parameters for transcriptions job
  const params = {
    TranscriptionJobName: jobName + '-job',
    LanguageCode: 'pt-BR', // For example, 'en-US',
    OutputBucketName: bucket,
    OutputKey: key,
    Media: {
      MediaFileUri: recording, // For example, "https://transcribe-demo.s3-REGION.amazonaws.com/hello_world.wav"
    },
  };
  try {
    // Start the transcription job.
    const data = await s3Client.send(new StartTranscriptionJobCommand(params));
    console.log('Success - transcription submitted', data);
  } catch (err) {
    console.log('Error', err);
  }
};

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

    // const params = {
    //   Bucket: AWS_S3.bucketName,
    //   Key: file.name,
    //   Body: file,
    //   ContentType: file.type,
    //   ContentLength: file.size,
    // }

    // let multipartUpload = new CreateMultipartUploadCommand(params);

    const Key = file.name;
    let signedUrl;
    let response;

    //   const params = {
    //     Bucket: AWS_S3.bucketName,
    //     Key: file.name,
    //     Body: file,
    //     ContentType: file.type,
    //     ContentLength: file.size,
    //  }

    const novoDocumento = {
      ano_id: 'e445d95b-e92c-4fe9-b6b2-10afc66178b9', // Pegar o ano letivo current ver amanha com os meninos como pega o ano letivo current
      destino: Key,
      link: AWS_S3.url + Key,
    };

    try {
      const signer = new S3RequestPresigner({ ...s3Client.config });

      // creating file upload request
      const request = await createRequest(
        s3Client,
        new PutObjectCommand({ Key, Bucket: AWS_S3.bucketName })
      );

      const expire = new Date(Date.now() + 60 * 60 * 1000);

      const expiration = new Date(Date.now() + 60 * 60 * 1000);
      // Create and format the presigned URL.
      signedUrl = formatUrl(await signer.presign(request, expiration));
      console.log(`\nPutting "${Key}"`);
    } catch (err) {
      console.log('Error creating presigned URL', err);
    }

    try {
      // Upload the object to the Amazon S3 bucket using a presigned URL.
      response = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'content-type': file.type,
        },
        body: file.body,
        
      });
      // Create the transcription job name. In this case, it's the current date and time.
      const today = new Date();
      const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      const time = today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds();
      const jobName = date + '-time-' + time;

      // Call the "createTranscriptionJob()" function.
      createTranscriptionJob('s3://' + AWS_S3.bucketName + '/' + Key, jobName, AWS_S3.bucketName, Key);
    } catch (err) {
      console.log('Error uploading object', err);
    }

    await insertDocumento(novoDocumento);
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

FileManagerNewFolderDialog.propTypes = {
  folderName: PropTypes.string,
  onChangeFolderName: PropTypes.func,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
};
