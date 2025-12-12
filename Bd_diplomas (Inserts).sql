-- Inserir alunos com o novo campo 'status'
INSERT INTO alunos (
    cpf, nome, data_nascimento, nacionalidade, naturalidade, uf,
    identidade, expedidor, data_expedicao,
    telefone, email, curso, turma, data_conclusao, status
) VALUES
('111.111.111-11', 'João Silva', '2000-05-20', 'Brasileiro', 'Brasília', 'DF', 
 '1234567', 'SSP-DF', '2015-07-10',
 '61999998888', 'joao@example.com', 'Informática', 'A-2022', '2022-12-15', 'ativo'),

('222.222.222-22', 'Maria Santos', '2001-08-10', 'Brasileira', 'Goiânia', 'GO', 
 '7654321', 'SSP-GO', '2016-03-22',
 '62988887777', 'maria@example.com', 'Enfermagem', 'B-2022', '2022-12-15', 'ativo'),

('333.333.333-33', 'Carlos Pereira', '1999-03-12', 'Brasileiro', 'Sobradinho', 'DF', 
 '9988776', 'SSP-DF', '2014-11-05',
 '61988776655', 'carlos@example.com', 'Administração', 'C-2021', '2021-12-10', 'concluido'),

('444.444.444-44', 'Ana Oliveira', '2002-11-30', 'Brasileira', 'Taguatinga', 'DF',
 '1122334', 'SSP-DF', '2017-05-18',
 '61977665544', 'ana@example.com', 'Logística', 'D-2023', '2023-12-20', 'ativo'),

('555.555.555-55', 'Pedro Costa', '1998-07-15', 'Brasileiro', 'Ceilândia', 'DF',
 '5566778', 'SSP-DF', '2013-09-25',
 '61966554433', 'pedro@example.com', 'Marketing', 'E-2020', '2020-12-05', 'evadido');

-- Responsáveis
INSERT INTO responsaveis (aluno_id, filiacao1, filiacao2) VALUES
(1, 'José Silva', 'Ana Silva'),
(2, 'Roberto Santos', 'Clara Santos'),
(3, 'Fábio Pereira', 'Marina Pereira'),
(4, 'Marcos Oliveira', 'Julia Oliveira'),
(5, 'Ricardo Costa', 'Fernanda Costa');

-- Diplomas
INSERT INTO diplomas (
    aluno_id, livro, registro_numero, data_registro, 
    numero_diploma, via, data_emissao, situacao, codigo_verificacao
) VALUES
(1, 'A1', '1001', CURDATE(), 'DIP-2023-0001', 'primeira', '2023-01-10', 'emitido', 'VERIF-1111'),
(2, 'A1', '1002', CURDATE(), 'DIP-2023-0002', 'primeira', '2023-01-10', 'pendente', 'VERIF-2222'),
(3, 'A2', '2001', CURDATE(), 'DIP-2023-0003', 'primeira', '2023-01-09', 'entregue', 'VERIF-3333'),
(4, 'B1', '3001', CURDATE(), 'DIP-2024-0001', 'primeira', '2024-01-15', 'pendente', 'VERIF-4444'),
(5, 'B1', '3002', CURDATE(), 'DIP-2021-0001', 'primeira', '2021-01-20', 'emitido', 'VERIF-5555');

-- Histórico Escolar
INSERT INTO historico_escolar (aluno_id, disciplina, nota, frequencia, situacao, data_cursada) VALUES
(1, 'Matemática', 8.5, 92, 'aprovado', '2022-06-10'),
(1, 'Português', 9.0, 95, 'aprovado', '2022-06-10'),
(1, 'Informática Básica', 9.5, 98, 'aprovado', '2022-06-10'),

(2, 'Anatomia', 7.5, 88, 'aprovado', '2022-06-10'),
(2, 'Enfermagem Básica', 8.0, 90, 'aprovado', '2022-06-10'),
(2, 'Primeiros Socorros', 8.7, 93, 'aprovado', '2022-06-10'),

(3, 'Administração Geral', 8.7, 93, 'aprovado', '2021-06-10'),
(3, 'Contabilidade', 7.8, 85, 'aprovado', '2021-06-10'),
(3, 'Marketing', 9.2, 96, 'aprovado', '2021-06-10'),

(4, 'Logística', 8.0, 90, 'aprovado', '2023-06-10'),
(4, 'Gestão de Estoques', 7.5, 88, 'aprovado', '2023-06-10'),

(5, 'Marketing Digital', 6.5, 75, 'reprovado', '2020-06-10'),
(5, 'Publicidade', 7.0, 80, 'aprovado', '2020-06-10');

-- Documentos dos Alunos (ATUALIZADO COM OS NOVOS CAMPOS)
INSERT INTO documentos_aluno (
    aluno_id, rg_entregue, cpf_entregue, foto_entregue,
    historico_entregue, comprovante_entregue, 
    certidao_entregue, certificado_entregue, diploma_entregue,
    observacoes, data_verificacao
) VALUES
-- João Silva - Todos documentos entregues
(1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 
 'Documentação completa. Diploma já entregue.', CURDATE()),

-- Maria Santos - Falta alguns documentos
(2, TRUE, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, 
 'Falta CPF, histórico, certificado e diploma.', CURDATE()),

-- Carlos Pereira - Quase completo
(3, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE, 
 'Falta foto e diploma ainda não retirado.', CURDATE()),

-- Ana Oliveira - Apenas básicos
(4, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 
 'Apenas documentos básicos entregues. Pendente histórico e comprovante.', CURDATE()),

-- Pedro Costa - Muitos documentos faltando
(5, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 
 'Aluno evadido. Nenhum documento entregue.', CURDATE());

-- Etapas do Processo
INSERT INTO etapas_processo (aluno_id, etapa, data_inicio, data_conclusao, observacoes) VALUES
(1, 'concluido', '2022-12-15', '2023-01-10', 'Processo finalizado. Diploma entregue.'),
(2, 'registro', '2022-12-15', NULL, 'Aguardando emissão de certificado e diploma.'),
(3, 'emissao', '2021-12-10', '2023-01-09', 'Emitido mas não retirado pelo aluno.'),
(4, 'validacao', '2023-12-20', NULL, 'Validando documentos pendentes.'),
(5, 'acompanhamento', '2020-12-05', NULL, 'Aluno evadido. Processo parado.');

-- Histórico de Alterações
INSERT INTO historico_alteracoes (aluno_id, campo_alterado, valor_anterior, valor_novo) VALUES
(1, 'telefone', '61999990000', '61999998888'),
(1, 'status', 'ativo', 'concluido'),
(2, 'email', 'maria@oldmail.com', 'maria@example.com'),
(2, 'status', 'concluido', 'ativo'),
(3, 'identidade', '0000000', '9988776'),
(4, 'curso', 'Administração', 'Logística'),
(5, 'status', 'ativo', 'evadido');