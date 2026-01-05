/**
 * Basecase Architecture Guide - Main Application Logic
 * Professional theme engine and content management
 */

// Global systems data
// Note: In production, this can be loaded from systems.json via fetch
// For local development (file:// protocol), data is embedded here
let SYSTEMS = [
    {
        "id": "global-sequencer",
        "title": "Global Sequencer",
        "category": "Distributed",
        "icon": "cpu",
        "description": "High-throughput unique ID generation using the Snowflake algorithm for chronological sorting.",
        "tags": ["distributed-systems", "scalability", "database", "unique-ids"],
        "difficulty": "intermediate",
        "estimatedReadTime": "8 min",
        "stack": ["Snowflake-ID", "Rust", "gRPC"],
        "metadata": {
            "dateAdded": "2026-01-05",
            "source": "Twitter's Snowflake Paper",
            "prerequisites": ["distributed-consensus", "lsm-tree"]
        },
        "adr": {
            "problem": "Why not use UUIDs? While 128-bit UUIDs are globally unique, they introduce major bottlenecks at scale: index fragmentation and lack of sorting capability.",
            "context": "This system relies on <span class='inline-link' onclick='showDetail(\"distributed-consensus\")'>Consensus</span> and <span class='inline-link' onclick='showDetail(\"lsm-tree\")'>LSM-Trees</span>.",
            "decision": "Implement a structured Snowflake generator. Explore the sub-components in the blueprint below.",
            "architecture": "<div class=\"my-10 p-10 rounded-2xl border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-inner overflow-hidden\"><svg viewBox=\"0 0 600 340\" class=\"w-full h-auto\"><g class=\"bp-node\" onclick=\"showDetail('global-sequencer')\"><rect x=\"200\" y=\"20\" width=\"200\" height=\"70\" rx=\"12\" /><text x=\"300\" y=\"60\" text-anchor=\"middle\">Sequencer Node</text></g><path d=\"M300 90 V 160\" class=\"bp-line\" /><path d=\"M300 160 H 100 V 220\" class=\"bp-line\" /><path d=\"M300 160 H 500 V 220\" class=\"bp-line\" /><g class=\"bp-node\" onclick=\"showDetail('distributed-consensus')\"><rect x=\"25\" y=\"220\" width=\"150\" height=\"60\" rx=\"12\" /><text x=\"100\" y=\"255\" text-anchor=\"middle\">Consensus</text></g><g class=\"bp-node\" onclick=\"showDetail('bloom-filter')\"><rect x=\"225\" y=\"220\" width=\"150\" height=\"60\" rx=\"12\" /><text x=\"300\" y=\"255\" text-anchor=\"middle\">Bloom Filter</text></g><g class=\"bp-node\" onclick=\"showDetail('lsm-tree')\"><rect x=\"425\" y=\"220\" width=\"150\" height=\"60\" rx=\"12\" /><text x=\"500\" y=\"255\" text-anchor=\"middle\">LSM-Tree</text></g></svg></div><h3>Snowflake vs. UUID Showdown</h3><table class=\"ui-table\"><thead><tr><th>Feature</th><th>UUID v4</th><th>Snowflake</th></tr></thead><tbody><tr><td><strong>Bit Size</strong></td><td>128-bit</td><td>64-bit</td></tr><tr><td><strong>Ordering</strong></td><td>Random</td><td>Time-Sortable</td></tr><tr><td><strong>Storage</strong></td><td>Binary/String</td><td>Native BigInt</td></tr></tbody></table>",
            "consequences": "Instant local ID generation without central bottlenecks."
        },
        "relatedConcepts": ["distributed-consensus", "lsm-tree", "bloom-filter"]
    },
    {
        "id": "distributed-consensus",
        "title": "Distributed Consensus",
        "category": "Consistency",
        "icon": "users",
        "description": "Ensuring state machine consistency across distributed nodes via the Raft algorithm.",
        "tags": ["consensus", "distributed-systems", "fault-tolerance", "raft"],
        "difficulty": "advanced",
        "estimatedReadTime": "10 min",
        "stack": ["Raft", "Quorum"],
        "metadata": {
            "dateAdded": "2026-01-05",
            "source": "Raft Paper - Diego Ongaro",
            "prerequisites": []
        },
        "adr": {
            "problem": "How do nodes agree on values in a cluster where any node can fail at any time?",
            "context": "Consensus ensures that a majority of nodes agree on the state before it is considered 'committed'.",
            "decision": "Utilize the Raft algorithm for its formal safety guarantees and developer understandability.",
            "architecture": "Leaders manage the log and heartbeat followers. If a leader fails, a new term begins.",
            "consequences": "Guarantees strong consistency at the cost of majority network latency."
        },
        "externalLinks": [
            {
                "name": "The Raft Consensus Algorithm Official Site",
                "url": "https://raft.github.io/"
            }
        ],
        "relatedConcepts": ["global-sequencer"]
    },
    {
        "id": "bloom-filter",
        "title": "Bloom Filter",
        "category": "Storage",
        "icon": "filter",
        "description": "Probabilistic set membership to avoid unnecessary expensive disk seeks in LSM storage.",
        "tags": ["data-structures", "probabilistic", "storage", "optimization"],
        "difficulty": "beginner",
        "estimatedReadTime": "5 min",
        "stack": ["Hashing", "Bitset"],
        "metadata": {
            "dateAdded": "2026-01-05",
            "source": "Database Internals Book",
            "prerequisites": []
        },
        "adr": {
            "problem": "Checking if a key exists in an <span class='inline-link' onclick='showDetail(\"lsm-tree\")'>LSM-Tree</span> is expensive due to multiple disk seeks.",
            "context": "Disk I/O is the primary bottleneck for reads in write-heavy storage engines.",
            "decision": "Implement a Bloom Filter in RAM to provide a probabilistic existence check.",
            "architecture": "Uses k-independent hash functions to map values to a bitset of size m.",
            "consequences": "Sub-millisecond membership testing with extremely low memory footprint."
        },
        "externalLinks": [
            {
                "name": "Cloudflare: When Bloom Filters don't bloom",
                "url": "https://blog.cloudflare.com/when-bloom-filters-dont-bloom/"
            }
        ],
        "relatedConcepts": ["lsm-tree"]
    },
    {
        "id": "lsm-tree",
        "title": "LSM-Tree Storage",
        "category": "Persistence",
        "icon": "database",
        "description": "Write-optimized storage engine designed for high-throughput sequential inserts.",
        "tags": ["storage-engine", "database", "write-optimization", "data-structures"],
        "difficulty": "intermediate",
        "estimatedReadTime": "12 min",
        "stack": ["Memtable", "SSTables"],
        "metadata": {
            "dateAdded": "2026-01-05",
            "source": "Designing Data-Intensive Applications",
            "prerequisites": []
        },
        "adr": {
            "problem": "How do we handle high-volume random writes without fragmenting the database index?",
            "context": "B-Trees require expensive random I/O for updates, which kills performance.",
            "decision": "Adopt a Log-Structured Merge-Tree approach. Updates are buffered in memory and flushed sequentially.",
            "architecture": "Multiple levels of immutable SSTables are merged via background compaction.",
            "consequences": "Exceptional write throughput for sequence persistence on modern SSDs."
        },
        "externalLinks": [
            {
                "name": "Cassandra Architecture: Storage Engine",
                "url": "https://cassandra.apache.org/doc/stable/cassandra/architecture/storage-engine.html"
            }
        ],
        "relatedConcepts": ["bloom-filter", "global-sequencer"]
    }
];

// State management
let currentFilter = 'all';
let showFavoritesOnly = false;
let filteredSystems = [];

/**
 * LocalStorage management for personal learning features
 */
const StorageManager = {
    getFavorites() {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    },
    
    toggleFavorite(id) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(id);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(id);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        return favorites.includes(id);
    },
    
    isFavorite(id) {
        return this.getFavorites().includes(id);
    },
    
    addToRecentlyViewed(id) {
        let recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        recent = recent.filter(item => item !== id);
        recent.unshift(id);
        recent = recent.slice(0, 5); // Keep only last 5
        localStorage.setItem('recentlyViewed', JSON.stringify(recent));
    },
    
    getNotes(id) {
        const notes = JSON.parse(localStorage.getItem('systemNotes') || '{}');
        return notes[id] || '';
    },
    
    saveNotes(id, notes) {
        const allNotes = JSON.parse(localStorage.getItem('systemNotes') || '{}');
        allNotes[id] = notes;
        localStorage.setItem('systemNotes', JSON.stringify(allNotes));
    }
};

/**
 * PROFESSIONAL THEME ENGINE
 * Instant theme switch with zero-flicker using transition suppression.
 */
function toggleDarkMode() {
    const html = document.documentElement;
    
    // Suppress all transitions
    html.classList.add('theme-transitioning');
    
    // Force reflow to ensure suppression is active
    void html.offsetHeight;
    
    // Toggle theme
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Force another reflow to ensure theme is applied
    void html.offsetHeight;
    
    // Re-enable transitions on next frame
    requestAnimationFrame(() => {
        html.classList.remove('theme-transitioning');
    });
}

/**
 * Search functionality
 */
function toggleSearch() {
    const container = document.getElementById('searchContainer');
    const input = document.getElementById('searchInput');
    
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        setTimeout(() => input.focus(), 100);
    } else {
        container.classList.add('hidden');
        input.value = '';
        document.getElementById('searchResults').innerHTML = '';
    }
}

function performSearch(query) {
    if (!query.trim()) {
        document.getElementById('searchResults').innerHTML = '<p class="text-zinc-400 text-center py-8">Start typing to search...</p>';
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    const results = SYSTEMS.filter(sys => {
        return sys.title.toLowerCase().includes(lowerQuery) ||
               sys.description.toLowerCase().includes(lowerQuery) ||
               sys.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
               sys.category.toLowerCase().includes(lowerQuery) ||
               sys.adr.problem.toLowerCase().includes(lowerQuery);
    });
    
    const resultsHTML = results.length > 0 
        ? results.map(sys => `
            <div class="search-result-item" onclick="showDetail('${sys.id}'); toggleSearch();">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <i data-lucide="${sys.icon}" class="w-5 h-5"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold mb-1">${highlightText(sys.title, query)}</h4>
                        <p class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">${highlightText(sys.description, query)}</p>
                        <div class="flex flex-wrap gap-1 mt-2">
                            <span class="badge badge-${sys.difficulty}">${sys.difficulty}</span>
                            ${sys.tags.slice(0, 2).map(tag => `<span class="badge badge-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('')
        : '<p class="text-zinc-400 text-center py-8">No results found</p>';
    
    document.getElementById('searchResults').innerHTML = resultsHTML;
    lucide.createIcons();
}

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

/**
 * Filter functionality
 */
function filterByCategory(category) {
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderSystems();
}

function toggleFavoritesOnly() {
    showFavoritesOnly = !showFavoritesOnly;
    const btn = document.getElementById('favoritesBtn');
    
    if (showFavoritesOnly) {
        btn.classList.add('text-yellow-500');
    } else {
        btn.classList.remove('text-yellow-500');
    }
    
    renderSystems();
}

function getFilteredSystems() {
    let systems = [...SYSTEMS];
    
    // Filter by category
    if (currentFilter !== 'all') {
        systems = systems.filter(sys => sys.category === currentFilter);
    }
    
    // Filter by favorites
    if (showFavoritesOnly) {
        const favorites = StorageManager.getFavorites();
        systems = systems.filter(sys => favorites.includes(sys.id));
    }
    
    return systems;
}

function updateFilterCounts() {
    const categories = ['all', 'Distributed', 'Storage', 'Consistency', 'Persistence'];
    categories.forEach(cat => {
        const count = cat === 'all' 
            ? SYSTEMS.length 
            : SYSTEMS.filter(sys => sys.category === cat).length;
        const countEl = document.getElementById(`count-${cat}`);
        if (countEl) countEl.textContent = count;
    });
}

/**
 * Render systems grid in catalog view
 */
function renderSystems() {
    const grid = document.getElementById('systemsGrid');
    const systems = getFilteredSystems();
    
    if (systems.length === 0) {
        grid.innerHTML = '<p class="text-zinc-400 col-span-full text-center py-12">No systems match your filters</p>';
        return;
    }
    
    grid.innerHTML = systems.map(sys => {
        const isFav = StorageManager.isFavorite(sys.id);
        const difficultyColor = {
            'beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }[sys.difficulty] || '';
        
        return `
        <div class="card-surface rounded-3xl p-8 flex flex-col h-full relative">
            <button onclick="toggleFavorite('${sys.id}')" class="favorite-star ${isFav ? 'is-favorite' : ''}">
                <i data-lucide="star" class="w-5 h-5 ${isFav ? 'fill-current' : ''}"></i>
            </button>
            
            <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-inner">
                <i data-lucide="${sys.icon}" class="w-5 h-5"></i>
            </div>
            
            <div class="flex items-center gap-2 mb-3">
                <span class="text-[10px] font-bold uppercase tracking-widest text-blue-600">${sys.category}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${difficultyColor}">${sys.difficulty}</span>
            </div>
            
            <h3 class="text-xl font-bold mb-3 tracking-tight">${sys.title}</h3>
            <p class="text-sm leading-relaxed mb-4 text-zinc-500 dark:text-zinc-400 font-medium">${sys.description}</p>
            
            <div class="flex flex-wrap gap-1 mb-6">
                ${sys.tags.slice(0, 3).map(tag => `<span class="badge badge-tag">${tag}</span>`).join('')}
            </div>
            
            <div class="mt-auto space-y-3">
                <div class="flex items-center justify-between text-xs text-zinc-400">
                    <span><i data-lucide="clock" class="w-3 h-3 inline"></i> ${sys.estimatedReadTime}</span>
                    <span><i data-lucide="book-open" class="w-3 h-3 inline"></i> ${sys.metadata.source}</span>
                </div>
                <button onclick="showDetail('${sys.id}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95">
                    Examine Logic
                </button>
            </div>
        </div>
    `}).join('');
    lucide.createIcons();
}

function toggleFavorite(id) {
    event.stopPropagation();
    StorageManager.toggleFavorite(id);
    renderSystems();
}

/**
 * Show detail view for a specific system
 */
function showDetail(id) {
    const sys = SYSTEMS.find(s => s.id === id);
    if(!sys) return;

    // Track recently viewed
    StorageManager.addToRecentlyViewed(id);
    
    const view = document.getElementById('detailView');
    const catalog = document.getElementById('catalogView');
    const hero = document.getElementById('catalogHero');
    const content = document.getElementById('detailContent');
    
    const isFav = StorageManager.isFavorite(id);
    const userNotes = StorageManager.getNotes(id);
    
    // Get related systems
    const relatedSystems = sys.relatedConcepts 
        ? sys.relatedConcepts.map(relId => SYSTEMS.find(s => s.id === relId)).filter(Boolean)
        : [];

    content.innerHTML = `
        <div class="mb-16">
            <div class="flex items-start justify-between gap-4 mb-6">
                <div class="inline-flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Decision Record • ${sys.id.toUpperCase()}</span>
                </div>
                <button onclick="toggleFavoriteDetail('${id}')" class="favorite-star ${isFav ? 'is-favorite' : ''} relative">
                    <i data-lucide="star" class="w-6 h-6 ${isFav ? 'fill-current' : ''}"></i>
                </button>
            </div>
            <h1 class="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-6">${sys.title}</h1>
            <div class="flex flex-wrap gap-2 mb-6">
                <span class="badge badge-${sys.difficulty}">${sys.difficulty}</span>
                ${sys.tags.map(tag => `<span class="badge badge-tag">${tag}</span>`).join('')}
                <span class="text-sm text-zinc-400"><i data-lucide="clock" class="w-4 h-4 inline"></i> ${sys.estimatedReadTime}</span>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div class="lg:col-span-2 prose max-w-none">
                <section><h2>The Problem</h2><p class="font-bold text-zinc-900 dark:text-white">${sys.adr.problem}</p></section>
                <section><h2>Engineering Context</h2><p>${sys.adr.context}</p></section>
                <section><h2>Proposed Decision</h2><p>${sys.adr.decision}</p></section>
                <section><h2>Implementation Logic</h2>${sys.adr.architecture}</section>
                
                ${relatedSystems.length > 0 ? `
                <section class="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <h2>Related Concepts</h2>
                    <div class="flex flex-wrap gap-3 not-prose">
                        ${relatedSystems.map(rel => `
                            <div class="related-chip" onclick="showDetail('${rel.id}')">
                                <i data-lucide="${rel.icon}" class="w-4 h-4"></i>
                                <span>${rel.title}</span>
                            </div>
                        `).join('')}
                    </div>
                </section>` : ''}
                
                ${sys.metadata.prerequisites && sys.metadata.prerequisites.length > 0 ? `
                <section class="mt-8">
                    <h2>Prerequisites</h2>
                    <div class="flex flex-wrap gap-3 not-prose">
                        ${sys.metadata.prerequisites.map(prereqId => {
                            const prereq = SYSTEMS.find(s => s.id === prereqId);
                            return prereq ? `
                                <div class="related-chip" onclick="showDetail('${prereq.id}')">
                                    <i data-lucide="${prereq.icon}" class="w-4 h-4"></i>
                                    <span>${prereq.title}</span>
                                </div>
                            ` : '';
                        }).join('')}
                    </div>
                </section>` : ''}
                
                ${sys.externalLinks ? `
                <section class="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <h2>Knowledge Base</h2>
                    <ul class="space-y-4">
                        ${sys.externalLinks.map(link => `
                            <li><a href="${link.url}" target="_blank" class="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-2">
                                <i data-lucide="external-link" class="w-4 h-4"></i> ${link.name}
                            </a></li>
                        `).join('')}
                    </ul>
                </section>` : ''}
                
                <section class="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <h2>📝 My Notes</h2>
                    <textarea 
                        id="userNotes" 
                        placeholder="Add your personal notes, insights, or gotchas here..."
                        class="w-full min-h-[150px] p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style="color: var(--text-primary);"
                        onblur="saveNotes('${id}')"
                    >${userNotes}</textarea>
                    <p class="text-xs text-zinc-400 mt-2">These notes are saved locally in your browser</p>
                </section>
            </div>
            <div class="space-y-8">
                <div class="bg-blue-600 rounded-2xl p-8 text-white shadow-xl">
                    <h4 class="text-blue-100 font-bold uppercase tracking-widest text-[10px] mb-6">Component Stack</h4>
                    <ul class="space-y-4 font-mono text-xs">${sys.stack.map(s => `<li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-blue-200"></i> ${s}</li>`).join('')}</ul>
                </div>
                <div class="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h4 class="font-bold uppercase tracking-widest text-[10px] mb-4">Verdict</h4>
                    <p class="text-sm italic leading-relaxed text-zinc-500 dark:text-zinc-400 pl-4 border-l-2 border-blue-600">${sys.adr.consequences}</p>
                </div>
                <div class="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h4 class="font-bold uppercase tracking-widest text-[10px] mb-4 text-zinc-600 dark:text-zinc-400">Metadata</h4>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-zinc-500 dark:text-zinc-400">Added</span>
                            <span class="font-medium">${sys.metadata.dateAdded}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-zinc-500 dark:text-zinc-400">Source</span>
                            <span class="font-medium text-right">${sys.metadata.source}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-zinc-500 dark:text-zinc-400">Difficulty</span>
                            <span class="badge badge-${sys.difficulty}">${sys.difficulty}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    catalog.classList.add('hidden');
    hero.classList.add('hidden');
    view.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    lucide.createIcons();
}

function toggleFavoriteDetail(id) {
    StorageManager.toggleFavorite(id);
    showDetail(id); // Re-render to update star
}

function saveNotes(id) {
    const notes = document.getElementById('userNotes').value;
    StorageManager.saveNotes(id, notes);
}

/**
 * Return to catalog view
 */
function showCatalog() {
    document.getElementById('detailView').classList.add('hidden');
    document.getElementById('catalogView').classList.remove('hidden');
    document.getElementById('catalogHero').classList.remove('hidden');
    lucide.createIcons();
}

/**
 * Load systems data from JSON file (optional for production with web server)
 * Falls back to embedded data for local development
 */
async function loadSystemsData() {
    // Try to load from external JSON if available (production with web server)
    try {
        const response = await fetch('./data/systems.json');
        if (response.ok) {
            SYSTEMS = await response.json();
        }
    } catch (error) {
        // Use embedded data (already loaded above) - this is expected for file:// protocol
        console.log('Using embedded systems data (local development mode)');
    }
    updateFilterCounts();
    renderSystems();
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Cmd+K or Ctrl+K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
    }
    
    // ESC to close search
    if (e.key === 'Escape') {
        const container = document.getElementById('searchContainer');
        if (container && !container.classList.contains('hidden')) {
            toggleSearch();
        }
    }
});

/**
 * Search input listener
 */
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
    }
});

/**
 * Initialize application
 */
window.addEventListener('DOMContentLoaded', () => {
    loadSystemsData();
});
