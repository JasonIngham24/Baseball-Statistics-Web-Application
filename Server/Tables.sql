CREATE TABLE IF NOT EXISTS TEAMS (
    'TeamID' INTEGER PRIMARY KEY AUTOINCREMENT,
    'TeamName' varchar(255) NOT NULL,
    'Level' varchar(255) NOT NULL,
    'Season' varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS PLAYERS (
    'PlayerID' INTEGER PRIMARY KEY AUTOINCREMENT,
    'JerseyNumber' INTEGER NOT NULL,
    'FirstName' varchar(255) NOT NULL,
    'LastName' varchar(255) NOT NULL,
    'Email' varchar(255) NOT NULL,
    'Position' varchar(255) NOT NULL,
    'Year' varchar(255) NOT NULL,
    'BatStance' varchar(255) NOT NULL,
    'ThrowStance' varchar(255) NOT NULL,
    'Status' varchar(255) NOT NULL,
    'TeamID' INTEGER NOT NULL,
    FOREIGN KEY (TeamID) REFERENCES TEAMS(TeamID)
);

CREATE TABLE IF NOT EXISTS GAMES (
    'GameID' INTEGER PRIMARY KEY AUTOINCREMENT,
    'Date' DATE NOT NULL,
    'Location' varchar(255) NOT NULL,
    'HomeScore' INTEGER NOT NULL,
    'AwayScore' INTEGER NOT NULL,
    'HomeTeamID' INTEGER NOT NULL,
    'AwayTeamID' INTEGER NOT NULL,
    FOREIGN KEY (HomeTeamID) REFERENCES TEAMS(TeamID),
    FOREIGN KEY (AwayTeamID) REFERENCES TEAMS(TeamID)
);

CREATE TABLE IF NOT EXISTS BATTING_STATS (
    'PlayerID' INTEGER NOT NULL,
    'GameID' INTEGER NOT NULL,
    'AtBats' INTEGER NOT NULL,
    'Runs' INTEGER NOT NULL,
    'Hits' INTEGER NOT NULL,
    'Doubles' INTEGER NOT NULL,
    'Triples' INTEGER NOT NULL,
    'HomeRuns' INTEGER NOT NULL,
    'RBIs' INTEGER NOT NULL,
    'Walks' INTEGER NOT NULL,
    'Strikeouts' INTEGER NOT NULL,
    'StolenBases' INTEGER NOT NULL,
    'HitByPitch' INTEGER NOT NULL,
    'Sacrifice' INTEGER NOT NULL,
    'BattingAverage' REAL NOT NULL,
    'OnBasePercentage' REAL NOT NULL,
    'SluggingPercentage' REAL NOT NULL,
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID),
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID),
    PRIMARY KEY (PlayerID, GameID)
);

CREATE TABLE IF NOT EXISTS PITCHING_STATS (
    'PlayerID' INTEGER NOT NULL,
    'GameID' INTEGER NOT NULL,
    'InningsPitched' REAL NOT NULL,
    'HitsAllowed' INTEGER NOT NULL,
    'RunsAllowed' INTEGER NOT NULL,
    'EarnedRuns' INTEGER NOT NULL,
    'WalksAllowed' INTEGER NOT NULL,
    'Strikeouts' INTEGER NOT NULL,
    'HomeRunsAllowed' INTEGER NOT NULL,
    'PitchCount' INTEGER NOT NULL,
    'Strikes' INTEGER NOT NULL,
    'Balls' INTEGER NOT NULL,
    'Decision' varchar(255) NOT NULL,
    'Started' BOOLEAN NOT NULL,
    'WHIP' REAL NOT NULL,
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID),
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID),
    PRIMARY KEY (PlayerID, GameID)
);

CREATE TABLE IF NOT EXISTS FIELDING_STATS (
    'PlayerID' INTEGER NOT NULL,
    'GameID' INTEGER NOT NULL,
    'Position' varchar(255) NOT NULL,
    'Putouts' INTEGER NOT NULL,
    'Assists' INTEGER NOT NULL,
    'Errors' INTEGER NOT NULL,
    'DoublePlays' INTEGER NOT NULL,
    'FieldingPercentage' REAL NOT NULL,
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID),
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID),
    PRIMARY KEY (PlayerID, GameID)
);

CREATE TABLE IF NOT EXISTS CATCHING_STATS (
    'PlayerID' INTEGER NOT NULL,
    'GameID' INTEGER NOT NULL,
    'PassedBalls' INTEGER NOT NULL,
    'StolenBasesAllowed' INTEGER NOT NULL,
    'CaughtStealing' INTEGER NOT NULL,
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID),
    FOREIGN KEY (GameID) REFERENCES GAMES(GameID),
    PRIMARY KEY (PlayerID, GameID)
);