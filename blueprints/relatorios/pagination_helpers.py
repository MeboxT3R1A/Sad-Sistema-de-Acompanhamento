import math
from flask import jsonify  

def handle_normal_pagination(conn, cursor, resumo, table_type, page, per_page, search):
    """Função auxiliar para lidar com paginação normal"""
    
    # Dados paginados para cursos (quando table_type='cursos')
    if table_type == 'cursos':
        # Query base para cursos
        sql_base = """
            SELECT 
                curso,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as ativo,
                SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluido,
                SUM(CASE WHEN status = 'evadido' THEN 1 ELSE 0 END) as evadido
            FROM alunos 
            WHERE curso IS NOT NULL AND curso != ''
        """
        
        # Adicionar filtro de busca se existir
        params = []
        if search:
            sql_base += " AND LOWER(curso) LIKE %s"
            params.append(f"%{search}%")
        
        sql_base += " GROUP BY curso ORDER BY curso"
        
        # Contar total
        count_sql = "SELECT COUNT(DISTINCT curso) as total FROM alunos WHERE curso IS NOT NULL AND curso != ''"
        if search:
            count_sql += " AND LOWER(curso) LIKE %s"
        
        cursor.execute(count_sql, tuple(params))
        total_result = cursor.fetchone()
        total_items = total_result['total'] if total_result else 0
        total_pages = math.ceil(total_items / per_page) if per_page > 0 else 1
        
        # Calcular offset com a página solicitada
        offset = (page - 1) * per_page
        
        # Buscar cursos com agregação paginada
        sql = sql_base + " LIMIT %s OFFSET %s"
        params.extend([per_page, offset])
        
        cursor.execute(sql, tuple(params))
        cursos_raw = cursor.fetchall()
        
        cursos_dict = {}
        for row in cursos_raw:
            nome_curso = row['curso']
            cursos_dict[nome_curso] = {
                'total': row['total'],
                'ativo': row['ativo'] or 0,
                'concluido': row['concluido'] or 0,
                'evadido': row['evadido'] or 0
            }
        
        turmas_dict = {}
        
    # Dados paginados para turmas (quando table_type='turmas')
    elif table_type == 'turmas':
        # Query base para turmas
        sql_base = """
            SELECT 
                COALESCE(turma, 'Sem turma') as turma,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as ativo,
                SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluido,
                SUM(CASE WHEN status = 'evadido' THEN 1 ELSE 0 END) as evadido
            FROM alunos 
        """
        
        # Adicionar filtro de busca se existir
        params = []
        if search:
            sql_base += " WHERE LOWER(turma) LIKE %s"
            params.append(f"%{search}%")
        
        sql_base += " GROUP BY turma ORDER BY CASE WHEN turma IS NULL THEN 1 ELSE 0 END, turma"
        
        # Contar total
        count_sql = "SELECT COUNT(DISTINCT turma) as total FROM alunos"
        if search:
            count_sql += " WHERE LOWER(turma) LIKE %s"
        
        cursor.execute(count_sql, tuple(params))
        total_result = cursor.fetchone()
        total_items = total_result['total'] if total_result else 0
        total_pages = math.ceil(total_items / per_page) if per_page > 0 else 1
        
        # Calcular offset com a página solicitada
        offset = (page - 1) * per_page
        
        # Buscar turmas com agregação paginada
        sql = sql_base + " LIMIT %s OFFSET %s"
        params.extend([per_page, offset])
        
        cursor.execute(sql, tuple(params))
        turmas_raw = cursor.fetchall()
        
        turmas_dict = {}
        for row in turmas_raw:
            nome_turma = row['turma']
            turmas_dict[nome_turma] = {
                'total': row['total'],
                'ativo': row['ativo'] or 0,
                'concluido': row['concluido'] or 0,
                'evadido': row['evadido'] or 0
            }
        
        cursos_dict = {}
    
    else:
        # Fallback
        cursos_dict = {}
        turmas_dict = {}
        total_pages = 1
        total_items = 0

    conn.close()

    return jsonify({
        "resumo": resumo,
        "cursos": cursos_dict,
        "turmas": turmas_dict,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total_items,
            "total_pages": total_pages,
            "has_prev": page > 1,
            "has_next": page < total_pages
        }
    })
