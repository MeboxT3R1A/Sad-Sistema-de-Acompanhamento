from Bd import get_connection
from .pagination_helpers import handle_normal_pagination


def obter_dados_relatorios(page, per_page, table_type, search):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT status, COUNT(*) as total FROM alunos GROUP BY status"
    )
    stats_raw = cursor.fetchall()

    resumo = {'total': 0, 'ativo': 0, 'concluido': 0, 'evadido': 0}
    for item in stats_raw:
        s = item['status']
        qtd = item['total']
        if s in resumo:
            resumo[s] = qtd
        resumo['total'] += qtd

    if not table_type:
        if per_page >= 1000:
            cursor.execute("""
                SELECT 
                    curso,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as ativo,
                    SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluido,
                    SUM(CASE WHEN status = 'evadido' THEN 1 ELSE 0 END) as evadido
                FROM alunos 
                WHERE curso IS NOT NULL AND curso != ''
                GROUP BY curso
                ORDER BY curso
            """)
            cursos_raw = cursor.fetchall()

            cursos_dict = {
                row['curso']: {
                    'total': row['total'],
                    'ativo': row['ativo'] or 0,
                    'concluido': row['concluido'] or 0,
                    'evadido': row['evadido'] or 0
                }
                for row in cursos_raw
            }

            cursor.execute("""
                SELECT 
                    COALESCE(turma, 'Sem turma') as turma,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as ativo,
                    SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluido,
                    SUM(CASE WHEN status = 'evadido' THEN 1 ELSE 0 END) as evadido
                FROM alunos 
                GROUP BY turma
                ORDER BY 
                    CASE WHEN turma IS NULL THEN 1 ELSE 0 END,
                    turma
            """)
            turmas_raw = cursor.fetchall()

            turmas_dict = {
                row['turma']: {
                    'total': row['total'],
                    'ativo': row['ativo'] or 0,
                    'concluido': row['concluido'] or 0,
                    'evadido': row['evadido'] or 0
                }
                for row in turmas_raw
            }

            conn.close()

            return {
                "resumo": resumo,
                "cursos": cursos_dict,
                "turmas": turmas_dict,
                "pagination": {
                    "page": 1,
                    "per_page": per_page,
                    "total_cursos": len(cursos_dict),
                    "total_turmas": len(turmas_dict),
                    "total_pages_cursos": 1,
                    "total_pages_turmas": 1,
                    "has_prev": False,
                    "has_next": False
                }
            }

    resultado = handle_normal_pagination(
        conn, cursor, resumo, table_type, page, per_page, search
    )
    conn.close()
    return resultado
