CREATE DATABASE sistema_diplomas;
USE sistema_diplomas;

-- Tabela principal de alunos
CREATE TABLE alunos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(150),
    curso VARCHAR(150) NOT NULL,
    numero_turma VARCHAR(50),
    data_conclusao DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de histórico escolar
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

-- Tabela de controle de documentos
CREATE TABLE documentos_aluno (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    rg_entregue BOOLEAN DEFAULT FALSE,
    cpf_entregue BOOLEAN DEFAULT FALSE,
    foto_entregue BOOLEAN DEFAULT FALSE,
    historico_entregue BOOLEAN DEFAULT FALSE,
    comprovante_entregue BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    data_verificacao DATE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Tabela de diplomas emitidos
CREATE TABLE diplomas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    numero_diploma VARCHAR(100) UNIQUE,
    via ENUM('primeira', 'segunda', 'terceira') DEFAULT 'primeira',
    data_emissao DATE NOT NULL,
    data_saida DATE,
    situacao ENUM('emitido', 'pendente', 'entregue') DEFAULT 'pendente',
    codigo_verificacao VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Tabela de histórico de alterações (para futura implementação)
CREATE TABLE historico_alteracoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_alunos_cpf ON alunos(cpf);
CREATE INDEX idx_alunos_nome ON alunos(nome);
CREATE INDEX idx_diplomas_aluno ON diplomas(aluno_id);
CREATE INDEX idx_diplomas_data ON diplomas(data_emissao);
CREATE INDEX idx_etapas_aluno ON etapas_processo(aluno_id);
CREATE INDEX idx_documentos_aluno ON documentos_aluno(aluno_id);

-- View para verificação de documentos faltantes
CREATE VIEW view_documentos_faltantes AS
SELECT 
    a.id,
    a.cpf,
    a.nome,
    a.curso,
    CASE 
        WHEN da.rg_entregue = 0 THEN 'RG'
        WHEN da.cpf_entregue = 0 THEN 'CPF'
        WHEN da.foto_entregue = 0 THEN 'Foto'
        WHEN da.historico_entregue = 0 THEN 'Histórico'
        WHEN da.comprovante_entregue = 0 THEN 'Comprovante'
        ELSE 'Todos entregues'
    END as documento_faltante
FROM alunos a
LEFT JOIN documentos_aluno da ON a.id = da.aluno_id
WHERE da.rg_entregue = 0 
   OR da.cpf_entregue = 0 
   OR da.foto_entregue = 0 
   OR da.historico_entregue = 0 
   OR da.comprovante_entregue = 0;

-- View para controle de prazos de emissão
CREATE VIEW view_prazos_diplomas AS
SELECT 
    a.id,
    a.cpf,
    a.nome,
    a.curso,
    a.data_conclusao,
    DATE_ADD(a.data_conclusao, INTERVAL 90 DAY) as prazo_limite,
    CASE 
        WHEN DATE_ADD(a.data_conclusao, INTERVAL 90 DAY) < CURDATE() THEN 'FORA DO PRAZO'
        ELSE 'DENTRO DO PRAZO'
    END as status_prazo
FROM alunos a
WHERE a.data_conclusao IS NOT NULL;