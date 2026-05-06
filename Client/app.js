/**
 * Baseball Statistics Manager - Frontend JavaScript
 * This file handles UI interactions and database-backed CRUD calls.
 */

// ===== Global State =====
let selectedTeam = null;
let selectedGameForStats = null;
const loadedTeamData = {};

async function apiRequest(path, options = {}) {
    const response = await fetch(`/api${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Request failed');
    }

    return response.status === 204 ? null : response.json();
}

function createTeamCardElement(team) {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.setAttribute('data-team-id', team.teamId);
    card.setAttribute('data-team-name', team.name);
    card.innerHTML = `
        <div class="team-card-icon"><i class="fa-solid fa-baseball"></i></div>
        <h3>${team.name}</h3>
        <p>${team.level} - ${team.season}</p>
    `;

    card.addEventListener('click', function() {
        selectTeam(String(team.teamId), team.name);
    });

    return card;
}

function getTeamGames(teamId) {
    return loadedTeamData[teamId]?.games || [];
}

// ===== DOM Content Loaded =====
document.addEventListener('DOMContentLoaded', function() {
    initTeamSelection();
    initNavigation();
    initTabs();
    initForms();
    initSearch();
    initGameStatsToggles();
    showDatabaseNotice();
    initHamburgerMenu();
    loadTeamCardsFromDatabase();
});

async function loadTeamCardsFromDatabase() {
    const teamGrid = document.getElementById('teamSelectGrid');
    if (!teamGrid) return;

    const addTeamCard = teamGrid.querySelector('.add-team-card');

    try {
        const teams = await apiRequest('/teams');
        teamGrid.innerHTML = '';
        if (Array.isArray(teams) && teams.length > 0) {
            teams.forEach(team => {
                teamGrid.appendChild(createTeamCardElement(team));
            });
        }

        if (addTeamCard) {
            teamGrid.appendChild(addTeamCard);
        }
    } catch (error) {
        console.error('Failed to load teams from API.', error);
        showToast('Failed to load teams. Check server/database connection.', 'error');
    }
}

// ===== Hamburger Menu =====
function initHamburgerMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-open');
            const isOpen = mainNav.classList.contains('mobile-open');
            hamburgerBtn.innerHTML = isOpen ? '<i class="fa-solid fa-times"></i>' : '<i class="fa-solid fa-bars"></i>';
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('mobile-open')) {
                mainNav.classList.remove('mobile-open');
                hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                document.body.style.overflow = '';
            }
        });
    });
}

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
    selectedTeam = null;
    selectedGameForStats = null;

    // Show team selection overlay
    const overlay = document.getElementById('teamSelectOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }

    const teamIndicator = document.getElementById('teamIndicator');
    if (teamIndicator) {
        const nameNode = teamIndicator.querySelector('.team-indicator-name');
        if (nameNode) {
            nameNode.textContent = 'No Team Selected';
        }
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

function openDeleteTeamModal() {
    if (!selectedTeam?.id || !selectedTeam?.name) {
        showToast('Please select a team first.', 'error');
        return;
    }

    const teamName = document.getElementById('deleteTeamName');
    if (teamName) {
        teamName.textContent = selectedTeam.name;
    }

    const deleteButton = document.getElementById('confirmDeleteTeamButton');
    if (deleteButton) {
        deleteButton.setAttribute('data-team-id', selectedTeam.id);
    }

    openModal('deleteTeamModal');
}

async function confirmDeleteTeam() {
    if (!selectedTeam?.id) {
        showToast('Please select a team first.', 'error');
        return;
    }

    const teamId = selectedTeam.id;
    const teamName = selectedTeam.name;

    try {
        await apiRequest(`/teams/${teamId}`, { method: 'DELETE' });

        delete loadedTeamData[teamId];
        selectedTeam = null;
        selectedGameForStats = null;

        closeModal('deleteTeamModal');
        changeTeam();
        await loadTeamCardsFromDatabase();

        showToast(`Team "${teamName}" deleted.`, 'success');
    } catch (error) {
        showToast(error.message || 'Failed to delete team.', 'error');
    }
}

async function handleAddTeam(form) {
    const teamName = document.getElementById('teamName').value;
    const teamLevel = document.getElementById('teamLevel').value;
    const teamSeason = document.getElementById('teamSeason').value;

    if (!teamName || !teamLevel || !teamSeason) {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    try {
        const createdTeam = await apiRequest('/teams', {
            method: 'POST',
            body: JSON.stringify({
                name: teamName,
                level: teamLevel,
                season: teamSeason
            })
        });

        const teamGrid = document.getElementById('teamSelectGrid');
        const addTeamCard = teamGrid ? teamGrid.querySelector('.add-team-card') : null;
        const newTeamCard = createTeamCardElement(createdTeam);

        if (teamGrid) {
            if (addTeamCard) {
                teamGrid.insertBefore(newTeamCard, addTeamCard);
            } else {
                teamGrid.appendChild(newTeamCard);
            }
        }

        showToast(`Team "${teamName}" created!`, 'success');
        closeModal('addTeamModal');
        form.reset();
    } catch (error) {
        showToast(error.message || 'Failed to create team.', 'error');
    }
}

async function loadTeamData(teamId) {
    try {
        const [response, fieldingStats] = await Promise.all([
            apiRequest(`/teams/${teamId}/summary`),
            apiRequest(`/teams/${teamId}/fielding`)
        ]);
        const teamData = {
            id: response.team.teamId,
            name: response.team.name,
            level: response.team.level,
            season: response.team.season,
            players: response.players || [],
            battingStats: response.battingStats || [],
            pitchingStats: response.pitchingStats || [],
            fieldingStats: fieldingStats || response.fieldingStats || [],
            games: response.games || [],
            teamAvg: response.summary?.teamAvg || '.000',
            teamERA: response.summary?.teamERA || '0.00',
            fieldingPct: response.summary?.fieldingPct || '.000',
            activePlayerCount: response.summary?.activePlayerCount || 0
        };

        loadedTeamData[teamId] = teamData;

        updateDashboardStats(teamData);
        updateDashboardLeaders(teamData);
        updatePlayersTable(teamData.players);
        updateBattingTable(teamData.battingStats);
        updatePitchingTable(teamData.pitchingStats);
        updateFieldingTable(teamData.fieldingStats);
        updateStatsPlayerDropdown(teamData.players);
        updateGamesTable(teamId);
        updateGameDropdowns(teamId);
    } catch (error) {
        console.error('Failed to load selected team data.', error);
        showToast(error.message || 'Failed to load team data.', 'error');
    }
}


function updateDashboardLeaders(teamData) {
    const topBattersBody = document.getElementById('topBattersTableBody');
    const topPitchersBody = document.getElementById('topPitchersTableBody');

    if (topBattersBody) {
        const topBatters = [...(teamData.battingStats || [])]
            .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg))
            .slice(0, 3);

        topBattersBody.innerHTML = '';

        if (topBatters.length === 0) {
            topBattersBody.innerHTML = '<tr><td colspan="4">No batting data available.</td></tr>';
        } else {
            topBatters.forEach(batter => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${batter.player}</td>
                    <td>${batter.avg}</td>
                    <td>${batter.hr}</td>
                    <td>${batter.rbi}</td>
                `;
                topBattersBody.appendChild(row);
            });
        }
    }

    if (topPitchersBody) {
        const topPitchers = [...(teamData.pitchingStats || [])]
            .sort((a, b) => parseFloat(a.era) - parseFloat(b.era))
            .slice(0, 3);

        topPitchersBody.innerHTML = '';

        if (topPitchers.length === 0) {
            topPitchersBody.innerHTML = '<tr><td colspan="4">No pitching data available.</td></tr>';
        } else {
            topPitchers.forEach(pitcher => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${pitcher.player}</td>
                    <td>${pitcher.era}</td>
                    <td>${pitcher.wl}</td>
                    <td>${pitcher.k}</td>
                `;
                topPitchersBody.appendChild(row);
            });
        }
    }
}

function updateDashboardStats(teamData) {
    const avgValue = document.getElementById('dashboardTeamAvg');
    const eraValue = document.getElementById('dashboardTeamERA');
    const fldValue = document.getElementById('dashboardFieldingPct');
    const playersValue = document.getElementById('dashboardActivePlayers');

    if (avgValue) avgValue.textContent = teamData.teamAvg || '.000';
    if (eraValue) eraValue.textContent = teamData.teamERA || '0.00';
    if (fldValue) fldValue.textContent = teamData.fieldingPct || '.000';
    if (playersValue) {
        const activePlayers = Array.isArray(teamData.players)
            ? teamData.players.filter(player => player.status === 'active').length
            : 0;
        playersValue.textContent = activePlayers;
    }
}

function updatePlayersTable(players) {
    const tableBody = document.getElementById('playersTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    players.forEach(player => {
        const statusClass = player.status === 'active' ? 'active' : 
                            player.status === 'injured' ? 'injured' : 'inactive';
        const statusText = capitalizeFirst(player.status);
        const playerId = player.playerId || player.jersey;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.jersey}</td>
            <td>${player.name}</td>
            <td>${player.position}</td>
            <td>${player.year}</td>
            <td>${player.bats}/${player.throws}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="action-buttons">
                <button class="btn-icon-only" title="Edit" onclick="editPlayer(${playerId})">✏️</button>
                <button class="btn-icon-only" title="View Stats">📊</button>
                <button class="btn-icon-only danger" title="Delete" onclick="deletePlayer(${playerId}, this)">🗑️</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateBattingTable(battingStats) {
    const tableBody = document.getElementById('battingTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!Array.isArray(battingStats) || battingStats.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="15" style="text-align: center; padding: 30px; color: var(--text-secondary);">No batting data available.</td></tr>';
        return;
    }

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

function updatePitchingTable(pitchingStats) {
    const tableBody = document.getElementById('pitchingTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!Array.isArray(pitchingStats) || pitchingStats.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="14" style="text-align: center; padding: 30px; color: var(--text-secondary);">No pitching data available.</td></tr>';
        return;
    }

    pitchingStats.forEach(stat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stat.player}</td>
            <td>${stat.wins ?? 0}</td>
            <td>${stat.losses ?? 0}</td>
            <td>${stat.era}</td>
            <td>${stat.g ?? 0}</td>
            <td>${stat.gs ?? 0}</td>
            <td>${stat.sv ?? 0}</td>
            <td>${formatInningsPitched(stat.ip)}</td>
            <td>${stat.h ?? 0}</td>
            <td>${stat.r ?? 0}</td>
            <td>${stat.er ?? 0}</td>
            <td>${stat.bb ?? 0}</td>
            <td>${stat.so ?? stat.k ?? 0}</td>
            <td>${stat.whip}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateFieldingTable(fieldingStats) {
    const tableBody = document.getElementById('fieldingTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!Array.isArray(fieldingStats) || fieldingStats.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 30px; color: var(--text-secondary);">No fielding data available.</td></tr>';
        return;
    }

    fieldingStats.forEach(stat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stat.player}</td>
            <td>${stat.position || '—'}</td>
            <td>${stat.g ?? 0}</td>
            <td>${stat.tc ?? 0}</td>
            <td>${stat.po ?? 0}</td>
            <td>${stat.a ?? 0}</td>
            <td>${stat.e ?? 0}</td>
            <td>${stat.dp ?? 0}</td>
            <td>${stat.fldPct || '.000'}</td>
            <td>${stat.pb ?? 0}</td>
        `;
        tableBody.appendChild(row);
    });
}

function formatInningsPitched(innings) {
    const value = Number.parseFloat(innings);
    if (!Number.isFinite(value)) {
        return '0.0';
    }

    return value.toFixed(1);
}

function updatePlayerDropdowns(players) {
    const dropdowns = [
        document.getElementById('battingPlayer'),
        document.getElementById('pitchingPlayer'),
        document.getElementById('fieldingPlayer'),
        document.getElementById('playerCardSelect')
    ];

    dropdowns.forEach(dropdown => {
        if (!dropdown) return;
        
        // Clear existing options except the first
        dropdown.innerHTML = '<option value="">Select Player</option>';
        
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.playerId;
            option.textContent = player.name;
            dropdown.appendChild(option);
        });
    });
}

// Update the stats player dropdown in game stats entry
function updateStatsPlayerDropdown(players) {
    const dropdown = document.getElementById('statsPlayer');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">-- Select Player --</option>';
    
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.playerId;
        option.textContent = `#${player.jersey} ${player.name} (${player.position})`;
        dropdown.appendChild(option);
    });
}

// Update games table with team-specific games
function updateGamesTable(teamId) {
    const tableBody = document.getElementById('gamesTableBody');
    if (!tableBody) return;

    const allGames = getTeamGames(teamId);
    const typeFilter = document.getElementById('gamesTypeFilter').value;

    let filteredGames = allGames;

    if (typeFilter !== 'all') {
        filteredGames = allGames.filter(game => game.location.toLowerCase() === typeFilter);
    }

    tableBody.innerHTML = '';

    if (filteredGames.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-secondary);">No matching game data available.</td></tr>';
        return;
    }

    filteredGames.forEach(game => {
        const resultClass = game.result === 'W' ? 'win' : game.result === 'L' ? 'loss' : 'tie';
        const row = document.createElement('tr');
        const gameId = game.gameId || game.id;
        row.innerHTML = `
            <td>${game.date}</td>
            <td>${game.opponent}</td>
            <td>${game.location}</td>
            <td><span class="result-badge ${resultClass}">${game.result}</span></td>
            <td>${game.teamScore} - ${game.opponentScore}</td>
            <td class="action-buttons">
                <button class="btn-icon-only" title="View Details" onclick="viewGameDetails(${gameId})">📊</button>
                <button class="btn-icon-only" title="Edit" onclick="editGame(${gameId})">✏️</button>
                <button class="btn-icon-only danger" title="Delete" onclick="deleteGame(${gameId})">🗑️</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update game dropdowns in the enter stats section
function updateGameDropdowns(teamId) {
    const dropdown = document.getElementById('selectGameForStats');
    if (!dropdown) return;
    
    const games = getTeamGames(teamId);
    
    dropdown.innerHTML = '<option value="">-- Select a Game --</option>';
    
    games.forEach(game => {
        const option = document.createElement('option');
        option.value = game.gameId || game.id;
        option.textContent = `${game.date} vs ${game.opponent} (${game.result} ${game.teamScore}-${game.opponentScore})`;
        dropdown.appendChild(option);
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
    // Add Game form
    const addGameForm = document.getElementById('addGameForm');
    if (addGameForm) {
        addGameForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddGame(this);
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

// Handle adding a new game
// Handle adding a new game
async function handleAddGame(form) {
    if (!selectedTeam || !selectedTeam.id) {
        showToast('Please select a team first.', 'error');
        return;
    }

    const gameDate = document.getElementById('gameDate').value;
    const opponentTeamName = document.getElementById('gameOpponent').value?.trim();
    const gameLocation = document.getElementById('gameLocation').value;
    const teamScore = document.getElementById('teamScore').value || '0';
    const opponentScore = document.getElementById('opponentScore').value || '0';

    if (!gameDate || !opponentTeamName) {
        showToast('Please fill in required fields.', 'error');
        return;
    }

    try {
        const selectedTeamId = Number(selectedTeam.id);
        const selectedTeamName = selectedTeam.name;
        const isAwayGame = gameLocation === 'Away';
        const homeScore = isAwayGame ? parseInt(opponentScore, 10) : parseInt(teamScore, 10);
        const awayScore = isAwayGame ? parseInt(teamScore, 10) : parseInt(opponentScore, 10);

        let homeTeamId = selectedTeamId;
        let awayTeamId = opponentTeamName;

        if (isAwayGame) {
            // For away games, try to find the opponent team to get its ID for HomeTeamID
            const teams = await apiRequest('/teams');
            const opponentTeam = teams.find(t => 
                t.name.toLowerCase() === opponentTeamName.toLowerCase()
            );
            
            if (!opponentTeam) {
                showToast(`Opponent team "${opponentTeamName}" not found in system. Please check the spelling.`, 'error');
                return;
            }
            
            homeTeamId = opponentTeam.teamId;
            awayTeamId = selectedTeamName;
        }

        await apiRequest('/games', {
            method: 'POST',
            body: JSON.stringify({
                gameDate,
                gameLocation,
                homeScore,
                awayScore,
                homeTeamId,
                awayTeamId
            })
        });

        await loadTeamData(selectedTeam.id);
        showToast('Game added successfully!', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to create game.', 'error');
        return;
    }

    form.reset();

    // Switch to games list tab
    const gamesListBtn = document.querySelector('[data-tab="gamesList"]');
    if (gamesListBtn) gamesListBtn.click();
}

// Handle adding a new player
async function handleAddPlayer(form) {
    if (!selectedTeam || !selectedTeam.id) {
        showToast('Please select a team first.', 'error');
        return;
    }

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

    try {
        await apiRequest('/players', {
            method: 'POST',
            body: JSON.stringify({
                teamId: Number(selectedTeam.id),
                jerseyNumber: document.getElementById('playerJersey').value,
                firstName: document.getElementById('playerFirst').value,
                lastName: document.getElementById('playerLast').value,
                email: document.getElementById('playerEmail').value,
                position: document.getElementById('playerPosition').value,
                playerYear: document.getElementById('playerYear').value,
                batStance: document.getElementById('playerBats').value,
                throwStance: document.getElementById('playerThrows').value,
                playerStatus: document.getElementById('playerStatus').value
            })
        });

        await loadTeamData(selectedTeam.id);
        showToast('Player added successfully!', 'success');
        closeModal('addPlayerModal');
        form.reset();
    } catch (error) {
        showToast(error.message || 'Failed to add player.', 'error');
    }
}

async function deletePlayer(playerId, button) {
    if (!confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
        return;
    }

    try {
        await apiRequest(`/players/${playerId}`, { method: 'DELETE' });
        const row = button.closest('tr');
        if (row) {
            row.style.transition = 'opacity 0.3s';
            row.style.opacity = '0';
            setTimeout(() => row.remove(), 300);
        }

        if (selectedTeam?.id) {
            await loadTeamData(selectedTeam.id);
        }

        showToast('Player deleted.', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to delete player.', 'error');
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
            filterTable(this.value.toLowerCase(), 'playersTableBody');
        });
    }

    const battingPlayerSearch = document.getElementById('battingPlayerSearch');
    if (battingPlayerSearch) {
        battingPlayerSearch.addEventListener('input', function() {
            filterTable(this.value.toLowerCase(), 'battingTableBody');
        });
    }

    const pitchingPlayerSearch = document.getElementById('pitchingPlayerSearch');
    if (pitchingPlayerSearch) {
        pitchingPlayerSearch.addEventListener('input', function() {
            filterTable(this.value.toLowerCase(), 'pitchingTableBody');
        });
    }

    const fieldingPlayerSearch = document.getElementById('fieldingPlayerSearch');
    if (fieldingPlayerSearch) {
        fieldingPlayerSearch.addEventListener('input', function() {
            filterFieldingTable();
        });
    }

    const positionFilter = document.getElementById('positionFilter');
    if (positionFilter) {
        positionFilter.addEventListener('change', function() {
            filterFieldingTable();
        });
    }

    const gamesTypeFilter = document.getElementById('gamesTypeFilter');
    if (gamesTypeFilter) {
        gamesTypeFilter.addEventListener('change', () => {
            if (selectedTeam) {
                updateGamesTable(selectedTeam.id);
            }
        });
    }
}

function filterFieldingTable() {
    const searchTerm = document.getElementById('fieldingPlayerSearch').value.toLowerCase();
    const positionFilter = document.getElementById('positionFilter').value;
    const tableBody = document.getElementById('fieldingTableBody');
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const playerNameCell = row.querySelector('td:nth-child(1)');
        const positionCell = row.querySelector('td:nth-child(2)');
        if (!playerNameCell || !positionCell) return;

        const playerName = playerNameCell.textContent.toLowerCase();
        const position = positionCell.textContent;

        const nameMatch = playerName.includes(searchTerm);
        const positionMatch = (positionFilter === 'all') || (position === positionFilter);

        if (nameMatch && positionMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterTable(searchTerm, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const firstCell = row.querySelector('td:first-child');
        if (!firstCell) return;

        const cellText = firstCell.textContent.toLowerCase();
        
        if (cellText.includes(searchTerm)) {
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

// ===== Game Stats Entry Functions =====
function initGameStatsToggles() {
    // Toggle batting stats visibility
    const playerBatted = document.getElementById('playerBatted');
    if (playerBatted) {
        playerBatted.addEventListener('change', function() {
            const battingFields = document.getElementById('battingStatsFields');
            if (battingFields) {
                battingFields.style.display = this.checked ? 'block' : 'none';
            }
        });
    }

    // Toggle pitching stats visibility
    const playerPitched = document.getElementById('playerPitched');
    if (playerPitched) {
        playerPitched.addEventListener('change', function() {
            const pitchingFields = document.getElementById('pitchingStatsFields');
            if (pitchingFields) {
                pitchingFields.style.display = this.checked ? 'block' : 'none';
            }
        });
    }

    // Toggle fielding stats visibility
    const playerFielded = document.getElementById('playerFielded');
    if (playerFielded) {
        playerFielded.addEventListener('change', function() {
            const fieldingFields = document.getElementById('fieldingStatsFields');
            if (fieldingFields) {
                fieldingFields.style.display = this.checked ? 'block' : 'none';
            }
        });
    }

    // Show/hide catcher fields based on position
    const positionSelect = document.getElementById('gs_pos');
    if (positionSelect) {
        positionSelect.addEventListener('change', function() {
            const catcherFields = document.getElementById('catcherFields');
            if (catcherFields) {
                catcherFields.style.display = this.value === 'C' ? 'flex' : 'none';
            }
        });
    }
}

// Load game for entering stats
function loadGameForStats(gameId) {
    selectedGameForStats = gameId;
    
    const gameStatsForm = document.getElementById('gameStatsForm');
    if (!gameStatsForm) return;
    
    if (!gameId) {
        gameStatsForm.style.display = 'none';
        return;
    }
    
    gameStatsForm.style.display = 'block';
    clearGameStatsForm();
    
    showToast('Game selected. Choose a player to enter their stats.', 'info');
}

async function loadPlayerGameStats() {
    const playerId = document.getElementById('statsPlayer').value;
    
    if (!playerId) {
        showToast('Please select a player first.', 'error');
        return;
    }
    
    if (!selectedGameForStats) {
        showToast('Please select a game first.', 'error');
        return;
    }
    
    try {
        const payload = await apiRequest(`/games/${selectedGameForStats}/stats/${playerId}`);

        if (!payload?.batting && !payload?.pitching && !payload?.fielding && !payload?.catching) {
            showToast('No existing stats found for this player in this game.', 'info');
            clearGameStatsForm();
            return;
        }

        clearGameStatsForm();

        if (payload.batting) {
            document.getElementById('playerBatted').checked = true;
            document.getElementById('battingStatsFields').style.display = 'block';
            document.getElementById('gs_ab').value = payload.batting.AtBats ?? 0;
            document.getElementById('gs_r').value = payload.batting.Runs ?? 0;
            document.getElementById('gs_h').value = payload.batting.Hits ?? 0;
            document.getElementById('gs_2b').value = payload.batting.Doubles ?? 0;
            document.getElementById('gs_3b').value = payload.batting.Triples ?? 0;
            document.getElementById('gs_hr').value = payload.batting.HomeRuns ?? 0;
            document.getElementById('gs_rbi').value = payload.batting.RBIs ?? 0;
            document.getElementById('gs_bb').value = payload.batting.Walks ?? 0;
            document.getElementById('gs_so').value = payload.batting.Strikeouts ?? 0;
            document.getElementById('gs_sb').value = payload.batting.StolenBases ?? 0;
            document.getElementById('gs_hbp').value = payload.batting.HitByPitch ?? 0;
            document.getElementById('gs_sac').value = payload.batting.Sacrifice ?? 0;
        } else {
            document.getElementById('playerBatted').checked = false;
            document.getElementById('battingStatsFields').style.display = 'none';
        }

        if (payload.pitching) {
            document.getElementById('playerPitched').checked = true;
            document.getElementById('pitchingStatsFields').style.display = 'block';
            document.getElementById('gs_ip').value = payload.pitching.InningsPitched ?? '0';
            document.getElementById('gs_p_h').value = payload.pitching.HitsAllowed ?? 0;
            document.getElementById('gs_p_r').value = payload.pitching.RunsAllowed ?? 0;
            document.getElementById('gs_er').value = payload.pitching.EarnedRuns ?? 0;
            document.getElementById('gs_p_bb').value = payload.pitching.WalksAllowed ?? 0;
            document.getElementById('gs_k').value = payload.pitching.Strikeouts ?? 0;
            document.getElementById('gs_p_hr').value = payload.pitching.HomeRunsAllowed ?? 0;
            document.getElementById('gs_pitches').value = payload.pitching.PitchCount ?? 0;
            document.getElementById('gs_strikes').value = payload.pitching.Strikes ?? 0;
            document.getElementById('gs_decision').value = payload.pitching.Decision || '';
            document.getElementById('gs_gs').value = payload.pitching.PitcherStarted ? '1' : '0';
        } else {
            document.getElementById('playerPitched').checked = false;
            document.getElementById('pitchingStatsFields').style.display = 'none';
        }

        if (payload.fielding) {
            document.getElementById('playerFielded').checked = true;
            document.getElementById('fieldingStatsFields').style.display = 'block';
            document.getElementById('gs_pos').value = payload.fielding.Position || '';
            document.getElementById('gs_po').value = payload.fielding.Putouts ?? 0;
            document.getElementById('gs_a').value = payload.fielding.Assists ?? 0;
            document.getElementById('gs_e').value = payload.fielding.Errors ?? 0;
            document.getElementById('gs_dp').value = payload.fielding.DoublePlays ?? 0;

            if ((payload.fielding.Position || '') === 'C') {
                document.getElementById('catcherFields').style.display = 'flex';
                document.getElementById('gs_pb').value = payload.catching?.PassedBalls ?? 0;
                document.getElementById('gs_sba').value = payload.catching?.StolenBasesAllowed ?? 0;
                document.getElementById('gs_cs').value = payload.catching?.CaughtStealing ?? 0;
            }
        } else {
            document.getElementById('playerFielded').checked = false;
            document.getElementById('fieldingStatsFields').style.display = 'none';
        }

        showToast('Loaded existing stats.', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to load player stats for this game.', 'error');
    }
}

// Save player game stats
async function savePlayerGameStats() {
    const playerId = document.getElementById('statsPlayer').value;
    
    if (!playerId) {
        showToast('Please select a player.', 'error');
        return;
    }
    
    if (!selectedGameForStats) {
        showToast('Please select a game first.', 'error');
        return;
    }
    
    // Collect all stats data
    const statsData = {
        gameId: selectedGameForStats,
        playerId: playerId,
        batting: null,
        pitching: null,
        fielding: null
    };
    
    // Batting stats
    const playerBatted = document.getElementById('playerBatted');
    if (playerBatted && playerBatted.checked) {
        statsData.batting = {
            ab: document.getElementById('gs_ab').value || 0,
            r: document.getElementById('gs_r').value || 0,
            h: document.getElementById('gs_h').value || 0,
            doubles: document.getElementById('gs_2b').value || 0,
            triples: document.getElementById('gs_3b').value || 0,
            hr: document.getElementById('gs_hr').value || 0,
            rbi: document.getElementById('gs_rbi').value || 0,
            bb: document.getElementById('gs_bb').value || 0,
            so: document.getElementById('gs_so').value || 0,
            sb: document.getElementById('gs_sb').value || 0,
            hbp: document.getElementById('gs_hbp').value || 0,
            sac: document.getElementById('gs_sac').value || 0
        };

        statsData.batting.avg = calculateBattingAverage(
            Number(statsData.batting.h),
            Number(statsData.batting.ab)
        );
        statsData.batting.obp = calculateOBP(
            Number(statsData.batting.h),
            Number(statsData.batting.bb),
            Number(statsData.batting.hbp),
            Number(statsData.batting.ab),
            Number(statsData.batting.sac)
        );
        statsData.batting.slg = calculateSLG(
            Number(statsData.batting.h),
            Number(statsData.batting.doubles),
            Number(statsData.batting.triples),
            Number(statsData.batting.hr),
            Number(statsData.batting.ab)
        );
    }
    
    // Pitching stats
    const playerPitched = document.getElementById('playerPitched');
    if (playerPitched && playerPitched.checked) {
        statsData.pitching = {
            ip: document.getElementById('gs_ip').value || '0',
            h: document.getElementById('gs_p_h').value || 0,
            r: document.getElementById('gs_p_r').value || 0,
            er: document.getElementById('gs_er').value || 0,
            bb: document.getElementById('gs_p_bb').value || 0,
            k: document.getElementById('gs_k').value || 0,
            hr: document.getElementById('gs_p_hr').value || 0,
            pitches: document.getElementById('gs_pitches').value || 0,
            strikes: document.getElementById('gs_strikes').value || 0,
            decision: document.getElementById('gs_decision').value || '',
            gs: document.getElementById('gs_gs').value || '0'
        };

        const innings = Number.parseFloat(statsData.pitching.ip) || 0;
        const hitsAllowed = Number(statsData.pitching.h);
        const walksAllowed = Number(statsData.pitching.bb);
        statsData.pitching.balls = 0;
        statsData.pitching.whip = innings ? ((hitsAllowed + walksAllowed) / innings).toFixed(3) : '0.000';
    }
    
    // Fielding stats
    const playerFielded = document.getElementById('playerFielded');
    if (playerFielded && playerFielded.checked) {
        statsData.fielding = {
            pos: document.getElementById('gs_pos').value || '',
            po: document.getElementById('gs_po').value || 0,
            a: document.getElementById('gs_a').value || 0,
            e: document.getElementById('gs_e').value || 0,
            dp: document.getElementById('gs_dp').value || 0,
            pb: document.getElementById('gs_pb').value || 0,
            sba: document.getElementById('gs_sba').value || 0,
            cs: document.getElementById('gs_cs').value || 0
        };

        const putouts = Number(statsData.fielding.po);
        const assists = Number(statsData.fielding.a);
        const errors = Number(statsData.fielding.e);
        const denominator = putouts + assists + errors;
        statsData.fielding.fp = denominator ? ((putouts + assists) / denominator).toFixed(3) : '1.000';
    }
    
    try {
        await apiRequest(`/games/${selectedGameForStats}/stats`, {
            method: 'POST',
            body: JSON.stringify(statsData)
        });

        await loadTeamData(selectedTeam.id);
        showToast('Player stats saved successfully!', 'success');

        // Clear form for next player
        clearGameStatsForm();
        document.getElementById('statsPlayer').value = '';
    } catch (error) {
        showToast(error.message || 'Failed to save player stats.', 'error');
    }
}

// Clear game stats form
function clearGameStatsForm() {
    // Reset batting fields
    const battingFields = ['gs_ab', 'gs_r', 'gs_h', 'gs_2b', 'gs_3b', 'gs_hr', 'gs_rbi', 'gs_bb', 'gs_so', 'gs_sb', 'gs_hbp', 'gs_sac'];
    battingFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '0';
    });
    
    // Reset pitching fields
    const pitchingFields = ['gs_p_h', 'gs_p_r', 'gs_er', 'gs_p_bb', 'gs_k', 'gs_p_hr', 'gs_pitches', 'gs_strikes'];
    pitchingFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '0';
    });
    document.getElementById('gs_ip') && (document.getElementById('gs_ip').value = '');
    document.getElementById('gs_decision') && (document.getElementById('gs_decision').value = '');
    document.getElementById('gs_gs') && (document.getElementById('gs_gs').value = '0');
    
    // Reset fielding fields
    const fieldingFields = ['gs_po', 'gs_a', 'gs_e', 'gs_dp', 'gs_pb', 'gs_sba', 'gs_cs'];
    fieldingFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '0';
    });
    document.getElementById('gs_pos') && (document.getElementById('gs_pos').value = '');
    
    // Reset checkboxes to defaults
    const playerBatted = document.getElementById('playerBatted');
    const playerPitched = document.getElementById('playerPitched');
    const playerFielded = document.getElementById('playerFielded');
    
    if (playerBatted) playerBatted.checked = true;
    if (playerPitched) playerPitched.checked = false;
    if (playerFielded) playerFielded.checked = true;
    
    // Reset visibility
    const battingStatsFields = document.getElementById('battingStatsFields');
    const pitchingStatsFields = document.getElementById('pitchingStatsFields');
    const fieldingStatsFields = document.getElementById('fieldingStatsFields');
    const catcherFields = document.getElementById('catcherFields');
    
    if (battingStatsFields) battingStatsFields.style.display = 'block';
    if (pitchingStatsFields) pitchingStatsFields.style.display = 'none';
    if (fieldingStatsFields) fieldingStatsFields.style.display = 'block';
    if (catcherFields) catcherFields.style.display = 'none';
}

async function openPrintableRosterReport() {
    if (!selectedTeam?.id) {
        showToast('Please select a team first.', 'error');
        return;
    }

    try {
        const rosterData = await apiRequest(`/teams/${selectedTeam.id}/roster`);
        const { teamName, season, players } = rosterData;

        const teamNameEl = document.getElementById('printableRosterTeamName');
        if (teamNameEl) {
            teamNameEl.textContent = `${teamName} (${season}) - Roster`;
        }

        const contentEl = document.getElementById('printableRosterContent');
        if (!contentEl) return;

        if (!players || players.length === 0) {
            contentEl.innerHTML = '<p>No active players found for this team.</p>';
            openModal('printableRosterModal');
            return;
        }

        const table = document.createElement('table');
        table.className = 'data-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Year</th>
                    <th>B/T</th>
                </tr>
            </thead>
            <tbody>
                ${players.map(p => `
                    <tr>
                        <td>${p.jersey || '—'}</td>
                        <td>${p.name}</td>
                        <td>${p.position || '—'}</td>
                        <td>${p.year || '—'}</td>
                        <td>${p.bats}/${p.throws}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        contentEl.innerHTML = '';
        contentEl.appendChild(table);

        openModal('printableRosterModal');
    } catch (error) {
        showToast(error.message || 'Failed to generate printable roster.', 'error');
    }
}

function viewGameDetails(gameId) {
    if (!selectedTeam?.id) {
        showToast('Please select a team first.', 'error');
        return;
    }

    const game = getTeamGames(selectedTeam.id).find(g => String(g.gameId || g.id) === String(gameId));
    if (!game) {
        showToast('Game details not found.', 'error');
        return;
    }

    showToast(`${game.date}: ${game.result} ${game.teamScore}-${game.opponentScore} vs ${game.opponent}`, 'info');
}

async function editGame(gameId) {
    if (!selectedTeam?.id) {
        showToast('Please select a team first.', 'error');
        return;
    }

    const game = getTeamGames(selectedTeam.id).find(g => String(g.gameId || g.id) === String(gameId));
    if (!game) {
        showToast('Game not found.', 'error');
        return;
    }

    const currentTeamScore = Number(game.teamScore || 0);
    const currentOpponentScore = Number(game.opponentScore || 0);
    const newTeamScore = prompt('Enter updated team score:', String(currentTeamScore));
    if (newTeamScore === null) return;
    const newOpponentScore = prompt('Enter updated opponent score:', String(currentOpponentScore));
    if (newOpponentScore === null) return;

    const parsedTeamScore = Number(newTeamScore);
    const parsedOpponentScore = Number(newOpponentScore);
    if (!Number.isFinite(parsedTeamScore) || !Number.isFinite(parsedOpponentScore)) {
        showToast('Scores must be numeric values.', 'error');
        return;
    }

    const homeTeamId = Number(game.homeTeamId);
    const isAwayGame = String(game.location).toLowerCase() === 'away';
    const homeScore = isAwayGame ? parsedOpponentScore : parsedTeamScore;
    const awayScore = isAwayGame ? parsedTeamScore : parsedOpponentScore;
    const awayTeamId = isAwayGame ? selectedTeam.name : game.opponent;

    const isoDate = game.gameDateISO || new Date(game.date).toISOString().slice(0, 10);

    try {
        await apiRequest(`/games/${gameId}`, {
            method: 'PUT',
            body: JSON.stringify({
                gameDate: isoDate,
                gameLocation: game.gameLocation || game.location,
                homeScore,
                awayScore,
                homeTeamId,
                awayTeamId
            })
        });

        await loadTeamData(selectedTeam.id);
        showToast('Game updated.', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to update game.', 'error');
    }
}

async function editPlayer(playerId) {
    if (!selectedTeam?.id) {
        showToast('Please select a team first.', 'error');
        return;
    }

    const players = loadedTeamData[selectedTeam.id]?.players || [];
    const player = players.find(p => String(p.playerId) === String(playerId));
    if (!player) {
        showToast('Player not found.', 'error');
        return;
    }

    const newStatus = prompt('Update player status (active, injured, inactive):', player.status);
    if (newStatus === null) return;

    const normalizedStatus = String(newStatus).trim().toLowerCase();
    if (!['active', 'injured', 'inactive'].includes(normalizedStatus)) {
        showToast('Status must be active, injured, or inactive.', 'error');
        return;
    }

    try {
        await apiRequest(`/players/${playerId}`, {
            method: 'PUT',
            body: JSON.stringify({
                jerseyNumber: player.jersey,
                firstName: player.firstName,
                lastName: player.lastName,
                email: player.email || '',
                position: player.position,
                playerYear: player.year,
                batStance: player.bats,
                throwStance: player.throws,
                playerStatus: normalizedStatus,
                teamId: Number(selectedTeam.id)
            })
        });

        await loadTeamData(selectedTeam.id);
        showToast('Player updated.', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to update player.', 'error');
    }
}

async function deleteGame(gameId) {
    if (confirm('Are you sure you want to delete this game? All associated stats will also be deleted.')) {
        if (!selectedTeam || !selectedTeam.id) {
            showToast('Please select a team first.', 'error');
            return;
        }

        const teamId = selectedTeam.id;
        try {
            await apiRequest(`/games/${gameId}`, { method: 'DELETE' });

            if (String(selectedGameForStats) === String(gameId)) {
                selectedGameForStats = null;

                const gameSelect = document.getElementById('selectGameForStats');
                const gameStatsForm = document.getElementById('gameStatsForm');
                if (gameSelect) gameSelect.value = '';
                if (gameStatsForm) gameStatsForm.style.display = 'none';
            }

            await loadTeamData(teamId);
            showToast('Game deleted.', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to delete game.', 'error');
        }
    }
}

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
    console.log('%c⚾ Baseball Statistics Manager', 'font-size: 20px; font-weight: bold; color: #1e3a5f;');
    console.log('%cFront-end loaded and connected to API routes.', 'color: #17a2b8;');
}

// ===== Utility Functions =====
function capitalizeFirst(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

document.querySelectorAll('.data-table.sortable th').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', function() {
        showToast('Sorting not implemented yet.', 'info');
    });
});

document.querySelectorAll('.filter-select').forEach(select => {
    select.addEventListener('change', function() {
        console.log(`Filter changed: ${this.id} = ${this.value}`);
        showToast('Filtering not implemented yet.', 'info');
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
 * @param {number} hits - Total hits
 * @param {number} doubles - Total doubles
 * @param {number} triples - Total triples
 * @param {number} homeRuns - Total home runs
 * @param {number} atBats - Total at-bats
 * @returns {string} SLG formatted as .XXX
 */
function calculateSLG(hits, doubles, triples, homeRuns, atBats) {
    if (atBats === 0) return '.000';
    const singles = hits - doubles - triples - homeRuns;
    const totalBases = singles + (doubles * 2) + (triples * 3) + (homeRuns * 4);
    const slg = totalBases / atBats;
    return slg.toFixed(3).substring(1);
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

function openPlayerCardSelectionModal() {
    if (!selectedTeam?.id) {
        showToast('Please select a team first.', 'error');
        return;
    }
    const players = loadedTeamData[selectedTeam.id]?.players || [];
    const selectEl = document.getElementById('playerCardSelect');
    selectEl.innerHTML = '<option value="">-- Select a Player --</option>';
    players.forEach(player => {
        selectEl.innerHTML += `<option value="${player.playerId}">${player.name} (#${player.jersey})</option>`;
    });
    openModal('playerCardSelectionModal');
}

function generatePlayerCardFromSelection() {
    const playerId = document.getElementById('playerCardSelect').value;
    if (playerId) {
        closeModal('playerCardSelectionModal');
        openPlayerCardReport(playerId);
    } else {
        showToast('Please select a player.', 'error');
    }
}

async function openPlayerCardReport(playerId) {
    if (!playerId) {
        showToast('Invalid player selected.', 'error');
        return;
    }

    try {
        const data = await apiRequest(`/players/${playerId}/card`);
        const contentEl = document.getElementById('playerCardContent');

        const battingAvg = data.batting.ab > 0 ? (data.batting.h / data.batting.ab).toFixed(3).slice(1) : '.000';
        const era = data.pitching.ip > 0 ? ((data.pitching.er * 9) / data.pitching.ip).toFixed(2) : '0.00';
        const fieldingPct = data.fielding.tc > 0 ? ((data.fielding.po + data.fielding.a) / data.fielding.tc).toFixed(3).slice(1) : '1.000';

        contentEl.innerHTML = `
            <div class="player-card-grid">
                <div class="player-card-info">
                    <h2>${data.player.name} #${data.player.JerseyNumber}</h2>
                    <p>${data.player.TeamName} - ${data.player.PlayerYear}</p>
                    <div class="player-card-details">
                        <span><strong>Position:</strong> ${data.player.Position}</span>
                        <span><strong>Bats/Throws:</strong> ${data.player.BatStance}/${data.player.ThrowStance}</span>
                    </div>
                </div>
                <div class="player-card-stats">
                    <h3>Season Statistics</h3>
                    <table class="player-stats-table">
                        <thead>
                            <tr><th>Category</th><th>Stat</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Batting Average</td><td>${battingAvg}</td></tr>
                            <tr><td>Home Runs</td><td>${data.batting.hr}</td></tr>
                            <tr><td>RBIs</td><td>${data.batting.rbi}</td></tr>
                            <tr><td>ERA</td><td>${era}</td></tr>
                            <tr><td>Wins-Losses</td><td>${data.pitching.wins}-${data.pitching.losses}</td></tr>
                            <tr><td>Strikeouts</td><td>${data.pitching.k}</td></tr>
                            <tr><td>Fielding %</td><td>${fieldingPct}</td></tr>
                            <tr><td>Errors</td><td>${data.fielding.e}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        openModal('playerCardModal');
    } catch (error) {
        showToast(error.message || 'Failed to generate player card.', 'error');
    }
}

function printPlayerCard() {
    window.print();
}

async function openSeasonSummaryReport() {
    if (!selectedTeam?.id) {
        showToast('Please select a team first.', 'error');
        return;
    }

    try {
        const summary = await apiRequest(`/teams/${selectedTeam.id}/season-summary`);
        const contentEl = document.getElementById('seasonSummaryContent');
        
        const runDiffClass = summary.runDifferential > 0 ? 'positive' : (summary.runDifferential < 0 ? 'negative' : '');

        contentEl.innerHTML = `
            <div class="section-header" style="text-align: left; padding-bottom: 15px; border-bottom: 1px solid var(--border-color);">
                <h2>${summary.teamName}</h2>
                <p class="section-description">Season Performance Overview</p>
            </div>
            <div class="season-summary-grid">
                <div class="summary-stat-card">
                    <h4>Record</h4>
                    <p>${summary.wins}-${summary.losses}-${summary.ties}</p>
                </div>
                <div class="summary-stat-card">
                    <h4>Games Played</h4>
                    <p>${summary.gamesPlayed}</p>
                </div>
                <div class="summary-stat-card">
                    <h4>Runs Scored</h4>
                    <p class="positive">${summary.runsScored}</p>
                </div>
                <div class="summary-stat-card">
                    <h4>Runs Allowed</h4>
                    <p class="negative">${summary.runsAllowed}</p>
                </div>
                <div class="summary-stat-card">
                    <h4>Run Differential</h4>
                    <p class="${runDiffClass}">${summary.runDifferential > 0 ? '+' : ''}${summary.runDifferential}</p>
                </div>
            </div>
        `;

        openModal('seasonSummaryModal');
    } catch (error) {
        showToast(error.message || 'Failed to generate season summary.', 'error');
    }
}

function openGameLogSelectionModal() {
    if (!selectedTeam?.id) {
        showToast('Please select a team first.', 'error');
        return;
    }
    const games = loadedTeamData[selectedTeam.id]?.games || [];
    const selectEl = document.getElementById('gameLogSelect');
    selectEl.innerHTML = '<option value="">-- Select a Game --</option>';
    games.forEach(game => {
        selectEl.innerHTML += `<option value="${game.gameId}">${game.date} - ${game.opponent}</option>`;
    });
    openModal('gameLogSelectionModal');
}

function generateGameLogFromSelection() {
    const gameId = document.getElementById('gameLogSelect').value;
    if (gameId) {
        closeModal('gameLogSelectionModal');
        openGameLogReport(gameId);
    } else {
        showToast('Please select a game.', 'error');
    }
}

async function openGameLogReport(gameId) {
    if (!selectedTeam?.id) {
        showToast('No team selected for game log.', 'error');
        return;
    }
    try {
        const logData = await apiRequest(`/games/${gameId}/log?teamId=${selectedTeam.id}`);
        const contentEl = document.getElementById('gameLogContent');
        const { game, batting, pitching, fielding } = logData;

        const teamName = selectedTeam.name;

        contentEl.innerHTML = `
            <div class="game-log-header">
                <h2>${game.HomeTeamName} vs ${game.AwayTeamName}</h2>
                <p>${new Date(game.GameDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Final Score: ${game.HomeScore} - ${game.AwayScore}</strong></p>
            </div>

            <div class="game-log-section">
                <h3>Batting - ${teamName}</h3>
                ${createBattingTable(batting)}
            </div>

            <div class="game-log-section">
                <h3>Pitching - ${teamName}</h3>
                ${createPitchingTable(pitching)}
            </div>

            <div class="game-log-section">
                <h3>Fielding - ${teamName}</h3>
                ${createFieldingTable(fielding)}
            </div>
        `;

        openModal('gameLogModal');
    } catch (error) {
        showToast(error.message || 'Failed to generate game log.', 'error');
    }
}

function createBattingTable(battingData) {
    if (!battingData.length) return '<p>No batting data available.</p>';
    let table = '<table class="game-log-table"><thead><tr><th>Player</th><th>AB</th><th>R</th><th>H</th><th>RBI</th><th>BB</th><th>SO</th></tr></thead><tbody>';
    battingData.forEach(p => {
        table += `<tr>
            <td>${p.FirstName} ${p.LastName} (#${p.JerseyNumber})</td>
            <td>${p.AtBats}</td>
            <td>${p.Runs}</td>
            <td>${p.Hits}</td>
            <td>${p.RBIs}</td>
            <td>${p.Walks}</td>
            <td>${p.Strikeouts}</td>
        </tr>`;
    });
    table += '</tbody></table>';
    return table;
}

function createPitchingTable(pitchingData) {
    if (!pitchingData.length) return '<p>No pitching data available.</p>';
    let table = '<table class="game-log-table"><thead><tr><th>Player</th><th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>SO</th></tr></thead><tbody>';
    pitchingData.forEach(p => {
        table += `<tr>
            <td>${p.FirstName} ${p.LastName} (#${p.JerseyNumber})</td>
            <td>${p.InningsPitched.toFixed(1)}</td>
            <td>${p.HitsAllowed}</td>
            <td>${p.RunsAllowed}</td>
            <td>${p.EarnedRuns}</td>
            <td>${p.WalksAllowed}</td>
            <td>${p.Strikeouts}</td>
        </tr>`;
    });
    table += '</tbody></table>';
    return table;
}

function createFieldingTable(fieldingData) {
    if (!fieldingData.length) return '<p>No fielding data available.</p>';
    let table = '<table class="game-log-table"><thead><tr><th>Player</th><th>POS</th><th>PO</th><th>A</th><th>E</th><th>DP</th></tr></thead><tbody>';
    fieldingData.forEach(p => {
        table += `<tr>
            <td>${p.FirstName} ${p.LastName} (#${p.JerseyNumber})</td>
            <td>${p.Position}</td>
            <td>${p.Putouts}</td>
            <td>${p.Assists}</td>
            <td>${p.Errors}</td>
            <td>${p.DoublePlays}</td>
        </tr>`;
    });
    table += '</tbody></table>';
    return table;
}

function printGameLog() {
    window.print();
}
