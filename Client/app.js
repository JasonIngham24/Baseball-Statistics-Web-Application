/**
 * Baseball Statistics Manager - Frontend JavaScript
 * This file handles UI interactions and placeholder functionality.
 * Database integration will be added when the backend is connected.
 */

// ===== Global State =====
let selectedTeam = null;
let selectedGameForStats = null;

// ===== Sample Games Data (placeholder for database) =====
const sampleGamesData = {
    1: [
        { id: 1, date: '02/20/2026', opponent: 'Riverside Rebels', location: 'Home', result: 'W', teamScore: 7, opponentScore: 3 },
        { id: 2, date: '02/18/2026', opponent: 'Mountain Eagles', location: 'Away', result: 'L', teamScore: 2, opponentScore: 5 },
        { id: 3, date: '02/15/2026', opponent: 'Valley Storm', location: 'Home', result: 'W', teamScore: 9, opponentScore: 4 }
    ],
    2: [
        { id: 1, date: '02/19/2026', opponent: 'River Rats', location: 'Home', result: 'W', teamScore: 5, opponentScore: 2 },
        { id: 2, date: '02/16/2026', opponent: 'Hilltop Hornets', location: 'Away', result: 'W', teamScore: 8, opponentScore: 6 }
    ],
    3: [
        { id: 1, date: '02/21/2026', opponent: 'Lakeside Lions', location: 'Home', result: 'L', teamScore: 3, opponentScore: 7 },
        { id: 2, date: '02/17/2026', opponent: 'Coastal Crabs', location: 'Away', result: 'W', teamScore: 4, opponentScore: 1 }
    ]
};

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
        pitchingStats: [
            { player: 'Mike Johnson', era: '2.15', wl: '8-2', k: 89 },
            { player: 'Chris Davis', era: '2.87', wl: '6-3', k: 72 },
            { player: 'Tom Wilson', era: '3.21', wl: '5-4', k: 65 }
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
        pitchingStats: [
            { player: 'Jake Thompson', era: '2.48', wl: '7-1', k: 81 },
            { player: 'Liam Brooks', era: '2.95', wl: '5-3', k: 67 },
            { player: 'Noah Perez', era: '3.12', wl: '2-2', k: 41 }
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
        pitchingStats: [
            { player: 'Sam Wilson', era: '2.76', wl: '6-4', k: 74 },
            { player: 'Ethan Clark', era: '3.05', wl: '4-4', k: 59 },
            { player: 'Mason Reed', era: '3.44', wl: '3-2', k: 48 }
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
    initGameStatsToggles();
    showDatabaseNotice();
    initHamburgerMenu();
});

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
    updateDashboardLeaders(teamData);

    // Update players table
    updatePlayersTable(teamData.players);

    // Update batting stats table
    updateBattingTable(teamData.battingStats);

    // Update player dropdowns (for game stats entry)
    updateStatsPlayerDropdown(teamData.players);

    // Update games table and dropdown
    updateGamesTable(teamId);
    updateGameDropdowns(teamId);
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

// Update the stats player dropdown in game stats entry
function updateStatsPlayerDropdown(players) {
    const dropdown = document.getElementById('statsPlayer');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">-- Select Player --</option>';
    
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.jersey;
        option.textContent = `#${player.jersey} ${player.name} (${player.position})`;
        dropdown.appendChild(option);
    });
}

// Update games table with team-specific games
function updateGamesTable(teamId) {
    const tableBody = document.getElementById('gamesTableBody');
    if (!tableBody) return;
    
    const games = sampleGamesData[teamId] || [];
    
    tableBody.innerHTML = '';
    
    games.forEach(game => {
        const resultClass = game.result === 'W' ? 'win' : game.result === 'L' ? 'loss' : 'tie';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${game.date}</td>
            <td>${game.opponent}</td>
            <td>${game.location}</td>
            <td><span class="result-badge ${resultClass}">${game.result}</span></td>
            <td>${game.teamScore} - ${game.opponentScore}</td>
            <td class="action-buttons">
                <button class="btn-icon-only" title="View Details" onclick="viewGameDetails(${game.id})">📊</button>
                <button class="btn-icon-only" title="Edit" onclick="editGame(${game.id})">✏️</button>
                <button class="btn-icon-only danger" title="Delete" onclick="deleteGame(${game.id})">🗑️</button>
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
    
    const games = sampleGamesData[teamId] || [];
    
    dropdown.innerHTML = '<option value="">-- Select a Game --</option>';
    
    games.forEach(game => {
        const option = document.createElement('option');
        option.value = game.id;
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
function handleAddGame(form) {
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

    // Format date for display
    const dateObj = new Date(gameDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

    const teamId = selectedTeam.id;
    if (!sampleGamesData[teamId]) {
        sampleGamesData[teamId] = [];
    }

    const currentGames = sampleGamesData[teamId];
    const maxExistingId = currentGames.reduce((maxId, game) => Math.max(maxId, game.id), 0);
    const newGame = {
        id: maxExistingId + 1,
        date: formattedDate,
        opponent: gameOpponent,
        location: gameLocation,
        result,
        teamScore: parseInt(teamScore, 10),
        opponentScore: parseInt(opponentScore, 10)
    };

    currentGames.unshift(newGame);
    console.log('New game data:', newGame);

    updateGamesTable(teamId);
    updateGameDropdowns(teamId);

    showToast('Game added successfully! (Database pending)', 'success');
    form.reset();

    // Switch to games list tab
    const gamesListBtn = document.querySelector('[data-tab="gamesList"]');
    if (gamesListBtn) gamesListBtn.click();
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

// Load existing stats for a player (placeholder)
function loadPlayerGameStats() {
    const playerId = document.getElementById('statsPlayer').value;
    
    if (!playerId) {
        showToast('Please select a player first.', 'error');
        return;
    }
    
    if (!selectedGameForStats) {
        showToast('Please select a game first.', 'error');
        return;
    }
    
    // This would load from database when connected
    showToast('No existing stats found. Enter new stats for this player. (Database pending)', 'info');
}

// Save player game stats
function savePlayerGameStats() {
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
    }
    
    console.log('Player game stats:', statsData);
    
    showToast('Player stats saved successfully! (Database pending)', 'success');
    
    // Clear form for next player
    clearGameStatsForm();
    document.getElementById('statsPlayer').value = '';
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

// View game details (placeholder)
function viewGameDetails(gameId) {
    showToast('Game details view will be available when database is connected.', 'info');
    console.log('View game details:', gameId);
}

// Edit game (placeholder)
function editGame(gameId) {
    showToast('Game editing will be available when database is connected.', 'info');
    console.log('Edit game:', gameId);
}

// Delete game (placeholder)
function deleteGame(gameId) {
    if (confirm('Are you sure you want to delete this game? All associated stats will also be deleted.')) {
        if (!selectedTeam || !selectedTeam.id) {
            showToast('Please select a team first.', 'error');
            return;
        }

        const teamId = selectedTeam.id;
        const games = sampleGamesData[teamId] || [];
        const gameIndex = games.findIndex(game => game.id === gameId);

        if (gameIndex === -1) {
            showToast('Game not found.', 'error');
            return;
        }

        const [deletedGame] = games.splice(gameIndex, 1);

        if (String(selectedGameForStats) === String(gameId)) {
            selectedGameForStats = null;

            const gameSelect = document.getElementById('selectGameForStats');
            const gameStatsForm = document.getElementById('gameStatsForm');
            if (gameSelect) gameSelect.value = '';
            if (gameStatsForm) gameStatsForm.style.display = 'none';
        }

        updateGamesTable(teamId);
        updateGameDropdowns(teamId);

        showToast(`Deleted game vs ${deletedGame.opponent}. Changes are local and reset on refresh.`, 'success');
        console.log('Deleted game:', deletedGame);
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
