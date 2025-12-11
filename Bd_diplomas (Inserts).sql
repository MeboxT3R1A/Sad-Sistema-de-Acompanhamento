INSERT INTO alunos (
    cpf, nome, data_nascimento, nacionalidade, naturalidade, uf,
    identidade, expedidor, data_expedicao,
    telefone, email, curso, turma, data_conclusao
) VALUES
('111.111.111-11', 'João Silva', '2000-05-20', 'Brasileiro', 'Brasília', 'DF', 
 '1234567', 'SSP-DF', '2015-07-10',
 '61999998888', 'joao@example.com', 'Informática', 'A-2022', '2022-12-15'),

('222.222.222-22', 'Maria Santos', '2001-08-10', 'Brasileira', 'Goiânia', 'GO', 
 '7654321', 'SSP-GO', '2016-03-22',
 '62988887777', 'maria@example.com', 'Enfermagem', 'B-2022', '2022-12-15'),

('333.333.333-33', 'Carlos Pereira', '1999-03-12', 'Brasileiro', 'Sobradinho', 'DF', 
 '9988776', 'SSP-DF', '2014-11-05',
 '61988776655', 'carlos@example.com', 'Administração', 'C-2021', '2021-12-10');

INSERT INTO responsaveis (aluno_id, filiacao1, filiacao2) VALUES
(1, 'José Silva', 'Ana Silva'),
(2, 'Roberto Santos', 'Clara Santos'),
(3, 'Fábio Pereira', 'Marina Pereira');

INSERT INTO diplomas (
    aluno_id, livro, registro_numero, data_registro, 
    numero_diploma, via, data_emissao, situacao, codigo_verificacao
) VALUES
(1, 'A1', '1001', CURDATE(), 'DIP-2023-0001', 'primeira', '2023-01-10', 'emitido', 'VERIF-1111'),
(2, 'A1', '1002', CURDATE(), 'DIP-2023-0002', 'primeira', '2023-01-10', 'pendente', 'VERIF-2222'),
(3, 'A2', '2001', CURDATE(), 'DIP-2023-0003', 'primeira', '2023-01-09', 'entregue', 'VERIF-3333');

INSERT INTO historico_escolar (aluno_id, disciplina, nota, frequencia, situacao, data_cursada) VALUES
(1, 'Matemática', 8.5, 92, 'aprovado', '2022-06-10'),
(1, 'Português', 9.0, 95, 'aprovado', '2022-06-10'),

(2, 'Anatomia', 7.5, 88, 'aprovado', '2022-06-10'),
(2, 'Enfermagem Básica', 8.0, 90, 'aprovado', '2022-06-10'),

(3, 'Administração Geral', 8.7, 93, 'aprovado', '2021-06-10');

INSERT INTO documentos_aluno (
    aluno_id, rg_entregue, cpf_entregue, foto_entregue,
    historico_entregue, comprovante_entregue, observacoes, data_verificacao
) VALUES
(1, TRUE, TRUE, TRUE, TRUE, TRUE, 'Documentação completa.', CURDATE()),
(2, TRUE, FALSE, TRUE, FALSE, TRUE, 'Falta CPF e histórico.', CURDATE()),
(3, TRUE, TRUE, FALSE, TRUE, TRUE, 'Falta foto.', CURDATE());

INSERT INTO etapas_processo (aluno_id, etapa, data_inicio, data_conclusao, observacoes) VALUES
(1, 'concluido', '2022-12-15', '2023-01-10', 'Processo finalizado.'),
(2, 'registro', '2022-12-15', NULL, 'Aguardando emissão.'),
(3, 'emissao', '2021-12-10', '2023-01-09', 'Emitido e entregue.');

INSERT INTO historico_alteracoes (aluno_id, campo_alterado, valor_anterior, valor_novo) VALUES
(1, 'telefone', '61999990000', '61999998888'),
(2, 'email', 'maria@oldmail.com', 'maria@example.com'),
(3, 'identidade', '0000000', '9988776');
