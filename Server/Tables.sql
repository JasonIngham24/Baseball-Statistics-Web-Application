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
    FOREIGN KEY (TeamID) REFERENCES TEAMS(TeamID)
);

CREATE TABLE IF NOT EXISTS GAMES (
    GameID INTEGER PRIMARY KEY AUTO_INCREMENT,
    GameDate DATE NOT NULL,
    GameLocation varchar(255) NOT NULL,
    HomeScore INTEGER NOT NULL,
    AwayScore INTEGER NOT NULL,
    HomeTeamID INTEGER NOT NULL,
    AwayTeamID INTEGER NOT NULL,
    FOREIGN KEY (HomeTeamID) REFERENCES TEAMS(TeamID),
    FOREIGN KEY (AwayTeamID) REFERENCES TEAMS(TeamID)
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
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID),
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID),
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
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID),
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID),
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
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID),
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID),
    PRIMARY KEY (PlayerID, GameID)
);

CREATE TABLE IF NOT EXISTS CATCHING_STATS (
    PlayerID INTEGER,
    GameID INTEGER,
    PassedBalls INTEGER,
    StolenBasesAllowed INTEGER,
    CaughtStealing INTEGER,
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID),
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID),
    PRIMARY KEY (PlayerID, GameID)
);