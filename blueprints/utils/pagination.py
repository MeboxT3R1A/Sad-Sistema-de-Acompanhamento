import math
from flask import jsonify
from Bd import get_connection

def paginate_query(base_query, count_query, params=None, page=1, per_page=15, search=None, search_fields=None):
    """
    Função centralizada para paginação de qualquer query
    
    Args:
        base_query: Query SQL principal (sem LIMIT/OFFSET)
        count_query: Query para contar total
        params: Parâmetros da query
        page: Número da página
        per_page: Itens por página
        search: Termo de busca
        search_fields: Lista de campos para busca
    
    Returns:
        dict com dados paginados
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Parâmetros iniciais
        final_params = list(params) if params else []
        where_clauses = []
        
        # Adicionar filtro de busca se existir
        if search and search_fields:
            search_conditions = []
            search_param = f"%{search}%"
            
            for field in search_fields:
                search_conditions.append(f"LOWER({field}) LIKE %s")
                final_params.append(search_param)
            
            if search_conditions:
                where_clauses.append("(" + " OR ".join(search_conditions) + ")")
        
        # Adicionar WHERE às queries
        if where_clauses:
            where_sql = " WHERE " + " AND ".join(where_clauses)
            base_query += where_sql
            count_query += where_sql
        
        # Calcular offset
        offset = (page - 1) * per_page
        
        # 1. Contar total
        cursor.execute(count_query, tuple(final_params))
        total_result = cursor.fetchone()
        total_items = total_result['total'] if total_result else 0
        total_pages = math.ceil(total_items / per_page) if per_page > 0 else 1
        
        # 2. Buscar dados paginados
        paginated_query = f"{base_query} LIMIT %s OFFSET %s"
        final_params.extend([per_page, offset])
        
        cursor.execute(paginated_query, tuple(final_params))
        items = cursor.fetchall()
        
        conn.close()
        
        return {
            'items': items,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_items,
                'total_pages': total_pages,
                'has_prev': page > 1,
                'has_next': page < total_pages
            }
        }
        
    except Exception as e:
        print(f"Erro na paginação: {e}")
        return {'items': [], 'pagination': {}}
