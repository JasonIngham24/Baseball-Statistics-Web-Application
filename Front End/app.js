/**
 * Baseball Statistics Manager - Frontend JavaScript
 * This file handles UI interactions and placeholder functionality.
 * Database integration will be added when the backend is connected.
 */

// ===== Global State =====
let selectedTeam = null;

// ===== Sample Team Data (placeholder for database) =====
const sampleTeamData = {
    1: {
        id: 1,
        name: 'New Paltz Hawks',
        level: 'Varsity Baseball',
        players: [
            { jersey: 1, name: 'John Smith', position: 'SS', year: 'Junior', bats: 'R', throws: 'R', status: 'active' },
            { jersey: 7, name: 'Mike Johnson', position: 'P', year: 'Senior', bats: 'L', throws: 'L', status: 'active' },
            { jersey: 24, name: 'David Williams', position: '1B', year: 'Sophomore', bats: 'L', throws: 'R', status: 'injured' }
        ],
        battingStats: [
            { player: 'John Smith', g: 42, ab: 168, r: 32, h: 54, doubles: 12, triples: 2, hr: 8, rbi: 35, bb: 22, so: 28, sb: 15, avg: '.321', obp: '.402', slg: '.542' },
            { player: 'Mike Johnson', g: 38, ab: 145, r: 25, h: 42, doubles: 8, triples: 1, hr: 5, rbi: 28, bb: 18, so: 35, sb: 8, avg: '.290', obp: '.365', slg: '.441' },
            { player: 'David Williams', g: 35, ab: 132, r: 22, h: 38, doubles: 10, triples: 0, hr: 12, rbi: 42, bb: 25, so: 30, sb: 2, avg: '.288', obp: '.385', slg: '.561' }
        ],
        teamAvg: '.285',
        teamERA: '3.42',
        fieldingPct: '.975',
        activePlayerCount: 25
    },
    2: {
        id: 2,
        name: 'Hudson Valley Tigers',
        level: 'Varsity Baseball',
        players: [
            { jersey: 5, name: 'Chris Martinez', position: 'CF', year: 'Senior', bats: 'R', throws: 'R', status: 'active' },
            { jersey: 12, name: 'Jake Thompson', position: 'P', year: 'Junior', bats: 'R', throws: 'R', status: 'active' },
            { jersey: 33, name: 'Ryan Lee', position: 'C', year: 'Sophomore', bats: 'R', throws: 'R', status: 'active' }
        ],
        battingStats: [
            { player: 'Chris Martinez', g: 40, ab: 155, r: 28, h: 48, doubles: 10, triples: 3, hr: 6, rbi: 32, bb: 20, so: 25, sb: 18, avg: '.310', obp: '.390', slg: '.510' },
            { player: 'Jake Thompson', g: 15, ab: 45, r: 5, h: 12, doubles: 2, triples: 0, hr: 1, rbi: 8, bb: 5, so: 15, sb: 0, avg: '.267', obp: '.340', slg: '.378' },
            { player: 'Ryan Lee', g: 38, ab: 140, r: 20, h: 42, doubles: 8, triples: 1, hr: 4, rbi: 28, bb: 15, so: 22, sb: 2, avg: '.300', obp: '.365', slg: '.443' }
        ],
        teamAvg: '.292',
        teamERA: '3.15',
        fieldingPct: '.982',
        activePlayerCount: 22
    },
    3: {
        id: 3,
        name: 'Kingston Knights',
        level: 'Varsity Baseball',
        players: [
            { jersey: 2, name: 'Alex Brown', position: '2B', year: 'Junior', bats: 'L', throws: 'R', status: 'active' },
            { jersey: 18, name: 'Sam Wilson', position: 'P', year: 'Senior', bats: 'R', throws: 'R', status: 'active' },
            { jersey: 44, name: 'Tom Garcia', position: 'RF', year: 'Freshman', bats: 'R', throws: 'R', status: 'active' }
        ],
        battingStats: [
            { player: 'Alex Brown', g: 38, ab: 150, r: 30, h: 50, doubles: 12, triples: 4, hr: 3, rbi: 25, bb: 24, so: 20, sb: 12, avg: '.333', obp: '.420', slg: '.493' },
            { player: 'Sam Wilson', g: 18, ab: 52, r: 6, h: 14, doubles: 3, triples: 0, hr: 2, rbi: 10, bb: 4, so: 18, sb: 0, avg: '.269', obp: '.321', slg: '.423' },
            { player: 'Tom Garcia', g: 30, ab: 110, r: 15, h: 30, doubles: 5, triples: 1, hr: 2, rbi: 18, bb: 10, so: 28, sb: 5, avg: '.273', obp: '.333', slg: '.382' }
        ],
        teamAvg: '.278',
        teamERA: '3.68',
        fieldingPct: '.968',
        activePlayerCount: 20
    }
};

// ===== DOM Content Loaded =====
document.addEventListener('DOMContentLoaded', function() {
    initTeamSelection();
    initNavigation();
    initTabs();
    initForms();
    initSearch();
    showDatabaseNotice();
});

// ===== Team Selection =====
function initTeamSelection() {
    const teamCards = document.querySelectorAll('.team-card:not(.add-team-card)');
    
    teamCards.forEach(card => {
        card.addEventListener('click', function() {
            const teamId = this.getAttribute('data-team-id');
            const teamName = this.getAttribute('data-team-name');
            selectTeam(teamId, teamName);
        });
    });

    // Add team form handling
    const addTeamForm = document.getElementById('addTeamForm');
    if (addTeamForm) {
        addTeamForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddTeam(this);
        });
    }
}

function selectTeam(teamId, teamName) {
    selectedTeam = {
        id: teamId,
        name: teamName
    };

    // Update team indicator
    const teamIndicator = document.getElementById('teamIndicator');
    if (teamIndicator) {
        teamIndicator.querySelector('.team-indicator-name').textContent = teamName;
    }

    // Hide team selection overlay
    const overlay = document.getElementById('teamSelectOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }

    // Show main app
    const mainApp = document.getElementById('mainAppContainer');
    if (mainApp) {
        mainApp.classList.remove('hidden');
    }

    // Load team-specific data
    loadTeamData(teamId);

    showToast(`Loaded ${teamName}`, 'success');
}

function changeTeam() {
    // Show team selection overlay
    const overlay = document.getElementById('teamSelectOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }

    // Hide main app
    const mainApp = document.getElementById('mainAppContainer');
    if (mainApp) {
        mainApp.classList.add('hidden');
    }

    // Reset to dashboard
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    navLinks.forEach(l => l.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    
    const dashboardLink = document.querySelector('[data-section="dashboard"]');
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardLink) dashboardLink.classList.add('active');
    if (dashboardSection) dashboardSection.classList.add('active');
}

function showAddTeamModal() {
    openModal('addTeamModal');
}

function handleAddTeam(form) {
    const teamName = document.getElementById('teamName').value;
    const teamLevel = document.getElementById('teamLevel').value;
    const teamSeason = document.getElementById('teamSeason').value;

    if (!teamName || !teamLevel || !teamSeason) {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    // Generate a new team ID (placeholder)
    const newTeamId = Date.now();

    // Add new team card to the grid
    const teamGrid = document.getElementById('teamSelectGrid');
    const addTeamCard = teamGrid.querySelector('.add-team-card');

    const newTeamCard = document.createElement('div');
    newTeamCard.className = 'team-card';
    newTeamCard.setAttribute('data-team-id', newTeamId);
    newTeamCard.setAttribute('data-team-name', teamName);
    newTeamCard.innerHTML = `
        <div class="team-card-icon"><i class="fa-solid fa-baseball"></i></div>
        <h3>${teamName}</h3>
        <p>${teamLevel} - ${teamSeason}</p>
    `;

    // Insert before the "Add Team" card
    teamGrid.insertBefore(newTeamCard, addTeamCard);

    // Add click event to new card
    newTeamCard.addEventListener('click', function() {
        selectTeam(newTeamId, teamName);
    });

    showToast(`Team "${teamName}" created! (Database pending)`, 'success');
    closeModal('addTeamModal');
    form.reset();
}

function loadTeamData(teamId) {
    const teamData = sampleTeamData[teamId];
    
    if (!teamData) {
        console.log('Team data not found, using defaults');
        return;
    }

    // Update dashboard stats
    updateDashboardStats(teamData);

    // Update players table
    updatePlayersTable(teamData.players);

    // Update batting stats table
    updateBattingTable(teamData.battingStats);

    // Update player dropdowns
    updatePlayerDropdowns(teamData.players);
}

function updateDashboardStats(teamData) {
    // Update stat cards
    const avgValue = document.querySelector('.stat-card:nth-child(1) .stat-value');
    const eraValue = document.querySelector('.stat-card:nth-child(2) .stat-value');
    const fldValue = document.querySelector('.stat-card:nth-child(3) .stat-value');
    const playersValue = document.querySelector('.stat-card:nth-child(4) .stat-value');

    if (avgValue) avgValue.textContent = teamData.teamAvg;
    if (eraValue) eraValue.textContent = teamData.teamERA;
    if (fldValue) fldValue.textContent = teamData.fieldingPct;
    if (playersValue) playersValue.textContent = teamData.activePlayerCount;
}

function updatePlayersTable(players) {
    const tableBody = document.getElementById('playersTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    players.forEach(player => {
        const statusClass = player.status === 'active' ? 'active' : 
                            player.status === 'injured' ? 'injured' : 'inactive';
        const statusText = capitalizeFirst(player.status);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.jersey}</td>
            <td>${player.name}</td>
            <td>${player.position}</td>
            <td>${player.year}</td>
            <td>${player.bats}/${player.throws}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="action-buttons">
                <button class="btn-icon-only" title="Edit">✏️</button>
                <button class="btn-icon-only" title="View Stats">📊</button>
                <button class="btn-icon-only danger" title="Delete" onclick="deletePlayerRow(this)">🗑️</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateBattingTable(battingStats) {
    const tableBody = document.getElementById('battingTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    battingStats.forEach(stat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stat.player}</td>
            <td>${stat.g}</td>
            <td>${stat.ab}</td>
            <td>${stat.r}</td>
            <td>${stat.h}</td>
            <td>${stat.doubles}</td>
            <td>${stat.triples}</td>
            <td>${stat.hr}</td>
            <td>${stat.rbi}</td>
            <td>${stat.bb}</td>
            <td>${stat.so}</td>
            <td>${stat.sb}</td>
            <td>${stat.avg}</td>
            <td>${stat.obp}</td>
            <td>${stat.slg}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updatePlayerDropdowns(players) {
    const dropdowns = [
        document.getElementById('battingPlayer'),
        document.getElementById('pitchingPlayer'),
        document.getElementById('fieldingPlayer')
    ];

    dropdowns.forEach(dropdown => {
        if (!dropdown) return;
        
        // Clear existing options except the first
        dropdown.innerHTML = '<option value="">Select Player</option>';
        
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.jersey;
            option.textContent = player.name;
            dropdown.appendChild(option);
        });
    });
}

// ===== Navigation Handling =====
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// ===== Tab Navigation =====
function initTabs() {
    const tabNavigations = document.querySelectorAll('.tab-navigation');
    
    tabNavigations.forEach(nav => {
        const tabBtns = nav.querySelectorAll('.tab-btn');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                const parentSection = this.closest('.section');
                
                // Remove active from all tabs in this navigation
                tabBtns.forEach(b => b.classList.remove('active'));
                
                // Remove active from all tab contents in this section
                const tabContents = parentSection.querySelectorAll('.tab-content');
                tabContents.forEach(tc => tc.classList.remove('active'));
                
                // Activate clicked tab and content
                this.classList.add('active');
                const targetContent = document.getElementById(tabId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    });
}

// ===== Form Handling =====
function initForms() {
    // Batting form
    const battingForm = document.getElementById('battingForm');
    if (battingForm) {
        battingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit('batting', this);
        });
    }

    // Pitching form
    const pitchingForm = document.getElementById('pitchingForm');
    if (pitchingForm) {
        pitchingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit('pitching', this);
        });
    }

    // Fielding form
    const fieldingForm = document.getElementById('fieldingForm');
    if (fieldingForm) {
        fieldingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit('fielding', this);
        });
    }

    // Add Player form
    const addPlayerForm = document.getElementById('addPlayerForm');
    if (addPlayerForm) {
        addPlayerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddPlayer(this);
        });
    }
}

// Handle form submissions (placeholder until database is connected)
function handleFormSubmit(type, form) {
    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value) {
            isValid = false;
            field.style.borderColor = '#dc3545';
        } else {
            field.style.borderColor = '';
        }
    });

    if (!isValid) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    // Collect form data (for future database integration)
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    console.log(`${type} statistics data:`, data);
    
    // Show success message (placeholder)
    showToast(`${capitalizeFirst(type)} statistics saved successfully! (Database pending)`, 'success');
    
    // Reset form after successful submission
    form.reset();
}

// Handle adding a new player
function handleAddPlayer(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value) {
            isValid = false;
            field.style.borderColor = '#dc3545';
        } else {
            field.style.borderColor = '';
        }
    });

    if (!isValid) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    // Collect player data
    const playerData = {
        jersey: document.getElementById('playerJersey').value,
        firstName: document.getElementById('playerFirst').value,
        lastName: document.getElementById('playerLast').value,
        position: document.getElementById('playerPosition').value,
        year: document.getElementById('playerYear').value,
        bats: document.getElementById('playerBats').value,
        throws: document.getElementById('playerThrows').value,
        status: document.getElementById('playerStatus').value
    };

    console.log('New player data:', playerData);

    // Add row to table (placeholder - will be replaced with database fetch)
    addPlayerToTable(playerData);

    showToast('Player added successfully! (Database pending)', 'success');
    closeModal('addPlayerModal');
    form.reset();
}

// Add player row to table (UI only - placeholder)
function addPlayerToTable(player) {
    const tableBody = document.getElementById('playersTableBody');
    if (!tableBody) return;

    const statusClass = player.status === 'active' ? 'active' : 
                        player.status === 'injured' ? 'injured' : 'inactive';
    const statusText = capitalizeFirst(player.status);

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${player.jersey}</td>
        <td>${player.firstName} ${player.lastName}</td>
        <td>${player.position}</td>
        <td>${player.year}</td>
        <td>${player.bats}/${player.throws}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td class="action-buttons">
            <button class="btn-icon-only" title="Edit">✏️</button>
            <button class="btn-icon-only" title="View Stats">📊</button>
            <button class="btn-icon-only danger" title="Delete" onclick="deletePlayerRow(this)">🗑️</button>
        </td>
    `;

    tableBody.insertBefore(newRow, tableBody.firstChild);
}

// Delete player row (UI only - placeholder)
function deletePlayerRow(button) {
    if (confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
        const row = button.closest('tr');
        row.style.transition = 'opacity 0.3s';
        row.style.opacity = '0';
        setTimeout(() => {
            row.remove();
            showToast('Player deleted. (Database pending)', 'success');
        }, 300);
    }
}

// Reset form fields
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        // Clear any validation styling
        form.querySelectorAll('input, select').forEach(field => {
            field.style.borderColor = '';
        });
        showToast('Form cleared.', 'success');
    }
}

// ===== Search Functionality =====
function initSearch() {
    const playerSearch = document.getElementById('playerSearch');
    if (playerSearch) {
        playerSearch.addEventListener('input', function() {
            filterPlayers(this.value.toLowerCase());
        });
    }
}

function filterPlayers(searchTerm) {
    const tableBody = document.getElementById('playersTableBody');
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const playerName = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const position = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        const jersey = row.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
        
        if (playerName.includes(searchTerm) || 
            position.includes(searchTerm) || 
            jersey.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// ===== Modal Functions =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            form.querySelectorAll('input, select').forEach(field => {
                field.style.borderColor = '';
            });
        }
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
    }
});

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    // Remove existing type classes
    toast.classList.remove('success', 'error', 'info');
    
    // Add appropriate type class
    if (type) {
        toast.classList.add(type);
    }
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== Database Notice =====
function showDatabaseNotice() {
    // This will show a console message about database status
    console.log('%c⚾ Baseball Statistics Manager', 'font-size: 20px; font-weight: bold; color: #1e3a5f;');
    console.log('%cFront-end loaded successfully. Awaiting database connection.', 'color: #17a2b8;');
    console.log('Sample data is currently displayed. Connect MySQL database to enable full functionality.');
}

// ===== Utility Functions =====
function capitalizeFirst(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// ===== Table Sorting (Placeholder) =====
// This will be enhanced when real data is loaded from the database
document.querySelectorAll('.data-table.sortable th').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', function() {
        showToast('Sorting will be available when database is connected.', 'info');
    });
});

// ===== Filter Change Handlers (Placeholder) =====
document.querySelectorAll('.filter-select').forEach(select => {
    select.addEventListener('change', function() {
        console.log(`Filter changed: ${this.id} = ${this.value}`);
        showToast('Filtering will be available when database is connected.', 'info');
    });
});

// ===== Statistics Calculation Helpers =====
// These functions will be used when real data is available

/**
 * Calculate batting average
 * @param {number} hits - Total hits
 * @param {number} atBats - Total at-bats
 * @returns {string} Batting average formatted as .XXX
 */
function calculateBattingAverage(hits, atBats) {
    if (atBats === 0) return '.000';
    const avg = hits / atBats;
    return avg.toFixed(3).substring(1); // Remove leading 0
}

/**
 * Calculate on-base percentage
 * @param {number} hits - Total hits
 * @param {number} walks - Total walks
 * @param {number} hbp - Hit by pitch
 * @param {number} atBats - Total at-bats
 * @param {number} sf - Sacrifice flies
 * @returns {string} OBP formatted as .XXX
 */
function calculateOBP(hits, walks, hbp, atBats, sf) {
    const denominator = atBats + walks + hbp + sf;
    if (denominator === 0) return '.000';
    const obp = (hits + walks + hbp) / denominator;
    return obp.toFixed(3).substring(1);
}

/**
 * Calculate slugging percentage
 * @param {number} singles - Total singles
 * @param {number} doubles - Total doubles
 * @param {number} triples - Total triples
 * @param {number} homeRuns - Total home runs
 * @param {number} atBats - Total at-bats
 * @returns {string} SLG formatted as .XXX
 */
function calculateSLG(singles, doubles, triples, homeRuns, atBats) {
    if (atBats === 0) return '.000';
    const totalBases = singles + (doubles * 2) + (triples * 3) + (homeRuns * 4);
    const slg = totalBases / atBats;
    return slg.toFixed(3);
}

/**
 * Calculate ERA (Earned Run Average)
 * @param {number} earnedRuns - Total earned runs
 * @param {number} inningsPitched - Total innings pitched
 * @returns {string} ERA formatted as X.XX
 */
function calculateERA(earnedRuns, inningsPitched) {
    if (inningsPitched === 0) return '0.00';
    const era = (earnedRuns * 9) / inningsPitched;
    return era.toFixed(2);
}

/**
 * Calculate WHIP (Walks + Hits per Inning Pitched)
 * @param {number} walks - Total walks
 * @param {number} hits - Total hits allowed
 * @param {number} inningsPitched - Total innings pitched
 * @returns {string} WHIP formatted as X.XX
 */
function calculateWHIP(walks, hits, inningsPitched) {
    if (inningsPitched === 0) return '0.00';
    const whip = (walks + hits) / inningsPitched;
    return whip.toFixed(2);
}

/**
 * Calculate fielding percentage
 * @param {number} putouts - Total putouts
 * @param {number} assists - Total assists
 * @param {number} errors - Total errors
 * @returns {string} Fielding percentage formatted as .XXX
 */
function calculateFieldingPct(putouts, assists, errors) {
    const totalChances = putouts + assists + errors;
    if (totalChances === 0) return '.000';
    const pct = (putouts + assists) / totalChances;
    return pct.toFixed(3).substring(1);
}

// ===== Export for future use =====
// When database is connected, these can be imported in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateBattingAverage,
        calculateOBP,
        calculateSLG,
        calculateERA,
        calculateWHIP,
        calculateFieldingPct
    };
}
