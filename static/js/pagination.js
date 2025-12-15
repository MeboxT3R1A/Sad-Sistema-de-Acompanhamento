// ========== COMPONENTE DE PAGINAÇÃO REUTILIZÁVEL ==========
class PaginationManager {
    constructor(config) {
        this.containerId = config.containerId;
        this.perPage = config.perPage || 15;
        this.currentPage = 1;
        this.totalPages = 1;
        this.totalItems = 0;
        this.currentSearch = '';
        this.onPageChange = config.onPageChange;
        this.onSearch = config.onSearch;
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.setupSearchListener();
    }
    
    createContainer() {
        let container = document.getElementById(this.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            container.className = 'pagination';
            
            // Inserir após a tabela
            const tableWrapper = document.querySelector('.table-wrapper');
            if (tableWrapper && tableWrapper.parentNode) {
                tableWrapper.parentNode.insertBefore(container, tableWrapper.nextSibling);
            }
        }
        this.container = container;
    }
    
    setupSearchListener() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && this.onSearch) {
            searchInput.addEventListener('input', () => {
                this.currentSearch = searchInput.value;
                this.currentPage = 1; // Volta para primeira página
                this.onSearch(this.currentSearch, this.currentPage);
            });
        }
    }
    
    update(paginationData) {
        this.totalItems = paginationData.total || 0;
        this.totalPages = paginationData.total_pages || 1;
        this.currentPage = paginationData.page || 1;
        
        this.render();
    }
    
    render() {
        const hasPrev = this.currentPage > 1;
        const hasNext = this.currentPage < this.totalPages;
        
        // Calcular intervalo exibido

        this.container.innerHTML = `

            <div class="pagination-controls">
                <button class="btn btn-outline" id="prevPageBtn" ${!hasPrev ? 'disabled' : ''}>
                    ← Anterior
                </button>
                <span class="pagination-current">
                    Página ${this.currentPage} de ${this.totalPages}
                </span>
                <button class="btn btn-outline" id="nextPageBtn" ${!hasNext ? 'disabled' : ''}>
                    Próxima →
                </button>
            </div>
        `;
        
        // Adicionar eventos
        document.getElementById('prevPageBtn')?.addEventListener('click', () => {
            if (hasPrev) {
                this.currentPage--;
                this.onPageChange(this.currentPage, this.currentSearch);
            }
        });
        
        document.getElementById('nextPageBtn')?.addEventListener('click', () => {
            if (hasNext) {
                this.currentPage++;
                this.onPageChange(this.currentPage, this.currentSearch);
            }
        });
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.onPageChange(this.currentPage, this.currentSearch);
    }
}