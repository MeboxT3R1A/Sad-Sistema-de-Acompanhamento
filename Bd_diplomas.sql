CREATE DATABASE bd_diplomas;
USE bd_diplomas;

-- Tabela principal de alunos com todos os campos necessários para o modal
CREATE TABLE alunos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    data_nascimento DATE,
    nacionalidade VARCHAR(100),
    naturalidade VARCHAR(100),
    uf VARCHAR(2),
    identidade VARCHAR(30),
    expedidor VARCHAR(50),
    data_expedicao DATE,
    telefone VARCHAR(20),
    email VARCHAR(150),
    curso VARCHAR(150) NOT NULL,
    turma VARCHAR(50),  
    data_conclusao DATE,
    data_matricula DATE,
    -- NOVO CAMPO ADICIONADO: status do aluno
    status ENUM('ativo', 'concluido', 'evadido') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela simplificada de responsáveis (apenas filiação)
CREATE TABLE responsaveis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    filiacao1 VARCHAR(200),  -- Nome do pai/mãe/responsável 1
    filiacao2 VARCHAR(200),  -- Nome do pai/mãe/responsável 2
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Tabela de diplomas emitidos com campos para o modal
CREATE TABLE diplomas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    livro VARCHAR(50),               -- Campo Editável - Manual
    folha_registro VARCHAR(50),     -- Campo Editável - Manual
    data_registro DATE DEFAULT (CURDATE()),  -- Data Atual do Sistema
    numero_diploma VARCHAR(100) UNIQUE,
    via TINYINT NOT NULL DEFAULT 1,
    data_emissao DATE NOT NULL,
    data_saida DATE,
    situacao ENUM('emitido', 'pendente', 'entregue') DEFAULT 'pendente',
    codigo_verificacao VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Tabela simplificada de histórico escolar (mantida para completude)
CREATE TABLE historico_escolar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    disciplina VARCHAR(150) NOT NULL,
    nota DECIMAL(4,2),
    frequencia DECIMAL(5,2),
    situacao ENUM('aprovado', 'reprovado', 'cursando') DEFAULT 'cursando',
    data_cursada DATE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Tabela de controle de documentos (ATUALIZADA COM NOVOS CAMPOS)
CREATE TABLE documentos_aluno (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    rg_entregue BOOLEAN DEFAULT FALSE,
    cpf_entregue BOOLEAN DEFAULT FALSE,
    foto_entregue BOOLEAN DEFAULT FALSE,
    historico_entregue BOOLEAN DEFAULT FALSE,
    comprovante_entregue BOOLEAN DEFAULT FALSE,
    -- NOVOS CAMPOS ADICIONADOS:
    certidao_entregue BOOLEAN DEFAULT FALSE,
    certificado_entregue BOOLEAN DEFAULT FALSE,
    diploma_entregue BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    data_verificacao DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Tabela de etapas do processo
CREATE TABLE etapas_processo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    etapa ENUM('acompanhamento', 'registro', 'validacao', 'emissao', 'concluido') DEFAULT 'acompanhamento',
    data_inicio DATE,
    data_conclusao DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Tabela de histórico de alterações
CREATE TABLE historico_alteracoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- ÍNDICES PARA OTIMIZAÇÃO DAS BUSCAS
CREATE INDEX idx_alunos_cpf ON alunos(cpf);
CREATE INDEX idx_alunos_nome ON alunos(nome);
CREATE INDEX idx_alunos_turma ON alunos(turma);  
CREATE INDEX idx_alunos_curso ON alunos(curso);
CREATE INDEX idx_alunos_status ON alunos(status); -- NOVO ÍNDICE
CREATE INDEX idx_diplomas_aluno ON diplomas(aluno_id);
CREATE INDEX idx_diplomas_data ON diplomas(data_emissao);
CREATE INDEX idx_etapas_aluno ON etapas_processo(aluno_id);
CREATE INDEX idx_documentos_aluno ON documentos_aluno(aluno_id);
CREATE INDEX idx_responsaveis_aluno ON responsaveis(aluno_id);

-- VIEW PARA DADOS DO MODAL DE EMISSÃO
CREATE VIEW view_dados_emissao AS
SELECT 
    a.id,
    a.cpf,
    a.nome,
    a.data_nascimento,
    a.nacionalidade,
    a.naturalidade,
    a.uf,
    a.identidade,
    a.expedidor,
    a.data_expedicao,
    a.curso,
    a.turma,
    a.data_conclusao,
    a.status, -- INCLUÍDO O STATUS
    d.livro,
    d.folha_registro,
    d.data_registro,
    d.numero_diploma,
    d.via,
    d.data_emissao,
    d.situacao,
    d.codigo_verificacao,
    -- Verificação de campos obrigatórios
    CASE 
        WHEN a.cpf IS NOT NULL 
            AND a.nome IS NOT NULL 
            AND a.curso IS NOT NULL 
            AND a.turma IS NOT NULL 
            AND a.data_conclusao IS NOT NULL 
            AND a.data_nascimento IS NOT NULL 
            AND a.nacionalidade IS NOT NULL 
            AND a.naturalidade IS NOT NULL 
            AND a.uf IS NOT NULL 
            AND a.identidade IS NOT NULL 
            AND a.expedidor IS NOT NULL 
            AND a.data_expedicao IS NOT NULL 
            AND d.livro IS NOT NULL 
            AND d.folha_registro IS NOT NULL 
            AND d.data_registro IS NOT NULL 
            THEN 'COMPLETO'
        ELSE 'INCOMPLETO'
    END as status_dados,
    -- Campos faltantes
    CONCAT_WS(', ',
        CASE WHEN a.cpf IS NULL THEN 'CPF' END,
        CASE WHEN a.nome IS NULL THEN 'Nome' END,
        CASE WHEN a.curso IS NULL THEN 'Curso' END,
        CASE WHEN a.turma IS NULL THEN 'Turma' END,
        CASE WHEN a.data_conclusao IS NULL THEN 'Data Conclusão' END,
        CASE WHEN a.data_nascimento IS NULL THEN 'Data Nascimento' END,
        CASE WHEN a.nacionalidade IS NULL THEN 'Nacionalidade' END,
        CASE WHEN a.naturalidade IS NULL THEN 'Naturalidade' END,
        CASE WHEN a.uf IS NULL THEN 'UF' END,
        CASE WHEN a.identidade IS NULL THEN 'Identidade' END,
        CASE WHEN a.expedidor IS NULL THEN 'Expedidor' END,
        CASE WHEN a.data_expedicao IS NULL THEN 'Data Expedição' END,
        CASE WHEN d.livro IS NULL THEN 'Livro' END,
        CASE WHEN d.folha_registro IS NULL THEN 'Registro Nº' END,
        CASE WHEN d.data_registro IS NULL THEN 'Data Registro' END
    ) as campos_faltantes
FROM alunos a
LEFT JOIN diplomas d ON a.id = d.aluno_id;

-- VIEW PARA BUSCA GLOBAL (SUPORTE À BUSCA POR TURMA)
CREATE VIEW view_busca_global AS
SELECT 
    a.id,
    a.cpf,
    a.nome,
    a.turma,
    a.curso,
    a.data_conclusao,
    a.status, -- INCLUÍDO O STATUS
    'Aluno' as tipo,
    CONCAT(a.nome, ' | ', a.turma, ' (', a.status, ')') as resultado_busca
FROM alunos a
UNION ALL
SELECT 
    d.id,
    a.cpf,
    a.nome,
    a.turma,
    a.curso,
    d.data_emissao,
    a.status,
    'Diploma',
    CONCAT('Diploma: ', a.nome, ' | ', a.turma, ' (', a.status, ')')
FROM diplomas d
JOIN alunos a ON d.aluno_id = a.id;

-- VIEW PARA DOCUMENTOS FALTANTES (ATUALIZADA)
CREATE VIEW view_documentos_faltantes AS
SELECT 
    a.id,
    a.cpf,
    a.nome,
    a.curso,
    a.turma,
    CASE 
        WHEN da.rg_entregue = 0 THEN 'RG'
        WHEN da.cpf_entregue = 0 THEN 'CPF'
        WHEN da.foto_entregue = 0 THEN 'Foto'
        WHEN da.historico_entregue = 0 THEN 'Histórico'
        WHEN da.comprovante_entregue = 0 THEN 'Comprovante'
        WHEN da.certidao_entregue = 0 THEN 'Certidão'
        WHEN da.certificado_entregue = 0 THEN 'Certificado'
        WHEN da.diploma_entregue = 0 THEN 'Diploma'
        ELSE 'Todos entregues'
    END as documento_faltante
FROM alunos a
LEFT JOIN documentos_aluno da ON a.id = da.aluno_id
WHERE da.rg_entregue = 0 
   OR da.cpf_entregue = 0 
   OR da.foto_entregue = 0 
   OR da.historico_entregue = 0 
   OR da.comprovante_entregue = 0
   OR da.certidao_entregue = 0
   OR da.certificado_entregue = 0
   OR da.diploma_entregue = 0;

-- VIEW PARA PRAZOS DE EMISSÃO
CREATE VIEW view_prazos_diplomas AS
SELECT 
    a.id,
    a.cpf,
    a.nome,
    a.curso,
    a.turma,
    a.data_conclusao,
    a.status, -- INCLUÍDO O STATUS
    DATE_ADD(a.data_conclusao, INTERVAL 90 DAY) as prazo_limite,
    CASE 
        WHEN DATE_ADD(a.data_conclusao, INTERVAL 90 DAY) < CURDATE() THEN 'FORA DO PRAZO'
        ELSE 'DENTRO DO PRAZO'
    END as status_prazo
FROM alunos a
WHERE a.data_conclusao IS NOT NULL;
