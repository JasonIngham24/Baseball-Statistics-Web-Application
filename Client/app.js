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
        if (!Array.isArray(teams) || teams.length === 0) return;

        teamGrid.innerHTML = '';
        teams.forEach(team => {
            teamGrid.appendChild(createTeamCardElement(team));
        });

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
        const response = await apiRequest(`/teams/${teamId}/summary`);
        const teamData = {
            id: response.team.teamId,
            name: response.team.name,
            level: response.team.level,
            season: response.team.season,
            players: response.players || [],
            battingStats: response.battingStats || [],
            pitchingStats: response.pitchingStats || [],
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
        updateStatsPlayerDropdown(teamData.players);
        updateGamesTable(teamId);
        updateGameDropdowns(teamId);
        populateOpponentTeams(teamId);
    } catch (error) {
        console.error('Failed to load selected team data.', error);
        showToast(error.message || 'Failed to load team data.', 'error');
    }
}

async function populateOpponentTeams(teamId) {
    const opponentSelect = document.getElementById('gameOpponent');
    if (!opponentSelect) return;

    try {
        const teams = await apiRequest('/teams');
        opponentSelect.innerHTML = '<option value="">Select Opponent Team</option>';
        teams
            .filter(team => String(team.teamId) !== String(teamId))
            .forEach(team => {
                const option = document.createElement('option');
                option.value = team.teamId;
                option.textContent = `${team.name} (${team.level})`;
                opponentSelect.appendChild(option);
            });
    } catch (error) {
        console.warn('Unable to load opponent teams.', error);
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
    
    const games = getTeamGames(teamId);
    
    tableBody.innerHTML = '';
    
    games.forEach(game => {
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
    
    if (games.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-secondary);">No games recorded yet. Add a game to get started.</td></tr>';
    }
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
async function handleAddGame(form) {
    if (!selectedTeam || !selectedTeam.id) {
        showToast('Please select a team first.', 'error');
        return;
    }

    const gameDate = document.getElementById('gameDate').value;
    const gameOpponent = document.getElementById('gameOpponent').value;
    const gameLocation = document.getElementById('gameLocation').value;
    const teamScore = document.getElementById('teamScore').value || '0';
    const opponentScore = document.getElementById('opponentScore').value || '0';

    if (!gameDate || !gameOpponent) {
        showToast('Please fill in required fields.', 'error');
        return;
    }

    // Determine result
    let result = 'T';
    if (parseInt(teamScore) > parseInt(opponentScore)) result = 'W';
    else if (parseInt(teamScore) < parseInt(opponentScore)) result = 'L';

    try {
        const opponentTeamId = Number(gameOpponent);
        const selectedTeamId = Number(selectedTeam.id);

        if (!opponentTeamId) {
            showToast('Please choose an opponent team.', 'error');
            return;
        }

        const homeTeamId = gameLocation === 'Away' ? opponentTeamId : selectedTeamId;
        const awayTeamId = gameLocation === 'Away' ? selectedTeamId : opponentTeamId;

        await apiRequest('/games', {
            method: 'POST',
            body: JSON.stringify({
                gameDate,
                gameLocation,
                homeScore: parseInt(teamScore, 10),
                awayScore: parseInt(opponentScore, 10),
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
                email: '',
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

    const teamId = Number(selectedTeam.id);
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
    const awayTeamId = Number(game.awayTeamId);
    const homeScore = homeTeamId === teamId ? parsedTeamScore : parsedOpponentScore;
    const awayScore = awayTeamId === teamId ? parsedTeamScore : parsedOpponentScore;

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
