CREATE TABLE IF NOT EXISTS TEAMS (
    TeamID INTEGER PRIMARY KEY AUTO_INCREMENT,
    TeamName varchar(255) NOT NULL,
    TeamLevel varchar(255) NOT NULL,
    Season varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS PLAYERS (
    PlayerID INTEGER PRIMARY KEY AUTO_INCREMENT,
    JerseyNumber INTEGER NOT NULL,
    FirstName varchar(255) NOT NULL,
    LastName varchar(255) NOT NULL,
    Email varchar(255) NOT NULL,
    Position varchar(255) NOT NULL,
    PlayerYear varchar(255) NOT NULL,
    BatStance varchar(255) NOT NULL,
    ThrowStance varchar(255) NOT NULL,
    PlayerStatus varchar(255) NOT NULL,
    TeamID INTEGER NOT NULL,
    FOREIGN KEY (TeamID) REFERENCES TEAMS(TeamID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS GAMES (
    GameID INTEGER PRIMARY KEY AUTO_INCREMENT,
    GameDate DATE NOT NULL,
    GameLocation varchar(255) NOT NULL,
    HomeScore INTEGER NOT NULL,
    AwayScore INTEGER NOT NULL,
    HomeTeamID INTEGER NOT NULL,
    AwayTeamID INTEGER NOT NULL,
    FOREIGN KEY (HomeTeamID) REFERENCES TEAMS(TeamID) ON DELETE CASCADE,
    FOREIGN KEY (AwayTeamID) REFERENCES TEAMS(TeamID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS BATTING_STATS (
    PlayerID INTEGER,
    GameID INTEGER,
    AtBats INTEGER,
    Runs INTEGER,
    Hits INTEGER,
    Doubles INTEGER,
    Triples INTEGER,
    HomeRuns INTEGER,
    RBIs INTEGER,
    Walks INTEGER,
    Strikeouts INTEGER,
    StolenBases INTEGER,
    HitByPitch INTEGER,
    Sacrifice INTEGER,
    BattingAverage REAL,
    OnBasePercentage REAL,
    SluggingPercentage REAL,
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID) ON DELETE CASCADE,
    PRIMARY KEY (PlayerID, GameID)
);

CREATE TABLE IF NOT EXISTS PITCHING_STATS (
    PlayerID INTEGER,
    GameID INTEGER,
    InningsPitched REAL,
    HitsAllowed INTEGER,
    RunsAllowed INTEGER,
    EarnedRuns INTEGER,
    WalksAllowed INTEGER,
    Strikeouts INTEGER,
    HomeRunsAllowed INTEGER,
    PitchCount INTEGER,
    Strikes INTEGER,
    Balls INTEGER,
    Decision varchar(255),
    PitcherStarted BOOLEAN,
    WHIP REAL,
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID) ON DELETE CASCADE,
    PRIMARY KEY (PlayerID, GameID)
);

CREATE TABLE IF NOT EXISTS FIELDING_STATS (
    PlayerID INTEGER,
    GameID INTEGER,
    Position varchar(255),
    Putouts INTEGER,
    Assists INTEGER,
    Errors INTEGER,
    DoublePlays INTEGER,
    FieldingPercentage REAL,
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID) ON DELETE CASCADE,
    PRIMARY KEY (PlayerID, GameID)
);

CREATE TABLE IF NOT EXISTS CATCHING_STATS (
    PlayerID INTEGER,
    GameID INTEGER,
    PassedBalls INTEGER,
    StolenBasesAllowed INTEGER,
    CaughtStealing INTEGER,
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID) ON DELETE CASCADE,
    PRIMARY KEY (PlayerID, GameID)
);

INSERT INTO TEAMS (TeamID, TeamName, TeamLevel, Season) VALUES
    (1, 'New Paltz Hawks', 'Varsity', '2026'),
    (2, 'Hudson Valley Bears', 'Varsity', '2026'),
    (3, 'Capital City Knights', 'Varsity', '2026');

INSERT INTO PLAYERS (PlayerID, JerseyNumber, FirstName, LastName, Email, Position, PlayerYear, BatStance, ThrowStance, PlayerStatus, TeamID) VALUES
    (1, 3, 'Evan', 'Brooks', 'evan.brooks@example.com', 'SS', 'Senior', 'R', 'R', 'Active', 1),
    (2, 7, 'Liam', 'Carter', 'liam.carter@example.com', 'CF', 'Junior', 'L', 'L', 'Active', 1),
    (3, 12, 'Noah', 'Diaz', 'noah.diaz@example.com', '1B', 'Sophomore', 'R', 'R', 'Active', 1),
    (4, 18, 'Mason', 'Evans', 'mason.evans@example.com', 'P', 'Senior', 'R', 'R', 'Active', 2),
    (5, 22, 'Aiden', 'Foster', 'aiden.foster@example.com', 'C', 'Junior', 'R', 'R', 'Active', 2),
    (6, 9, 'Logan', 'Gray', 'logan.gray@example.com', 'LF', 'Senior', 'L', 'L', 'Active', 2),
    (7, 15, 'Caleb', 'Hill', 'caleb.hill@example.com', 'P', 'Senior', 'R', 'R', 'Active', 3),
    (8, 27, 'Owen', 'James', 'owen.james@example.com', 'C', 'Junior', 'R', 'R', 'Active', 3);

INSERT INTO GAMES (GameID, GameDate, GameLocation, HomeScore, AwayScore, HomeTeamID, AwayTeamID) VALUES
    (1, '2026-03-15', 'New Paltz Field', 6, 4, 1, 2),
    (2, '2026-03-22', 'Hudson Valley Park', 3, 5, 2, 3),
    (3, '2026-03-29', 'Capital City Stadium', 2, 7, 3, 1);

INSERT INTO BATTING_STATS (PlayerID, GameID, AtBats, Runs, Hits, Doubles, Triples, HomeRuns, RBIs, Walks, Strikeouts, StolenBases, HitByPitch, Sacrifice, BattingAverage, OnBasePercentage, SluggingPercentage) VALUES
    (1, 1, 4, 2, 3, 1, 0, 0, 2, 0, 1, 1, 0, 0, 0.750, 0.750, 1.000),
    (2, 1, 3, 1, 1, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0.333, 0.500, 0.667),
    (3, 1, 4, 1, 2, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0.500, 0.500, 0.500),
    (5, 1, 3, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0.333, 0.500, 0.333),
    (4, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0.000, 0.333, 0.000),
    (5, 2, 4, 1, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0.500, 0.500, 0.750),
    (6, 2, 4, 1, 1, 0, 0, 1, 2, 0, 1, 1, 0, 0, 0.250, 0.250, 0.750),
    (7, 2, 3, 2, 2, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0.667, 0.750, 0.667),
    (1, 3, 4, 1, 2, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0.500, 0.600, 0.500),
    (2, 3, 4, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0.250, 0.250, 0.250),
    (4, 3, 3, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0.333, 0.500, 0.333),
    (8, 3, 4, 2, 3, 1, 0, 1, 3, 0, 0, 0, 0, 0, 0.750, 0.750, 1.500);

INSERT INTO PITCHING_STATS (PlayerID, GameID, InningsPitched, HitsAllowed, RunsAllowed, EarnedRuns, WalksAllowed, Strikeouts, HomeRunsAllowed, PitchCount, Strikes, Balls, Decision, PitcherStarted, WHIP) VALUES
    (4, 1, 6.0, 6, 4, 4, 2, 7, 1, 92, 58, 34, 'Win', TRUE, 1.333),
    (7, 2, 7.0, 5, 3, 3, 1, 8, 1, 101, 66, 35, 'Win', TRUE, 0.857),
    (4, 3, 5.0, 8, 7, 7, 3, 4, 2, 88, 52, 36, 'Loss', TRUE, 2.200);

INSERT INTO FIELDING_STATS (PlayerID, GameID, Position, Putouts, Assists, Errors, DoublePlays, FieldingPercentage) VALUES
    (1, 1, 'SS', 2, 4, 0, 1, 1.000),
    (2, 1, 'CF', 3, 0, 0, 0, 1.000),
    (3, 1, '1B', 8, 1, 0, 1, 1.000),
    (5, 1, 'C', 9, 0, 0, 0, 1.000),
    (4, 2, 'P', 1, 2, 0, 0, 1.000),
    (6, 2, 'LF', 2, 0, 0, 0, 1.000),
    (7, 2, 'P', 1, 3, 0, 0, 1.000),
    (8, 3, 'C', 10, 0, 1, 0, 0.909),
    (1, 3, 'SS', 1, 5, 0, 1, 1.000),
    (2, 3, 'CF', 4, 0, 0, 0, 1.000);

INSERT INTO CATCHING_STATS (PlayerID, GameID, PassedBalls, StolenBasesAllowed, CaughtStealing) VALUES
    (5, 1, 0, 1, 1),
    (8, 2, 1, 2, 1),
    (8, 3, 0, 1, 2);