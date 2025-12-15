if (document.getElementById('totalStudents')) {
    
    document.addEventListener('DOMContentLoaded', () => {
        carregarRelatorios();
        setupPaginationListeners();
    });

    // Estados de paginação
    let paginationState = {
        cursos: {
            currentPage: 1,
            perPage: 10,
            totalPages: 1,
            totalItems: 0
        },
        turmas: {
            currentPage: 1,
            perPage: 10,
            totalPages: 1,
            totalItems: 0
        }
    };

    async function carregarRelatorios(tableType = null, page = 1) {
        try {
            let url = '/api/relatorios';
            
            if (tableType) {
                const state = paginationState[tableType];
                url += `?table=${tableType}&page=${state.currentPage}&per_page=${state.perPage}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();

            console.log('Dados recebidos:', data); // Para debug
            
            // Atualizar estatísticas gerais
            if (data.resumo) {
                renderStats(data.resumo);
            }

            // Se for primeira carga (sem tableType)
            if (!tableType) {
                // Atualizar estados com dados da primeira carga
                if (data.pagination && data.pagination.total_pages_cursos) {
                    paginationState.cursos.totalPages = data.pagination.total_pages_cursos;
                    paginationState.cursos.totalItems = data.pagination.total_cursos;
                }
                if (data.pagination && data.pagination.total_pages_turmas) {
                    paginationState.turmas.totalPages = data.pagination.total_pages_turmas;
                    paginationState.turmas.totalItems = data.pagination.total_turmas;
                }
                
                // Renderizar tabelas
                renderTable('courseTable', data.cursos, 'cursos');
                renderTable('classTable', data.turmas, 'turmas');
                
                // Atualizar paginação
                updatePaginationInfo('cursos', {
                    page: 1,
                    total_pages: data.pagination?.total_pages_cursos || 1,
                    total: data.pagination?.total_cursos || 0,
                    has_prev: false,
                    has_next: data.pagination?.total_pages_cursos > 1
                });
                
                updatePaginationInfo('turmas', {
                    page: 1,
                    total_pages: data.pagination?.total_pages_turmas || 1,
                    total: data.pagination?.total_turmas || 0,
                    has_prev: false,
                    has_next: data.pagination?.total_pages_turmas > 1
                });
            } 
            // Se for carga específica de cursos
            else if (tableType === 'cursos') {
                renderTable('courseTable', data.cursos, 'cursos');
                if (data.pagination) {
                    updatePaginationInfo('cursos', data.pagination);
                    paginationState.cursos.totalPages = data.pagination.total_pages;
                    paginationState.cursos.totalItems = data.pagination.total;
                }
            } 
            // Se for carga específica de turmas
            else if (tableType === 'turmas') {
                renderTable('classTable', data.turmas, 'turmas');
                if (data.pagination) {
                    updatePaginationInfo('turmas', data.pagination);
                    paginationState.turmas.totalPages = data.pagination.total_pages;
                    paginationState.turmas.totalItems = data.pagination.total;
                }
            }

        } catch (error) {
            console.error("Erro ao carregar relatórios:", error);
            showToast('Erro ao carregar dados', 'error');
        }
    }

    function renderStats(resumo) {
        if (resumo) {
            animateValue("totalStudents", 0, resumo.total || 0, 1000);
            animateValue("activeStudents", 0, resumo.ativo || 0, 1000);
            animateValue("completedStudents", 0, resumo.concluido || 0, 1000);
            animateValue("dropoutStudents", 0, resumo.evadido || 0, 1000);
        }
    }

    function renderTable(elementId, dataObj, tableType) {
        const tbody = document.getElementById(elementId);
        const paginationContainer = document.getElementById(`${tableType}Pagination`);
        
        if (!tbody) return;
        
        // Verificar se há dados
        if (!dataObj || Object.keys(dataObj).length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sem dados registrados</td></tr>';
            
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
            return;
        }
        
        // Converter objeto em array e renderizar
        const items = Object.entries(dataObj);
        tbody.innerHTML = items.map(([nome, stats]) => `
            <tr>
                <td><strong>${nome || '(Sem nome)'}</strong></td>
                <td>${stats.total || 0}</td>
                <td><span class="text-success">${stats.ativo || 0}</span></td>
                <td><span class="text-primary">${stats.concluido || 0}</span></td>
                <td><span class="text-danger">${stats.evadido || 0}</span></td>
            </tr>
        `).join('');
        
        // Mostrar quantidade de itens carregados
        console.log(`${tableType}: ${items.length} itens carregados`);
        
        // Mostrar/ocultar paginação
        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }
    }

    function setupPaginationListeners() {
        // Paginação para Cursos
        document.getElementById('prevCursosBtn')?.addEventListener('click', () => {
            if (paginationState.cursos.currentPage > 1) {
                paginationState.cursos.currentPage--;
                carregarRelatorios('cursos', paginationState.cursos.currentPage);
            }
        });
        
        document.getElementById('nextCursosBtn')?.addEventListener('click', () => {
            if (paginationState.cursos.currentPage < paginationState.cursos.totalPages) {
                paginationState.cursos.currentPage++;
                carregarRelatorios('cursos', paginationState.cursos.currentPage);
            }
        });

        // Paginação para Turmas
        document.getElementById('prevTurmasBtn')?.addEventListener('click', () => {
            if (paginationState.turmas.currentPage > 1) {
                paginationState.turmas.currentPage--;
                carregarRelatorios('turmas', paginationState.turmas.currentPage);
            }
        });
        
        document.getElementById('nextTurmasBtn')?.addEventListener('click', () => {
            if (paginationState.turmas.currentPage < paginationState.turmas.totalPages) {
                paginationState.turmas.currentPage++;
                carregarRelatorios('turmas', paginationState.turmas.currentPage);
            }
        });
    }

    function updatePaginationInfo(tableType, paginationData) {
        if (!paginationData) return;
        
        // Atualizar estado
        paginationState[tableType].currentPage = paginationData.page || 1;
        paginationState[tableType].totalPages = paginationData.total_pages || 1;
        paginationState[tableType].totalItems = paginationData.total || 0;
        
        // Atualizar UI
        const pageInfo = document.getElementById(`${tableType}PageInfo`);
        const prevBtn = document.getElementById(`prev${capitalizeFirst(tableType)}Btn`);
        const nextBtn = document.getElementById(`next${capitalizeFirst(tableType)}Btn`);
        
        if (pageInfo) {
            pageInfo.textContent = `Página ${paginationData.page || 1} de ${paginationData.total_pages || 1}`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = !paginationData.has_prev;
        }
        
        if (nextBtn) {
            nextBtn.disabled = !paginationData.has_next;
        }
        
        console.log(`${tableType} - Página ${paginationData.page} de ${paginationData.total_pages}, has_prev: ${paginationData.has_prev}, has_next: ${paginationData.has_next}`);
    }

    function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function animateValue(id, start, end, duration) {
        if (start === end) return;
        const range = end - start;
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        const obj = document.getElementById(id);
        
        const timer = setInterval(function() {
            current += increment;
            obj.textContent = current;
            if (current == end) {
                clearInterval(timer);
            }
        }, stepTime > 0 ? stepTime : 10);
        if(stepTime <= 0) obj.textContent = end; 
    }

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}