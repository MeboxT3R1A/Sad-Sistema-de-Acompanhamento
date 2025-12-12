
-- ============================================
-- 1. INSERIR ALUNOS (25 alunos)
-- ============================================
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
 '61966554433', 'pedro@example.com', 'Marketing', 'E-2020', '2020-12-05', 'evadido'),
('666.666.666-66', 'Fernanda Lima', '2000-09-25', 'Brasileira', 'São Paulo', 'SP',
 '2233445', 'SSP-SP', '2016-08-15',
 '11987654321', 'fernanda@example.com', 'Design Gráfico', 'F-2023', '2023-12-10', 'ativo'),
('777.777.777-77', 'Rafael Souza', '1999-12-05', 'Brasileiro', 'Rio de Janeiro', 'RJ',
 '3344556', 'SSP-RJ', '2015-04-20',
 '21987654321', 'rafael@example.com', 'Gastronomia', 'G-2022', '2022-12-05', 'concluido'),
('888.888.888-88', 'Juliana Almeida', '2001-02-18', 'Brasileira', 'Belo Horizonte', 'MG',
 '4455667', 'SSP-MG', '2017-10-30',
 '31987654321', 'juliana@example.com', 'Fotografia', 'H-2024', '2024-06-15', 'ativo'),
('999.999.999-99', 'Lucas Mendes', '1998-11-30', 'Brasileiro', 'Curitiba', 'PR',
 '5566778', 'SSP-PR', '2014-07-22',
 '41987654321', 'lucas@example.com', 'Mecânica', 'I-2021', '2021-06-20', 'concluido'),
('101.101.101-10', 'Patrícia Rocha', '2002-04-12', 'Brasileira', 'Porto Alegre', 'RS',
 '6677889', 'SSP-RS', '2018-01-14',
 '51987654321', 'patricia@example.com', 'Enfermagem', 'B-2023', '2023-12-15', 'ativo'),
('121.212.121-21', 'Bruno Costa', '1997-08-22', 'Brasileiro', 'Salvador', 'BA',
 '7788990', 'SSP-BA', '2013-12-05',
 '71987654321', 'bruno@example.com', 'Eletrotécnica', 'J-2020', '2020-06-30', 'evadido'),
('131.313.131-31', 'Camila Santos', '2000-06-14', 'Brasileira', 'Fortaleza', 'CE',
 '8899001', 'SSP-CE', '2016-09-18',
 '85987654321', 'camila@example.com', 'Nutrição', 'K-2023', '2023-12-20', 'ativo'),
('141.414.141-41', 'Diego Oliveira', '1999-01-28', 'Brasileiro', 'Recife', 'PE',
 '9900112', 'SSP-PE', '2015-11-11',
 '81987654321', 'diego@example.com', 'Programação', 'L-2022', '2022-06-25', 'concluido'),
('151.515.151-51', 'Tatiane Silva', '2001-07-03', 'Brasileira', 'Manaus', 'AM',
 '0011223', 'SSP-AM', '2017-03-25',
 '92987654321', 'tatiane@example.com', 'Turismo', 'M-2024', '2024-06-30', 'ativo'),
('161.616.161-61', 'Marcos Pereira', '1998-10-19', 'Brasileiro', 'Belém', 'PA',
 '1122334', 'SSP-PA', '2014-05-07',
 '91987654321', 'marcos@example.com', 'Contabilidade', 'N-2021', '2021-12-15', 'concluido'),
('171.717.171-71', 'Vanessa Lima', '2002-03-08', 'Brasileira', 'Goiânia', 'GO',
 '2233445', 'SSP-GO', '2018-08-22',
 '62987654321', 'vanessa@example.com', 'Psicologia', 'O-2024', '2024-12-10', 'ativo'),
('181.818.181-81', 'Roberto Alves', '1997-05-17', 'Brasileiro', 'Campo Grande', 'MS',
 '3344556', 'SSP-MS', '2013-10-30',
 '67987654321', 'roberto@example.com', 'Agronegócio', 'P-2020', '2020-06-20', 'evadido'),
('191.919.191-91', 'Amanda Costa', '2000-12-24', 'Brasileira', 'Cuiabá', 'MT',
 '4455667', 'SSP-MT', '2016-02-14',
 '65987654321', 'amanda@example.com', 'Farmácia', 'Q-2023', '2023-06-30', 'ativo'),
('202.020.202-02', 'Felipe Souza', '1999-09-11', 'Brasileiro', 'Florianópolis', 'SC',
 '5566778', 'SSP-SC', '2015-07-03',
 '48987654321', 'felipe@example.com', 'Edificações', 'R-2022', '2022-12-05', 'concluido'),
('212.121.212-12', 'Carolina Mendes', '2001-04-05', 'Brasileira', 'Vitória', 'ES',
 '6677889', 'SSP-ES', '2017-11-19',
 '27987654321', 'carolina@example.com', 'Moda', 'S-2024', '2024-06-15', 'ativo'),
('222.222.222-23', 'Ricardo Rocha', '1998-02-28', 'Brasileiro', 'Natal', 'RN',
 '7788990', 'SSP-RN', '2014-04-12',
 '84987654321', 'ricardo@example.com', 'Segurança do Trabalho', 'T-2021', '2021-12-20', 'concluido'),
('232.323.232-32', 'Larissa Silva', '2002-08-15', 'Brasileira', 'João Pessoa', 'PB',
 '8899001', 'SSP-PB', '2018-06-28',
 '83987654321', 'larissa@example.com', 'Estética', 'U-2024', '2024-12-15', 'ativo'),
('242.424.242-42', 'Gustavo Santos', '1997-11-02', 'Brasileiro', 'Teresina', 'PI',
 '9900112', 'SSP-PI', '2013-09-05',
 '86987654321', 'gustavo@example.com', 'Eletrônica', 'V-2020', '2020-06-25', 'evadido'),
('252.525.252-52', 'Mariana Oliveira', '2000-01-20', 'Brasileira', 'Maceió', 'AL',
 '0011223', 'SSP-AL', '2016-05-17',
 '82987654321', 'mariana@example.com', 'Hotelaria', 'W-2023', '2023-12-30', 'ativo'),
('262.626.262-62', 'Thiago Costa', '1999-07-07', 'Brasileiro', 'Aracaju', 'SE',
 '1122334', 'SSP-SE', '2015-12-10',
 '79987654321', 'thiago@example.com', 'Comércio Exterior', 'X-2022', '2022-06-15', 'concluido');

-- ============================================
-- 2. INSERIR RESPONSÁVEIS (25 responsáveis)
-- ============================================
INSERT INTO responsaveis (aluno_id, filiacao1, filiacao2) VALUES
(1, 'José Silva', 'Ana Silva'),
(2, 'Roberto Santos', 'Clara Santos'),
(3, 'Fábio Pereira', 'Marina Pereira'),
(4, 'Marcos Oliveira', 'Julia Oliveira'),
(5, 'Ricardo Costa', 'Fernanda Costa'),
(6, 'Antônio Lima', 'Cristina Lima'),
(7, 'Sérgio Souza', 'Marta Souza'),
(8, 'Carlos Almeida', 'Beatriz Almeida'),
(9, 'Paulo Mendes', 'Lúcia Mendes'),
(10, 'Eduardo Rocha', 'Sandra Rocha'),
(11, 'Mauro Costa', 'Renata Costa'),
(12, 'Roberval Santos', 'Daniela Santos'),
(13, 'Cláudio Oliveira', 'Simone Oliveira'),
(14, 'Márcio Silva', 'Elaine Silva'),
(15, 'José Pereira', 'Adriana Pereira'),
(16, 'Roberto Lima', 'Patrícia Lima'),
(17, 'Carlos Alves', 'Mônica Alves'),
(18, 'Ricardo Costa', 'Viviane Costa'),
(19, 'Fábio Souza', 'Carla Souza'),
(20, 'Maurício Mendes', 'Fernanda Mendes'),
(21, 'Sérgio Rocha', 'Tânia Rocha'),
(22, 'Paulo Silva', 'Rosângela Silva'),
(23, 'Eduardo Santos', 'Luciana Santos'),
(24, 'Cláudio Oliveira', 'Márcia Oliveira'),
(25, 'Mauro Costa', 'Regina Costa');

-- ============================================
-- 3. INSERIR DIPLOMAS (25 diplomas - CORRIGIDO)
-- ============================================
INSERT INTO diplomas (
    aluno_id, livro, registro_numero, data_registro, 
    numero_diploma, via, data_emissao, situacao, codigo_verificacao
) VALUES
(1, 'A1', '1001', CURDATE(), 'DIP-2023-0001', 'primeira', '2023-01-10', 'emitido', 'VERIF-0001'),
(2, 'A1', '1002', CURDATE(), 'DIP-2023-0002', 'primeira', '2023-01-10', 'pendente', 'VERIF-0002'),
(3, 'A2', '2001', CURDATE(), 'DIP-2023-0003', 'primeira', '2023-01-09', 'entregue', 'VERIF-0003'),
(4, 'B1', '3001', CURDATE(), 'DIP-2024-0001', 'primeira', '2024-01-15', 'pendente', 'VERIF-0004'),
(5, 'B1', '3002', CURDATE(), 'DIP-2021-0001', 'primeira', '2021-01-20', 'emitido', 'VERIF-0005'),
(6, 'C1', '4001', CURDATE(), 'DIP-2024-0002', 'primeira', '2024-02-01', 'pendente', 'VERIF-0006'),
(7, 'C1', '4002', CURDATE(), 'DIP-2023-0004', 'primeira', '2023-02-05', 'entregue', 'VERIF-0007'),
(8, 'D1', '5001', CURDATE(), 'DIP-2024-0003', 'primeira', '2024-07-10', 'pendente', 'VERIF-0008'),
(9, 'D1', '5002', CURDATE(), 'DIP-2022-0001', 'primeira', '2022-08-15', 'entregue', 'VERIF-0009'),
(10, 'E1', '6001', CURDATE(), 'DIP-2024-0004', 'primeira', '2024-01-20', 'pendente', 'VERIF-0010'),
(11, 'E1', '6002', CURDATE(), 'DIP-2021-0002', 'primeira', '2021-07-30', 'emitido', 'VERIF-0011'),
(12, 'F1', '7001', CURDATE(), 'DIP-2024-0005', 'primeira', '2024-02-15', 'pendente', 'VERIF-0012'),
(13, 'F1', '7002', CURDATE(), 'DIP-2023-0005', 'primeira', '2023-08-20', 'entregue', 'VERIF-0013'),
(14, 'G1', '8001', CURDATE(), 'DIP-2024-0006', 'primeira', '2024-07-25', 'pendente', 'VERIF-0014'),
(15, 'G1', '8002', CURDATE(), 'DIP-2022-0002', 'primeira', '2022-09-10', 'entregue', 'VERIF-0015'),
(16, 'H1', '9001', CURDATE(), 'DIP-2025-0001', 'primeira', '2025-01-10', 'pendente', 'VERIF-0016'),
(17, 'H1', '9002', CURDATE(), 'DIP-2021-0003', 'primeira', '2021-06-25', 'emitido', 'VERIF-0017'),
(18, 'I1', '10001', CURDATE(), 'DIP-2024-0007', 'primeira', '2024-03-05', 'pendente', 'VERIF-0018'),
(19, 'I1', '10002', CURDATE(), 'DIP-2023-0006', 'primeira', '2023-09-15', 'entregue', 'VERIF-0019'),
(20, 'J1', '11001', CURDATE(), 'DIP-2024-0008', 'primeira', '2024-07-30', 'pendente', 'VERIF-0020'),
(21, 'J1', '11002', CURDATE(), 'DIP-2022-0003', 'primeira', '2022-11-20', 'entregue', 'VERIF-0021'),
(22, 'K1', '12001', CURDATE(), 'DIP-2025-0002', 'primeira', '2025-01-25', 'pendente', 'VERIF-0022'),
(23, 'K1', '12002', CURDATE(), 'DIP-2021-0004', 'primeira', '2021-08-05', 'emitido', 'VERIF-0023'),
(24, 'L1', '13001', CURDATE(), 'DIP-2024-0009', 'primeira', '2024-04-10', 'pendente', 'VERIF-0024'),
(25, 'L1', '13002', CURDATE(), 'DIP-2023-0007', 'primeira', '2023-10-30', 'entregue', 'VERIF-0025');

-- ============================================
-- 4. INSERIR HISTÓRICO ESCOLAR (amostra)
-- ============================================
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
(5, 'Publicidade', 7.0, 80, 'aprovado', '2020-06-10'),
(6, 'Design Digital', 9.2, 96, 'aprovado', '2023-06-10'),
(6, 'Teoria das Cores', 8.8, 94, 'aprovado', '2023-06-10'),
(7, 'Culinária Básica', 8.8, 94, 'aprovado', '2022-06-10'),
(7, 'Gastronomia Francesa', 9.1, 97, 'aprovado', '2022-06-10'),
(8, 'Fotografia Digital', 9.5, 98, 'aprovado', '2024-06-10'),
(8, 'Iluminação Fotográfica', 8.9, 95, 'aprovado', '2024-06-10'),
(12, 'Nutrição Clínica', 8.3, 91, 'aprovado', '2023-06-10'),
(12, 'Dietética', 8.7, 93, 'aprovado', '2023-06-10'),
(15, 'Psicologia Social', 8.9, 95, 'aprovado', '2024-06-10'),
(15, 'Psicologia do Desenvolvimento', 9.0, 96, 'aprovado', '2024-06-10'),
(18, 'Farmácia Hospitalar', 8.6, 93, 'aprovado', '2023-06-10'),
(18, 'Farmacologia', 8.8, 94, 'aprovado', '2023-06-10'),
(22, 'Estética Facial', 9.1, 97, 'aprovado', '2024-06-10'),
(22, 'Massoterapia', 8.9, 95, 'aprovado', '2024-06-10'),
(25, 'Comércio Internacional', 8.5, 92, 'aprovado', '2022-06-10'),
(25, 'Logística Internacional', 8.8, 94, 'aprovado', '2022-06-10');

-- ============================================
-- 5. INSERIR DOCUMENTOS ALUNO (25 registros)
-- ============================================
INSERT INTO documentos_aluno (
    aluno_id, rg_entregue, cpf_entregue, foto_entregue,
    historico_entregue, comprovante_entregue, 
    certidao_entregue, certificado_entregue, diploma_entregue,
    observacoes, data_verificacao
) VALUES
(1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Documentação completa. Diploma já entregue.', CURDATE()),
(2, TRUE, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, 'Falta CPF, histórico, certificado e diploma.', CURDATE()),
(3, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE, 'Falta foto e diploma ainda não retirado.', CURDATE()),
(4, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Apenas documentos básicos entregues. Pendente histórico e comprovante.', CURDATE()),
(5, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Aluno evadido. Nenhum documento entregue.', CURDATE()),
(6, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, 'Falta histórico e certificado.', CURDATE()),
(7, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Todos documentos entregues. Processo concluído.', CURDATE()),
(8, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Aguardando certificado e diploma.', CURDATE()),
(9, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, 'Documentação básica apenas.', CURDATE()),
(10, TRUE, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, 'CPF e histórico pendentes.', CURDATE()),
(11, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Aluno evadido. Pouca documentação.', CURDATE()),
(12, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, 'Apenas diploma pendente.', CURDATE()),
(13, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Processo totalmente concluído.', CURDATE()),
(14, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, 'Histórico e certificado pendentes.', CURDATE()),
(15, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Concluído há 2 anos.', CURDATE()),
(16, TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Processo no início.', CURDATE()),
(17, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Aluno evadido sem documentação.', CURDATE()),
(18, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, 'Aguardando diploma.', CURDATE()),
(19, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Processo finalizado com sucesso.', CURDATE()),
(20, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, 'Comprovante e certificado pendentes.', CURDATE()),
(21, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Todos documentos em ordem.', CURDATE()),
(22, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, 'Histórico escolar pendente.', CURDATE()),
(23, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Evadido com pouca documentação.', CURDATE()),
(24, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, 'Apenas diploma pendente de retirada.', CURDATE()),
(25, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Processo totalmente finalizado.', CURDATE());

-- ============================================
-- 6. INSERIR ETAPAS DO PROCESSO (25 registros)
-- ============================================
INSERT INTO etapas_processo (aluno_id, etapa, data_inicio, data_conclusao, observacoes) VALUES
(1, 'concluido', '2022-12-15', '2023-01-10', 'Processo finalizado. Diploma entregue.'),
(2, 'registro', '2022-12-15', NULL, 'Aguardando emissão de certificado e diploma.'),
(3, 'emissao', '2021-12-10', '2023-01-09', 'Emitido mas não retirado pelo aluno.'),
(4, 'validacao', '2023-12-20', NULL, 'Validando documentos pendentes.'),
(5, 'acompanhamento', '2020-12-05', NULL, 'Aluno evadido. Processo parado.'),
(6, 'validacao', '2023-12-10', NULL, 'Validando documentação.'),
(7, 'concluido', '2022-12-05', '2023-02-05', 'Concluído com sucesso.'),
(8, 'emissao', '2024-06-15', NULL, 'Em processo de emissão.'),
(9, 'concluido', '2021-06-20', '2022-08-15', 'Concluído há 2 anos.'),
(10, 'validacao', '2023-12-15', NULL, 'Em validação documental.'),
(11, 'acompanhamento', '2020-06-30', NULL, 'Aluno evadido.'),
(12, 'emissao', '2023-12-20', NULL, 'Aguardando diploma.'),
(13, 'concluido', '2022-06-25', '2023-08-20', 'Processo concluído.'),
(14, 'registro', '2024-06-30', NULL, 'Em registro acadêmico.'),
(15, 'concluido', '2021-12-15', '2022-09-10', 'Finalizado.'),
(16, 'acompanhamento', '2024-12-10', NULL, 'Em acompanhamento inicial.'),
(17, 'acompanhamento', '2020-06-20', NULL, 'Evadido - processo parado.'),
(18, 'emissao', '2023-06-30', NULL, 'Aguardando diploma.'),
(19, 'concluido', '2022-12-05', '2023-09-15', 'Finalizado.'),
(20, 'validacao', '2024-06-15', NULL, 'Validando documentos.'),
(21, 'concluido', '2021-12-20', '2022-11-20', 'Concluído.'),
(22, 'emissao', '2024-12-15', NULL, 'Aguardando emissão.'),
(23, 'acompanhamento', '2020-06-25', NULL, 'Evadido.'),
(24, 'emissao', '2023-12-30', NULL, 'Em processo de emissão.'),
(25, 'concluido', '2022-06-15', '2023-10-30', 'Processo finalizado.');

-- ============================================
-- 7. INSERIR HISTÓRICO DE ALTERAÇÕES (amostra)
-- ============================================
INSERT INTO historico_alteracoes (aluno_id, campo_alterado, valor_anterior, valor_novo) VALUES
(1, 'telefone', '61999990000', '61999998888'),
(1, 'status', 'ativo', 'concluido'),
(2, 'email', 'maria@oldmail.com', 'maria@example.com'),
(2, 'status', 'concluido', 'ativo'),
(3, 'identidade', '0000000', '9988776'),
(4, 'curso', 'Administração', 'Logística'),
(5, 'status', 'ativo', 'evadido'),
(6, 'telefone', '11999998888', '11987654321'),
(7, 'email', 'rafael@old.com', 'rafael@example.com'),
(8, 'naturalidade', 'São Paulo', 'Belo Horizonte'),
(9, 'status', 'ativo', 'concluido'),
(10, 'telefone', '51999998888', '51987654321'),
(11, 'status', 'ativo', 'evadido'),
(12, 'email', 'camila@old.com', 'camila@example.com'),
(13, 'status', 'ativo', 'concluido'),
(14, 'naturalidade', 'Manaus', 'Belém'),
(15, 'status', 'ativo', 'concluido'),
(16, 'telefone', '62999998888', '62987654321'),
(17, 'status', 'ativo', 'evadido'),
(18, 'email', 'amanda@old.com', 'amanda@example.com'),
(19, 'status', 'ativo', 'concluido'),
(20, 'telefone', '27999998888', '27987654321'),
(21, 'status', 'ativo', 'concluido'),
(22, 'email', 'larissa@old.com', 'larissa@example.com'),
(23, 'status', 'ativo', 'evadido'),
(24, 'telefone', '82999998888', '82987654321'),
(25, 'status', 'ativo', 'concluido');

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT 'Alunos inseridos: ' AS Tabela, COUNT(*) AS Quantidade FROM alunos
UNION ALL
SELECT 'Responsáveis: ', COUNT(*) FROM responsaveis
UNION ALL
SELECT 'Diplomas: ', COUNT(*) FROM diplomas
UNION ALL
SELECT 'Histórico Escolar: ', COUNT(*) FROM historico_escolar
UNION ALL
SELECT 'Documentos Aluno: ', COUNT(*) FROM documentos_aluno
UNION ALL
SELECT 'Etapas Processo: ', COUNT(*) FROM etapas_processo
UNION ALL
SELECT 'Histórico Alterações: ', COUNT(*) FROM historico_alteracoes;
[file content end]