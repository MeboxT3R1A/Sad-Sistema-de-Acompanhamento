if (document.getElementById('totalStudents')) {
    
    document.addEventListener('DOMContentLoaded', () => {
        carregarRelatorios();
        setupPaginationListeners();
        setupSearchListeners();
    });

    // Estados de paginação e busca
    let paginationState = {
        cursos: {
            currentPage: 1,
            perPage: 10,
            totalPages: 1,
            totalItems: 0,
            searchTerm: '',
            isSearching: false,
            hasLoadedAll: false
        },
        turmas: {
            currentPage: 1,
            perPage: 10,
            totalPages: 1,
            totalItems: 0,
            searchTerm: '',
            isSearching: false,
            hasLoadedAll: false
        }
    };

    // Cache para dados locais - ORIGINAIS COMPLETOS
    let originalCursos = {};
    let originalTurmas = {};
    // Dados filtrados atuais
    let filteredCursos = {};
    let filteredTurmas = {};

    async function carregarRelatorios(tableType = null, page = 1, isSearch = false) {
        try {
            let url = '/api/relatorios';
            
            if (tableType) {
                const state = paginationState[tableType];
                url += `?table=${tableType}&page=${state.currentPage}&per_page=${state.perPage}`;
                
                // Adicionar termo de busca se existir
                if (state.searchTerm && isSearch) {
                    url += `&search=${encodeURIComponent(state.searchTerm)}`;
                }
            } else {
                // Na primeira carga, vamos carregar TODOS os dados de uma vez
                url += `?per_page=1000`;
            }
            
            const response = await fetch(url);
            const data = await response.json();

            console.log('Dados recebidos:', data);
            
            // Atualizar estatísticas gerais apenas na primeira carga completa
            if (!tableType && data.resumo) {
                renderStats(data.resumo);
            }

            // Se for primeira carga (sem tableType)
            if (!tableType) {
                // Salvar ORIGINAIS para buscas locais
                if (data.cursos) {
                    originalCursos = data.cursos;
                    filteredCursos = {...data.cursos}; // Inicialmente igual aos originais
                    paginationState.cursos.hasLoadedAll = true;
                    
                    // Calcular total de páginas
                    const totalCursos = Object.keys(data.cursos).length;
                    paginationState.cursos.totalItems = totalCursos;
                    paginationState.cursos.totalPages = Math.ceil(totalCursos / paginationState.cursos.perPage);
                }
                if (data.turmas) {
                    originalTurmas = data.turmas;
                    filteredTurmas = {...data.turmas}; // Inicialmente igual aos originais
                    paginationState.turmas.hasLoadedAll = true;
                    
                    // Calcular total de páginas
                    const totalTurmas = Object.keys(data.turmas).length;
                    paginationState.turmas.totalItems = totalTurmas;
                    paginationState.turmas.totalPages = Math.ceil(totalTurmas / paginationState.turmas.perPage);
                }
                
                // Renderizar apenas a primeira página de cada tabela
                renderFirstPage('cursos', filteredCursos);
                renderFirstPage('turmas', filteredTurmas);
                
                // Atualizar paginação
                updatePaginationInfo('cursos', {
                    page: 1,
                    total_pages: paginationState.cursos.totalPages,
                    total: paginationState.cursos.totalItems,
                    has_prev: false,
                    has_next: paginationState.cursos.totalPages > 1
                });
                
                updatePaginationInfo('turmas', {
                    page: 1,
                    total_pages: paginationState.turmas.totalPages,
                    total: paginationState.turmas.totalItems,
                    has_prev: false,
                    has_next: paginationState.turmas.totalPages > 1
                });
            } 
            // Se for carga específica de cursos
            else if (tableType === 'cursos') {
                // Atualizar dados se for uma busca no servidor
                if (isSearch) {
                    originalCursos = data.cursos || {};
                    filteredCursos = {...originalCursos};
                    paginationState.cursos.isSearching = false;
                    paginationState.cursos.hasLoadedAll = true;
                }
                
                renderTable('courseTable', filteredCursos, 'cursos');
                if (data.pagination) {
                    updatePaginationInfo('cursos', data.pagination);
                    paginationState.cursos.totalPages = data.pagination.total_pages;
                    paginationState.cursos.totalItems = data.pagination.total;
                }
            } 
            // Se for carga específica de turmas
            else if (tableType === 'turmas') {
                // Atualizar dados se for uma busca no servidor
                if (isSearch) {
                    originalTurmas = data.turmas || {};
                    filteredTurmas = {...originalTurmas};
                    paginationState.turmas.isSearching = false;
                    paginationState.turmas.hasLoadedAll = true;
                }
                
                renderTable('classTable', filteredTurmas, 'turmas');
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

    function renderFirstPage(tableType, dataObj) {
        const tableId = tableType === 'cursos' ? 'courseTable' : 'classTable';
        const tbody = document.getElementById(tableId);
        const paginationContainer = document.getElementById(`${tableType}Pagination`);
        
        if (!tbody) return;
        
        if (!dataObj || Object.keys(dataObj).length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sem dados registrados</td></tr>';
            
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
            return;
        }
        
        // Pegar apenas os primeiros 10 itens para a primeira página
        const items = Object.entries(dataObj);
        const firstPageItems = items.slice(0, paginationState[tableType].perPage);
        
        tbody.innerHTML = firstPageItems.map(([nome, stats]) => `
            <tr>
                <td><strong>${nome || '(Sem nome)'}</strong></td>
                <td>${stats.total || 0}</td>
                <td><span class="text-success">${stats.ativo || 0}</span></td>
                <td><span class="text-primary">${stats.concluido || 0}</span></td>
                <td><span class="text-danger">${stats.evadido || 0}</span></td>
            </tr>
        `).join('');
        
        console.log(`${tableType}: ${firstPageItems.length} itens na primeira página (Total: ${items.length})`);
        
        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }
    }

    function renderTable(elementId, dataObj, tableType) {
        const tbody = document.getElementById(elementId);
        const paginationContainer = document.getElementById(`${tableType}Pagination`);
        
        if (!tbody) return;
        
        // Verificar se há dados
        if (!dataObj || Object.keys(dataObj).length === 0) {
            const searchTerm = paginationState[tableType].searchTerm;
            if (searchTerm) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum resultado encontrado para "${searchTerm}"</td></tr>`;
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sem dados registrados</td></tr>';
            }
            
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
            return;
        }
        
        // Aplicar paginação local
        let itemsToShow = Object.entries(dataObj);
        const state = paginationState[tableType];
        
        if (state.hasLoadedAll) {
            const startIndex = (state.currentPage - 1) * state.perPage;
            const endIndex = startIndex + state.perPage;
            itemsToShow = itemsToShow.slice(startIndex, endIndex);
        }
        
        tbody.innerHTML = itemsToShow.map(([nome, stats]) => `
            <tr>
                <td><strong>${nome || '(Sem nome)'}</strong></td>
                <td>${stats.total || 0}</td>
                <td><span class="text-success">${stats.ativo || 0}</span></td>
                <td><span class="text-primary">${stats.concluido || 0}</span></td>
                <td><span class="text-danger">${stats.evadido || 0}</span></td>
            </tr>
        `).join('');
        
        console.log(`${tableType}: ${itemsToShow.length} itens carregados (Total: ${Object.keys(dataObj).length})`);
        
        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }
    }

    function setupSearchListeners() {
        // Busca para cursos
        const searchCursosInput = document.getElementById('searchCursos');
        if (searchCursosInput) {
            let searchTimeout;
            searchCursosInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const searchTerm = e.target.value.toLowerCase().trim();
                    paginationState.cursos.searchTerm = searchTerm;
                    paginationState.cursos.currentPage = 1; // Sempre volta para página 1 ao buscar
                    
                    if (searchTerm) {
                        // Se já temos todos os dados carregados, filtrar localmente
                        if (paginationState.cursos.hasLoadedAll && Object.keys(originalCursos).length > 0) {
                            console.log('Filtrando cursos localmente para:', searchTerm);
                            
                            // Filtrar os dados ORIGINAIS
                            const filtered = {};
                            Object.entries(originalCursos).forEach(([key, value]) => {
                                if (key.toLowerCase().includes(searchTerm)) {
                                    filtered[key] = value;
                                }
                            });
                            
                            // Atualizar dados filtrados
                            filteredCursos = filtered;
                            
                            // Atualizar contagens
                            const totalItems = Object.keys(filtered).length;
                            paginationState.cursos.totalItems = totalItems;
                            paginationState.cursos.totalPages = Math.ceil(totalItems / paginationState.cursos.perPage);
                            
                            // Renderizar tabela filtrada
                            renderTable('courseTable', filteredCursos, 'cursos');
                            
                            // Atualizar paginação
                            updatePaginationInfo('cursos', {
                                page: 1,
                                total_pages: paginationState.cursos.totalPages,
                                total: paginationState.cursos.totalItems,
                                has_prev: false,
                                has_next: paginationState.cursos.totalPages > 1
                            });
                        } else {
                            // Se não temos todos, buscar no servidor
                            console.log('Buscando cursos no servidor para:', searchTerm);
                            paginationState.cursos.isSearching = true;
                            carregarRelatorios('cursos', 1, true);
                        }
                    } else {
                        // SE O CAMPO ESTIVER VAZIO, VOLTAR AOS DADOS ORIGINAIS
                        console.log('Campo vazio, restaurando dados originais de cursos');
                        paginationState.cursos.searchTerm = '';
                        filteredCursos = {...originalCursos}; // Restaura dados originais
                        
                        // Restaurar contagens originais
                        const totalItems = Object.keys(originalCursos).length;
                        paginationState.cursos.totalItems = totalItems;
                        paginationState.cursos.totalPages = Math.ceil(totalItems / paginationState.cursos.perPage);
                        
                        // Renderizar tabela com dados originais
                        renderTable('courseTable', filteredCursos, 'cursos');
                        
                        // Atualizar paginação
                        updatePaginationInfo('cursos', {
                            page: 1,
                            total_pages: paginationState.cursos.totalPages,
                            total: paginationState.cursos.totalItems,
                            has_prev: false,
                            has_next: paginationState.cursos.totalPages > 1
                        });
                    }
                }, 300); // Debounce mais rápido para busca em tempo real
            });
            
            // Também adicionar evento para quando o campo for limpo
            searchCursosInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    const event = new Event('input', { bubbles: true });
                    e.target.dispatchEvent(event);
                }
            });
        }

        // Busca para turmas
        const searchTurmasInput = document.getElementById('searchTurmas');
        if (searchTurmasInput) {
            let searchTimeout;
            searchTurmasInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const searchTerm = e.target.value.toLowerCase().trim();
                    paginationState.turmas.searchTerm = searchTerm;
                    paginationState.turmas.currentPage = 1; // Sempre volta para página 1 ao buscar
                    
                    if (searchTerm) {
                        // Se já temos todos os dados carregados, filtrar localmente
                        if (paginationState.turmas.hasLoadedAll && Object.keys(originalTurmas).length > 0) {
                            console.log('Filtrando turmas localmente para:', searchTerm);
                            
                            // Filtrar os dados ORIGINAIS
                            const filtered = {};
                            Object.entries(originalTurmas).forEach(([key, value]) => {
                                if (key.toLowerCase().includes(searchTerm)) {
                                    filtered[key] = value;
                                }
                            });
                            
                            // Atualizar dados filtrados
                            filteredTurmas = filtered;
                            
                            // Atualizar contagens
                            const totalItems = Object.keys(filtered).length;
                            paginationState.turmas.totalItems = totalItems;
                            paginationState.turmas.totalPages = Math.ceil(totalItems / paginationState.turmas.perPage);
                            
                            // Renderizar tabela filtrada
                            renderTable('classTable', filteredTurmas, 'turmas');
                            
                            // Atualizar paginação
                            updatePaginationInfo('turmas', {
                                page: 1,
                                total_pages: paginationState.turmas.totalPages,
                                total: paginationState.turmas.totalItems,
                                has_prev: false,
                                has_next: paginationState.turmas.totalPages > 1
                            });
                        } else {
                            // Se não temos todos, buscar no servidor
                            console.log('Buscando turmas no servidor para:', searchTerm);
                            paginationState.turmas.isSearching = true;
                            carregarRelatorios('turmas', 1, true);
                        }
                    } else {
                        // SE O CAMPO ESTIVER VAZIO, VOLTAR AOS DADOS ORIGINAIS
                        console.log('Campo vazio, restaurando dados originais de turmas');
                        paginationState.turmas.searchTerm = '';
                        filteredTurmas = {...originalTurmas}; // Restaura dados originais
                        
                        // Restaurar contagens originais
                        const totalItems = Object.keys(originalTurmas).length;
                        paginationState.turmas.totalItems = totalItems;
                        paginationState.turmas.totalPages = Math.ceil(totalItems / paginationState.turmas.perPage);
                        
                        // Renderizar tabela com dados originais
                        renderTable('classTable', filteredTurmas, 'turmas');
                        
                        // Atualizar paginação
                        updatePaginationInfo('turmas', {
                            page: 1,
                            total_pages: paginationState.turmas.totalPages,
                            total: paginationState.turmas.totalItems,
                            has_prev: false,
                            has_next: paginationState.turmas.totalPages > 1
                        });
                    }
                }, 300); // Debounce mais rápido para busca em tempo real
            });
            
            // Também adicionar evento para quando o campo for limpo
            searchTurmasInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    const event = new Event('input', { bubbles: true });
                    e.target.dispatchEvent(event);
                }
            });
        }
    }

    function setupPaginationListeners() {
        // Paginação para Cursos
        document.getElementById('prevCursosBtn')?.addEventListener('click', () => {
            if (paginationState.cursos.currentPage > 1) {
                paginationState.cursos.currentPage--;
                
                if (paginationState.cursos.hasLoadedAll) {
                    // Navega localmente nos dados filtrados atuais
                    renderTable('courseTable', filteredCursos, 'cursos');
                    updatePaginationInfo('cursos', {
                        page: paginationState.cursos.currentPage,
                        total_pages: paginationState.cursos.totalPages,
                        total: paginationState.cursos.totalItems,
                        has_prev: paginationState.cursos.currentPage > 1,
                        has_next: paginationState.cursos.currentPage < paginationState.cursos.totalPages
                    });
                } else {
                    carregarRelatorios('cursos', paginationState.cursos.currentPage);
                }
            }
        });
        
        document.getElementById('nextCursosBtn')?.addEventListener('click', () => {
            if (paginationState.cursos.currentPage < paginationState.cursos.totalPages) {
                paginationState.cursos.currentPage++;
                
                if (paginationState.cursos.hasLoadedAll) {
                    // Navega localmente nos dados filtrados atuais
                    renderTable('courseTable', filteredCursos, 'cursos');
                    updatePaginationInfo('cursos', {
                        page: paginationState.cursos.currentPage,
                        total_pages: paginationState.cursos.totalPages,
                        total: paginationState.cursos.totalItems,
                        has_prev: paginationState.cursos.currentPage > 1,
                        has_next: paginationState.cursos.currentPage < paginationState.cursos.totalPages
                    });
                } else {
                    carregarRelatorios('cursos', paginationState.cursos.currentPage);
                }
            }
        });

        // Paginação para Turmas
        document.getElementById('prevTurmasBtn')?.addEventListener('click', () => {
            if (paginationState.turmas.currentPage > 1) {
                paginationState.turmas.currentPage--;
                
                if (paginationState.turmas.hasLoadedAll) {
                    // Navega localmente nos dados filtrados atuais
                    renderTable('classTable', filteredTurmas, 'turmas');
                    updatePaginationInfo('turmas', {
                        page: paginationState.turmas.currentPage,
                        total_pages: paginationState.turmas.totalPages,
                        total: paginationState.turmas.totalItems,
                        has_prev: paginationState.turmas.currentPage > 1,
                        has_next: paginationState.turmas.currentPage < paginationState.turmas.totalPages
                    });
                } else {
                    carregarRelatorios('turmas', paginationState.turmas.currentPage);
                }
            }
        });
        
        document.getElementById('nextTurmasBtn')?.addEventListener('click', () => {
            if (paginationState.turmas.currentPage < paginationState.turmas.totalPages) {
                paginationState.turmas.currentPage++;
                
                if (paginationState.turmas.hasLoadedAll) {
                    // Navega localmente nos dados filtrados atuais
                    renderTable('classTable', filteredTurmas, 'turmas');
                    updatePaginationInfo('turmas', {
                        page: paginationState.turmas.currentPage,
                        total_pages: paginationState.turmas.totalPages,
                        total: paginationState.turmas.totalItems,
                        has_prev: paginationState.turmas.currentPage > 1,
                        has_next: paginationState.turmas.currentPage < paginationState.turmas.totalPages
                    });
                } else {
                    carregarRelatorios('turmas', paginationState.turmas.currentPage);
                }
            }
        });
    }

    function updatePaginationInfo(tableType, paginationData) {
        if (!paginationData) return;
        
        // Atualizar estado
        const state = paginationState[tableType];
        state.currentPage = paginationData.page || 1;
        state.totalPages = paginationData.total_pages || 1;
        state.totalItems = paginationData.total || 0;
        
        // Atualizar UI
        const pageInfo = document.getElementById(`${tableType}PageInfo`);
        const prevBtn = document.getElementById(`prev${capitalizeFirst(tableType)}Btn`);
        const nextBtn = document.getElementById(`next${capitalizeFirst(tableType)}Btn`);
        
        if (pageInfo) {
            pageInfo.textContent = `Página ${paginationData.page || 1} de ${paginationData.total_pages || 1}`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = !paginationData.has_prev || paginationData.page <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = !paginationData.has_next || paginationData.page >= paginationData.total_pages;
        }
        
        console.log(`${tableType} - Página ${paginationData.page} de ${paginationData.total_pages}`);
    }

    // ... (as outras funções permanecem iguais) ...
    
    function renderStats(resumo) {
        if (resumo) {
            animateValue("totalStudents", 0, resumo.total || 0, 1000);
            animateValue("activeStudents", 0, resumo.ativo || 0, 1000);
            animateValue("completedStudents", 0, resumo.concluido || 0, 1000);
            animateValue("dropoutStudents", 0, resumo.evadido || 0, 1000);
        }
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