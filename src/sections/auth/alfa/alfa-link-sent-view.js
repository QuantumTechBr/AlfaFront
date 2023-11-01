'use client';

// @mui
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AlfaLinkSentView() {

  const router = useRouter();


  return (
    <Container maxWidth="sm">
      <Typography component="div">
      <Box sx={{ fontSize: 'h2.fontSize', m: 1 }}>Um email foi enviado com um link para recuperação da senha.</Box>
      </Typography>
        

      <Link 
        component={RouterLink}
        href={paths.auth.alfa.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
          my: 2
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Voltar para o login
      </Link>
    </Container>
  );
}
