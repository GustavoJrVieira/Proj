const db = require('./db');
const http = require('http');
const cors = require('cors');
const express = require('express');
const { readFile } = require('fs');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const fs = require('fs');
// CAMINHO ONDE ELE BUSCA AS IMAGENS
const DIRETORIO_ARQUIVO = 'C:\Users\\joel_\\si-24-7a\\3a-avaliacao\\imagens\\';

const app = express();
app.use(express.json());
app.use(cors());

// INICIA O SERVIDOR
http.createServer({}, app).listen(3002, () => {
    console.log(`Serviço iniciado!`);
    iniciaAtualizaBanco();
});

// FAMOSO "Hello world"
app.get('/', (requisicao, resposta) => {
    resposta.json('olá mundo');
});
// FIM SETUP INICIALIZAÇÃO

// INICIO LOGIN
// CHAVE UTILIZADA PARA GERAR O TOKEN
const TOKEN_KEY = '4a6a08e2-9d48-4210-bf8f-058a9b3bcaa5';

app.post('/login', async (requisicao, resposta) => {
    const { nome, senha } = requisicao.body;

    if (!(nome && senha)) {
        return resposta.status(400).json({ message: 'Obrigatório informar o usuário e senha para autenticar' });
    }

    // encontrar um usuário com o nome informado no login
    const { rows } = await findUsuario(null, nome);
    var usuario = rows[0];

    // comparar a senha informada com a senha salva para o usuário
    if (!!usuario && (await bcrypt.compare(senha, usuario.senha))) {
       usuario.token = criarToken({ nome }, TOKEN_KEY);
        return resposta.status(200).json(usuario);
    }
    return resposta.status(401).json({ erro: 'Nome e/ou senha inválidos' });
});

// VALIDA O TOKEN DAS REQUISIÇÕES, É NECESSARIO QUE AS REQUSIÇÕES PARA SEREM ACEITAS POSSUAM O HEADER "access-token"
const validarToken = (requisicao, resposta, next) => {
    const accessToken = requisicao.headers['access-token'];

    if (!accessToken) {
        return resposta.status(403).json({ message: 'Um token de identificação é necessário' });
    }
    try {
        const decoded = jwt.verify(accessToken, TOKEN_KEY);
        requisicao.user = decoded;
    } catch (err) {
        return resposta.status(401).json({ message: 'Token inválido' });
    }
    return next();
};

// END POINT PARA GERAR UMA SENHA CRIPTOGRAFADA, BASTA ENVIAR A SENHA Q SE DESEJA CRIPTOGRAFAR
app.get('/gera-senha', async (requisicao, resposta) => {
    const { senha } = requisicao.body;
    if (senha) {
        return resposta.status(200).json({ senha: `${gerarSenha(senha)}` });
    } else {
        return resposta.status(400).json({ mensagem: 'Nenhuma senha encontrada no Body! EX: { "senha": "teste" }' });
    }
});

// END POINT PARA VALIDAR SE A SENHA CRIPTOGRAFADA COINCIDE COM A SENHA ENVIADA, BASTA ENVIAR A SENHA Q DESEJA COMPARAR E ELA CRIPTOGRAFADA EX: { "senha":"teste", "senhaCriptografada":"$2a$10$bRanRRqETtynMD1334ZnNeWNkHP8K8h5kIDjkqNb/t91yunKFhtR2" }
app.get('/valida-senha', async (requisicao, resposta) => {
    const { senha, senhaCriptografada } = requisicao.body;
    if (senha && senhaCriptografada) {
        return resposta.status(200).json({ resultado: `${await bcrypt.compare(senha, senhaCriptografada)}` });
    } else {
        return resposta.status(400).json({ mensagem: 'Nenhuma senha encontrada no Body! EX: { "senha": "teste", "senhaCriptografada": "teste" }' });
    }
});

// METODO PARA CRIAR A O TOKEN DE ACESSO AO USUARIO
criarToken = (data, tokenKey) => {
    return jwt.sign(
        data,
        tokenKey,
        {
            expiresIn: '1h',
        }
    );
}

// METODO PARA GERAR A SENHA, CRIADO PARA UTILIZAR TANTO AO GERAR QUANTO AO EDITAR O USUARIO
gerarSenha = (senha) => {
    return bcrypt.hashSync(senha, salt);
}
// FIM LOGIN

// INICIO BANCO DE DADOS
// AUTOMATICAMENTE, RODA OS COMANDOS NECESSARIOS PARA A ESTRUTURA BASICA DO BANCO CASO ALGUMA TABELA N EXISTA
async function iniciaAtualizaBanco() {

    try {
        // VERIFICA SE AS TABELAS EXISTES E EM CASO DE ERRO TENTA RODAR OS COMANDOS DO BD   
        const resultEmpresa = await db.query('SELECT * FROM empresa');
        const resultUsuario = await db.query('SELECT * FROM usuario');
        const resultProduto = await db.query('SELECT * FROM produto');
        console.log("Banco iniciado!");
    } catch (erro) {
        console.log("As tabelas ainda não foram criadas!");
        console.log("Criando estrutura do banco de dados!");

        readFile('./migracao/versao-1.sql', 'utf8', async (erro, data) => {
            if (erro) {
                console.error(erro)
                return;
            }
            try {
                await db.query(data);
                console.log("Estrutura criada com sucesso :D");
            } catch (erroFinal) {
                console.log("È, deu cagada mesmo!!!!!!", erroFinal)
            }
        });
    }
};
// FIM BANCO DE DADOS

// INICIO EMPRESA
app.get('/empresa', validarToken, async (requisicao, resposta) => {
    const resultUsuario = await db.query(`SELECT * 
                                          FROM empresa;`);
    resposta.json(resultUsuario.rows);
})
// FIM EMPRESA

// INICIO END POINT USUARIO
app.get('/usuario', validarToken, async (requisicao, resposta) => {
    try {
        const { codigoUsuario } = requisicao.params;
        const { nomeUsuario, codigoEmpresa } = requisicao.body;
        resposta.status(200).json(await findUsuario(codigoUsuario, nomeUsuario, codigoEmpresa));
    } catch (err) {
        console.log("Erro end point get/usuario", err);
        resposta.status(500).json({ mensagem: err.message });
    }
});

app.post('/usuario', validarToken, async (requisicao, resposta) => {
    try {
        const usuario = requisicao.body;
        usuario.senha = gerarSenha(senha);
        await insertUsuario(requisicao.body);
        resposta.status(200).json(`Usuario ${(await findLastUsuarioCodigo()).rows[0].max} criado!`);
    } catch (err) {
        console.log("Erro end point post/usuario", err);
        resposta.status(500).json({ mensagem: err.message });
    }
})

app.delete('/usuario/:codigoUsuario', validarToken, async (requisicao, resposta) => {
    try {
        const { codigoUsuario } = requisicao.params;
        const retorno = await deleteUsuario(codigoUsuario);
        if (retorno.rowCount > 0) {
            resposta.status(200).json(`Usuario ${codigoUsuario} excluído!`);
        } else {
            resposta.status(200).json(`Usuario ${codigoUsuario} já foi excluido, ou não existe!`);
        }
    } catch (err) {
        console.log("Erro end point delete/usuario", err);
        resposta.status(500).json({ mensagem: err.message });
    }
})

app.put('/usuario/:codigoUsuario', validarToken, async (requisicao, resposta) => {
    try {
        const { codigoUsuario } = requisicao.params;
        const usuarioAtualizar = requisicao.body;
        const usuarioAtual = (await findUsuario(codigoUsuario, null, null)).rows;

        // VERIFICA E ALTERA APENAS OS CAMPOS ENVIADOS PARA O BACKEND QUE FORAM ALTERADOS
        Object.keys(usuarioAtualizar).forEach(key => {
            if (usuarioAtual[key] !== usuarioAtualizar[key]) {
                usuarioAtualizar[key] == 'senha' ? usuarioAtualizar[key] = gerarSenha(senha) : '';
                usuarioAtual[key] = usuarioAtualizar[key];
            }
        });
        const retorno = await updateUsuario(usuarioAtualizar, codigoUsuario);
        if (retorno.rowCount > 0) {
            resposta.status(200).json(`Usuario ${codigoUsuario} alterado!`);
        } else {
            resposta.status(200).json(`Usuario ${codigoUsuario} não encontrado/aterado!`);
        }
    } catch (err) {
        console.log("Erro end point put/usuario", err);
        resposta.status(500).json({ mensagem: err.message });
    }
})
// FIM END POINT USUARIO

// INICIO END POINT PACIENTE
app.get('/paciente', validarToken, async (requisicao, resposta) => {
    try {
        const { nomePaciente, cpfPaciente } = requisicao.params;
        const pacientes = await findpaciente(nomePaciente, cpfPaciente, null)
        resposta.status(200).json(pacientes.rows);
    } catch (err) {
        console.log("Erro end point get/paciente", err);
        resposta.status(500).json({ mensagem: err.message });
    }
});

app.post('/paciente', validarToken, async (requisicao, resposta) => {
    try {
        const paciente = requisicao.body;
        await insertpaciente(paciente);
        resposta.status(200).json(`Paciente criado!`);
    } catch (err) {
        console.log("Erro end point post/paciente", err);
        resposta.status(500).json({ mensagem: err.message });
    }
})

app.delete('/paciente/:id', validarToken, async (requisicao, resposta) => {
    try {
        const { id } = requisicao.params;
        const retorno = await deletePaciente(id);
        if (retorno.rowCount > 0) {
            resposta.status(200).json(`Paciente ${id} excluído!`);
        } else {
            resposta.status(200).json(`Paciente ${id} já foi excluido, ou não existe!`);
        }
    } catch (err) {
        console.log("Erro end point delete/paciente", err);
        resposta.status(500).json({ mensagem: err.message });
    }
})

app.put('/paciente/:id', validarToken, async (requisicao, resposta) => {
    try {
        const { id } = requisicao.params;
        const pacienteAtualizar = requisicao.body;
        const pacienteAtual = (await findpaciente(null, null, id)).rows;

        // VERIFICA E ALTERA APENAS OS CAMPOS ENVIADOS PARA O BACKEND QUE FORAM ALTERADOS
        Object.keys(pacienteAtualizar).forEach(key => {
            if (pacienteAtual[key] !== pacienteAtualizar[key]) {
                pacienteAtual[key] = pacienteAtualizar[key];
            }
        });
        const retorno = await updatepaciente(pacienteAtualizar, id);
        if (retorno.rowCount > 0) {
            resposta.status(200).json(`Paciente ${id} alterado!`);
        } else {
            resposta.status(200).json(`Paciente ${id} não encontrado/aterado!`);
        }
    } catch (err) {
        console.log("Erro end point put/usuario", err);
        resposta.status(500).json({ mensagem: err.message });
    }
})

// GET Avaliação
app.get('/avaliacao', validarToken, async (requisicao, resposta) => {
    try {
        const { idAvaliacao, idPaciente } = requisicao.query; // Supondo que você possa procurar por idAvaliacao ou idPaciente
        const avaliacoes = await findavaliacao(idAvaliacao, idPaciente)
        resposta.status(200).json(avaliacoes.rows); // Função que busca por avaliação
    } catch (err) {
        console.log("Erro end point get/avaliacao", err);
        resposta.status(500).json({ mensagem: err.message });
    }
});

// POST Avaliação
app.post('/avaliacao', validarToken, async (requisicao, resposta) => {
    try {
        const avaliacao = requisicao.body; // Dados da avaliação passados no body
        await insertavaliacao(avaliacao);  // Função que insere a avaliação
        resposta.status(200).json(`Avaliação criada!`);
    } catch (err) {
        console.log("Erro end point post/avaliacao", err);
        resposta.status(500).json({ mensagem: err.message });
    }
});

// DELETE Avaliação
app.delete('/avaliacao/:id', validarToken, async (requisicao, resposta) => {
    try {
        const { id } = requisicao.params; // ID da avaliação a ser deletada
        const retorno = await deleteAvaliacao(id); // Função que deleta a avaliação
        if (retorno.rowCount > 0) {
            resposta.status(200).json(`Avaliação ${id} excluída!`);
        } else {
            resposta.status(200).json(`Avaliação ${id} já foi excluída ou não existe!`);
        }
    } catch (err) {
        console.log("Erro end point delete/avaliacao", err);
        resposta.status(500).json({ mensagem: err.message });
    }
});

// PUT Avaliação (atualizar)
app.put('/avaliacao/:id', validarToken, async (requisicao, resposta) => {
    try {
        const { id } = requisicao.params; // ID da avaliação a ser atualizada
        const avaliacaoAtualizar = requisicao.body; // Dados para atualizar
        const avaliacaoAtual = (await findavaliacao(id, null)).rows; // Buscar avaliação pelo ID

        // VERIFICA E ALTERA APENAS OS CAMPOS ENVIADOS PARA O BACKEND QUE FORAM ALTERADOS
        Object.keys(avaliacaoAtualizar).forEach(key => {
            if (avaliacaoAtual[key] !== avaliacaoAtualizar[key]) {
                avaliacaoAtual[key] = avaliacaoAtualizar[key];
            }
        });

        const retorno = await updateAvaliacao(avaliacaoAtualizar, id); // Função que atualiza a avaliação
        if (retorno.rowCount > 0) {
            resposta.status(200).json(`Avaliação ${id} alterada!`);
        } else {
            resposta.status(200).json(`Avaliação ${id} não foi encontrada/alterada!`);
        }
    } catch (err) {
        console.log("Erro end point put/avaliacao", err);
        resposta.status(500).json({ mensagem: err.message });
    }
});


// INICIO DAO USUARIO
async function findLastUsuarioCodigo() {
    var sql = `SELECT max(codigo) 
                 FROM usuario;`;
    console.log('sql: ', sql);
    return db.query(sql);
}

async function findUsuario(codigoUsuario, nomePaciente, codigoEmpresa) {
    var sql = `SELECT *
                 FROM usuario u
                WHERE 1=1 
                ${codigoUsuario ? ` AND u.codigo = ${codigoUsuario}` : ''}
                ${nomePaciente ? ` AND u.nome ILIKE '${nomePaciente}'` : ''}
                ${codigoEmpresa ? ` AND u.empresa_codigo = '${codigoEmpresa}';` : ''}`;
    console.log('sql: ', sql);
    return db.query(sql);
};

async function insertUsuario(usuario) {
    var sql = `INSERT INTO usuario (empresa_codigo, nome, senha, tp_usuario, id_paciente) 
                    VALUES (${usuario.empresaCodigo}, '${usuario.nome}', '${usuario.senha}','${usuario.tp_usuario}',${usuario.id_paciente});`;
    console.log('sql: ', sql);
    return db.query(sql);
}

async function deleteUsuario(codigoUsuario) {
    var sql = `DELETE 
                 FROM usuario 
                WHERE codigo = ${codigoUsuario};`;
    console.log('sql: ', sql);
    return db.query(sql);
}

async function updateUsuario(usuarioAtualizar, codigoUsuario) {
    var sql = `UPDATE usuario 
                  SET empresa_codigo = ${usuarioAtualizar.empresaCodigo}, 
                      nome = '${usuarioAtualizar.nome}',
                      senha = '${usuarioAtualizar.senha}'
                WHERE codigo = ${codigoUsuario};`;
    console.log('sql: ', sql);
    return db.query(sql);
}
// FIM DAO USUARIO
// INICIO PACIENTE

async function findpaciente(nomePaciente, cpfPaciente, id) {
    var sql = `SELECT *
                 FROM pacientes pc
                WHERE 1=1 
                ${id ? ` AND pc.id = ${id}` : ''}
                ${nomePaciente ? ` AND pc.nm_paciente ILIKE '${nomePaciente}'` : ''}
                ${cpfPaciente ? ` AND pc.cpf_paciente = '${cpfPaciente}';` : ''}`;
    console.log('sql: ', sql);
    return db.query(sql);
};

async function insertpaciente(paciente) {
    var sql = `INSERT INTO pacientes (id, nm_paciente, dt_nascimento, rg_paciente, cpf_paciente, ds_observacao) 
                    VALUES (${paciente.id}, '${paciente.nomePaciente}', '${paciente.dataNascimento}', '${paciente.rg}', '${paciente.cpf}', '${paciente.observacao}');`;
    console.log('sql: ', sql);
    return db.query(sql);
}

async function deletePaciente(id) {
    var sql = `DELETE 
                 FROM pacientes 
                WHERE id = ${id};`;
    console.log('sql: ', sql);
    return db.query(sql);
}

async function updatepaciente(paciente, id) {
    var sql = `UPDATE pacientes 
                  SET nm_paciente = '${paciente.nomePaciente}', 
                      dt_nascimento = '${paciente.dataNascimento}',
                      rg_paciente = '${paciente.rg}',
                      cpf_paciente = '${paciente.cpf}',
                      ds_observacao = '${paciente.observacao}'
                WHERE id = ${id};`;
    console.log('sql: ', sql);
    return db.query(sql);
}

// INICIO AVALIACAO

async function findavaliacao(id, idPaciente) {
    var sql = `SELECT *
                 FROM avaliacao av INNER JOIN pacientes p ON av.id_paciente = p.id
                WHERE 1=1 
                ${id ? ` AND av.id = ${id}` : ''}
                ${idPaciente ? ` AND av.id_paciente = ${idPaciente}` : ''}`;
    console.log('sql: ', sql);
    return db.query(sql);
};

async function insertavaliacao(avaliacao) {
    var sql = `INSERT INTO avaliacao (id, id_paciente, id_usuario, tp_jogo, nr_potuacao, qt_tempo, tp_status, ds_observacao, nm_avaliacao) 
                    VALUES (${avaliacao.id}, ${avaliacao.idPaciente}, 2, '${avaliacao.tpJogo}', 0, 0,'${avaliacao.tpStatus}','${avaliacao.dsObservacao}', '${avaliacao.nomeAvaliacao}');`;
    console.log('sql: ', sql);
    return db.query(sql);
}

async function deleteavaliacao(id) {
    var sql = `DELETE 
                 FROM avaliacao 
                WHERE id = ${id};`;
    console.log('sql: ', sql);
    return db.query(sql);
}

async function updateavaliacao(avaliacao, id) {
    var sql = `UPDATE avaliacao 
                  SET tp_status = ${avaliacao.tpStatus}, 
                      nr_pontuacao = '${avaliacao.nrPontuacao}',
                      tp_jogo = '${avaliacao.tpJogo}',
                      qt_tempo = '${avaliacao.qtTempo}',
                      ds_observacao = '${avaliacao.dsObservacao}'
                WHERE id = ${id};`;
    console.log('sql: ', sql);
    return db.query(sql);
}


//Este trecho de código define um conjunto de funções assíncronas para interagir com um banco de dados, realizando operações CRUD
// INICIO DAO PRODUTO
async function findLastProdutoCodigo() {
    var sql = `SELECT max(codigo) 
                 FROM produto ;`;
    console.log('sql: ', sql);
    return db.query(sql);
}

async function findProduto(codigoProduto, nomeProduto, codigoEmpresa) {
    var sql = `SELECT *
                 FROM produto p
                WHERE 1=1
                ${codigoProduto && codigoProduto != 0 ? `AND p.codigo = ${codigoProduto}` : ''}
                ${nomeProduto ? `AND p.nome = ${nomeProduto}` : ''}
                ${codigoEmpresa ? ` AND p.empresa_codigo = '${codigoEmpresa}'` : ''}`;
    console.log('sql: ', sql);
    return db.query(sql);
};

async function insertProduto(produto) {
    var sql = `INSERT INTO produto (nome, descricao, caminho_imagem, empresa_codigo) 
                            VALUES ('${produto.nome}', '${produto.descricao}', '${produto.caminho_imagem}', ${produto.empresa_codigo});`;
    console.log('sql: ', sql);
    return db.query(sql);
}

async function deleteProduto(codigoProduto) {
    var sql = `DELETE 
                       FROM produto 
                      WHERE codigo = ${codigoProduto};`;
    console.log('sql: ', sql);
    return db.query(sql);
}

async function updateProduto(produtoAtualizar, codigoProduto) {
    var sql = `UPDATE produto 
                        SET nome = '${produtoAtualizar.nome}', 
                            descricao = '${produtoAtualizar.descricao}',
                            caminho_imagem = '${produtoAtualizar.caminho_imagem}',
                            empresa_codigo = ${produtoAtualizar.empresa_codigo}
                      WHERE codigo = ${codigoProduto};`;
    console.log('sql: ', sql);
    return db.query(sql);
}
// FIM DAO PRODUTO