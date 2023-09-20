// sections

import { RegistroAprendizagemDiagnosticoCreateView } from "src/sections/registro_aprendizagem/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Nova Avaliação de Diagnóstico',
};

export default function RegistroAprendizagemDiagnosticoCreatePage() {   
  const periodo = 'Inicial';

  const turma = {
    "id": "6ec720d9-5ba0-4999-aa96-612dcf300d73",
    "ano_escolar": "3",
    "nome": "C",
    "escola": {
        "id": "d2a66924-98c8-4af5-b0b8-99f1a18b155d",
        "nome": "ESCOLA MANAUS",
        "cidade": {
            "id": "4a12c279-f19a-fae9-9c97-9b503e4bbc2c",
            "nome": "MANAUS",
            "estado": {
                "id": "92553102-9fbc-4c4e-b7ce-55e662a4c22c",
                "created_at": "2022-09-03 13:48:58",
                "updated_at": "2023-06-20 13:30:17",
                "deleted_at": null,
                "nome": "AMAZONAS"
            },
            "created_at": "2022-09-03 13:48:58",
            "updated_at": "2023-06-20 13:30:17",
            "deleted_at": null
        },
        "zona": {
            "id": "524a4f79-7fdc-14ce-008c-b4c0ef0be1a3",
            "nome": "RURAL",
            "cidade": {
                "id": "4a12c279-f19a-fae9-9c97-9b503e4bbc2c",
                "nome": "MANAUS",
                "estado": {
                    "id": "92553102-9fbc-4c4e-b7ce-55e662a4c22c",
                    "created_at": "2022-09-03 13:48:58",
                    "updated_at": "2023-06-20 13:30:17",
                    "deleted_at": null,
                    "nome": "AMAZONAS"
                },
                "created_at": "2022-09-03 13:48:58",
                "updated_at": "2023-06-20 13:30:17",
                "deleted_at": null
            },
            "nome_responsavel": "EDUCAÇÃO",
            "fone_responsavel": "0000-0000",
            "email_responsavel": "email@email.com.br",
            "created_at": "2022-09-03 13:48:58",
            "updated_at": "2023-06-20 13:30:17",
            "deleted_at": null
        },
        "endereco": "Apt 1470",
        "aluno_escola": [
            {
                "id": "6f3507d8-94b4-4f56-87fd-9c6c88d5f2d9",
                "aluno": {
                    "id": "e7819d82-77eb-49f5-a432-bbeaa467cf66",
                    "nome": "Gill",
                    "matricula": "621-65-0184",
                    "data_nascimento": "2021-04-23",
                    "created_at": "2022-09-23 16:27:17",
                    "updated_at": "2023-04-20 02:48:56",
                    "deleted_at": null
                },
                "ano": {
                    "id": "e445d95b-e92c-4fe9-b6b2-10afc66178b9",
                    "created_at": "2022-01-01 06:07:25",
                    "updated_at": "2023-02-09 14:12:39",
                    "deleted_at": null,
                    "ano": 2022,
                    "status": "FINALIZADO",
                    "data_inicio": "2022-01-01",
                    "data_fim": "2022-12-31"
                },
                "created_at": "2023-08-15 20:00:00",
                "updated_at": "2022-12-08 20:00:00",
                "deleted_at": null
            },
            {
                "id": "929ca086-6b7b-42b9-aff3-4a8226a0ff2d",
                "aluno": {
                    "id": "fac83083-1271-46c0-8fa1-40f6632b8dd5",
                    "nome": "Haydon",
                    "matricula": "653-45-0574",
                    "data_nascimento": "2016-04-28",
                    "created_at": "2022-12-03 04:49:23",
                    "updated_at": "2022-09-03 05:39:09",
                    "deleted_at": null
                },
                "ano": {
                    "id": "92553102-9fbc-4c4e-b7ce-55e662a4c20c",
                    "created_at": "2023-01-01 13:48:58",
                    "updated_at": "2023-06-20 13:30:17",
                    "deleted_at": null,
                    "ano": 2023,
                    "status": "NÃO FINALIZADO",
                    "data_inicio": "2023-01-01",
                    "data_fim": "2023-12-31"
                },
                "created_at": "2023-06-21 20:00:00",
                "updated_at": "2023-05-23 20:00:00",
                "deleted_at": null
            }
        ],
        "created_at": "2023-03-28 20:00:00",
        "updated_at": "2022-11-15 20:00:00",
        "deleted_at": null
    },
    "ano": {
        "id": "d10279f7-1510-4103-914c-6f838e872ab1",
        "created_at": "2021-01-01 00:19:59",
        "updated_at": "2023-04-27 19:41:02",
        "deleted_at": null,
        "ano": 2021,
        "status": "FINALIZADO",
        "data_inicio": "2021-01-01",
        "data_fim": "2021-12-31"
    },
    "status": true,
    "turno": "VESPERTINO",
    "aluno_turma": [
        {
            "id": "b25f7806-fe3e-496a-9539-cba26355b8b2",
            "aluno": {
                "id": "154a9982-9d8e-4a1a-86ff-b15d2e0c539d",
                "nome": "Itch",
                "matricula": "895-02-9974",
                "data_nascimento": "2019-04-19",
                "created_at": "2023-04-08 10:57:26",
                "updated_at": "2023-06-15 18:20:56",
                "deleted_at": null
            },
            "created_at": "2023-05-14 20:00:00",
            "updated_at": "2023-01-31 20:00:00",
            "deleted_at": null,
            "mapHabilidades": []
        }
    ],
    "professor_turma": [],
    "created_at": "2023-04-05 20:00:00",
    "updated_at": "2023-06-19 20:00:00",
    "deleted_at": null
};

  return <RegistroAprendizagemDiagnosticoCreateView turma={turma} periodo={periodo} />;
}