DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

CREATE TABLE empresa (
    codigo serial PRIMARY KEY,
    nome text
);

INSERT INTO empresa(nome) VALUES 
                            ('Z'),
                            ('X');

CREATE TABLE usuario (
    codigo serial PRIMARY KEY,
    empresa_codigo integer,
    nome text,
    senha text,
    FOREIGN KEY (empresa_codigo) REFERENCES empresa(codigo)
);

INSERT INTO usuario (empresa_codigo, nome, senha) VALUES 
                                                (1, 'Welquer', '$2a$10$bRanRRqETtynMD1334ZnNeWNkHP8K8h5kIDjkqNb/t91yunKFhtR2'),
                                                (2, 'Joel', '$2a$10$bRanRRqETtynMD1334ZnNeWNkHP8K8h5kIDjkqNb/t91yunKFhtR2'),
                                                (2, 'Gustavo', '$2a$10$bRanRRqETtynMD1334ZnNeWNkHP8K8h5kIDjkqNb/t91yunKFhtR2');

CREATE TABLE produto (
    codigo serial PRIMARY KEY,
    nome text,
    descricao text,
    caminho_imagem text,
    empresa_codigo integer,
    FOREIGN KEY (empresa_codigo) REFERENCES empresa(codigo)
);

INSERT INTO produto (nome, descricao, caminho_imagem, empresa_codigo) VALUES 
                                                    ('Luva', 'Luvas de proteção tamanho X', 'https://fortpluscalcados.com/galerias/yJrb2gKL7rPdWLD/luva-verde-10fios-com-elastano-7LDdwEQ3gQ1a1YK_lg.jpg', 1),
                                                    ('Tesoura', 'Tesoura simples', 'https://singer.vteximg.com.br/arquivos/ids/161020-1000-1000/250020396_1.jpg?v=638000874871930000', 1),
                                                    ('Lapis', 'Lpais de escrever', 'https://lojacolegioscj.com.br/image/cache/data/api/produtos/16883-515x800.jpg?1652119600', 2),
                                                    ('Tenis', 'Tenis Branco Tamanho 40', 'https://imgcentauro-a.akamaihd.net/1366x1366/97360651.jpg', 2);