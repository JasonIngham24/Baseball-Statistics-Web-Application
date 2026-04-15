const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'Client')));

function fullName(firstName, lastName) {
  return `${firstName} ${lastName}`.trim();
}

function formatDate(dateValue) {
  if (!dateValue) return null;
  return new Date(dateValue).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

function calculateBattingAverage(hits, atBats) {
  if (!atBats) return '.000';
  return (hits / atBats).toFixed(3).slice(1);
}

function calculateOBP(hits, walks, hbp, atBats, sacrifice) {
  const denominator = atBats + walks + hbp + sacrifice;
  if (!denominator) return '.000';
  return ((hits + walks + hbp) / denominator).toFixed(3).slice(1);
}

function calculateSLG(hits, doubles, triples, homeRuns, atBats) {
  if (!atBats) return '.000';
  const singles = hits - doubles - triples - homeRuns;
  const totalBases = singles + (2 * doubles) + (3 * triples) + (4 * homeRuns);
  return (totalBases / atBats).toFixed(3).slice(1);
}

function calculateWHIP(walksAllowed, hitsAllowed, inningsPitched) {
  if (!inningsPitched) return '0.000';
  return ((walksAllowed + hitsAllowed) / inningsPitched).toFixed(3);
}

async function loadTeamSummary(teamId) {
  const [teamRows] = await db.query('SELECT * FROM TEAMS WHERE TeamID = ?', [teamId]);
  if (!teamRows.length) return null;

  const [allTeams] = await db.query('SELECT TeamID, TeamName FROM TEAMS');
  const teamNameById = new Map(allTeams.map(team => [String(team.TeamID), team.TeamName]));

  const [playerRows] = await db.query('SELECT * FROM PLAYERS WHERE TeamID = ? ORDER BY JerseyNumber, LastName, FirstName', [teamId]);
  const [gameRows] = await db.query(
    'SELECT * FROM GAMES WHERE HomeTeamID = ? OR AwayTeamID = ? ORDER BY GameDate DESC, GameID DESC',
    [teamId, teamId]
  );

  const [battingRows] = await db.query(
    `SELECT bs.*, p.FirstName, p.LastName
     FROM BATTING_STATS bs
     JOIN PLAYERS p ON p.PlayerID = bs.PlayerID
     JOIN GAMES g ON g.GameID = bs.GameID
     WHERE p.TeamID = ?
     ORDER BY p.LastName, p.FirstName, g.GameDate DESC`,
    [teamId]
  );

  const [pitchingRows] = await db.query(
    `SELECT ps.*, p.FirstName, p.LastName
     FROM PITCHING_STATS ps
     JOIN PLAYERS p ON p.PlayerID = ps.PlayerID
     JOIN GAMES g ON g.GameID = ps.GameID
     WHERE p.TeamID = ?
     ORDER BY p.LastName, p.FirstName, g.GameDate DESC`,
    [teamId]
  );

  const [fieldingRows] = await db.query(
    `SELECT fs.*, p.FirstName, p.LastName
     FROM FIELDING_STATS fs
     JOIN PLAYERS p ON p.PlayerID = fs.PlayerID
     JOIN GAMES g ON g.GameID = fs.GameID
     WHERE p.TeamID = ?`,
    [teamId]
  );

  const battingByPlayer = new Map();
  for (const row of battingRows) {
    const playerId = row.PlayerID;
    if (!battingByPlayer.has(playerId)) {
      battingByPlayer.set(playerId, {
        playerId,
        player: fullName(row.FirstName, row.LastName),
        g: 0,
        ab: 0,
        r: 0,
        h: 0,
        doubles: 0,
        triples: 0,
        hr: 0,
        rbi: 0,
        bb: 0,
        so: 0,
        sb: 0,
        hbp: 0,
        sac: 0
      });
    }

    const entry = battingByPlayer.get(playerId);
    entry.g += 1;
    entry.ab += Number(row.AtBats || 0);
    entry.r += Number(row.Runs || 0);
    entry.h += Number(row.Hits || 0);
    entry.doubles += Number(row.Doubles || 0);
    entry.triples += Number(row.Triples || 0);
    entry.hr += Number(row.HomeRuns || 0);
    entry.rbi += Number(row.RBIs || 0);
    entry.bb += Number(row.Walks || 0);
    entry.so += Number(row.Strikeouts || 0);
    entry.sb += Number(row.StolenBases || 0);
    entry.hbp += Number(row.HitByPitch || 0);
    entry.sac += Number(row.Sacrifice || 0);
  }

  const pitchingByPlayer = new Map();
  for (const row of pitchingRows) {
    const playerId = row.PlayerID;
    if (!pitchingByPlayer.has(playerId)) {
      pitchingByPlayer.set(playerId, {
        playerId,
        player: fullName(row.FirstName, row.LastName),
        g: 0,
        ip: 0,
        h: 0,
        r: 0,
        er: 0,
        bb: 0,
        k: 0,
        hr: 0,
        wins: 0,
        losses: 0
      });
    }

    const entry = pitchingByPlayer.get(playerId);
    entry.g += 1;
    entry.ip += Number(row.InningsPitched || 0);
    entry.h += Number(row.HitsAllowed || 0);
    entry.r += Number(row.RunsAllowed || 0);
    entry.er += Number(row.EarnedRuns || 0);
    entry.bb += Number(row.WalksAllowed || 0);
    entry.k += Number(row.Strikeouts || 0);
    entry.hr += Number(row.HomeRunsAllowed || 0);
    if ((row.Decision || '').toLowerCase() === 'win') entry.wins += 1;
    if ((row.Decision || '').toLowerCase() === 'loss') entry.losses += 1;
  }

  const fieldingByPlayer = new Map();
  for (const row of fieldingRows) {
    const playerId = row.PlayerID;
    if (!fieldingByPlayer.has(playerId)) {
      fieldingByPlayer.set(playerId, {
        putouts: 0,
        assists: 0,
        errors: 0
      });
    }

    const entry = fieldingByPlayer.get(playerId);
    entry.putouts += Number(row.Putouts || 0);
    entry.assists += Number(row.Assists || 0);
    entry.errors += Number(row.Errors || 0);
  }

  const players = playerRows.map(player => ({
    playerId: player.PlayerID,
    jersey: player.JerseyNumber,
    name: fullName(player.FirstName, player.LastName),
    firstName: player.FirstName,
    lastName: player.LastName,
    email: player.Email,
    position: player.Position,
    year: player.PlayerYear,
    bats: player.BatStance,
    throws: player.ThrowStance,
    status: String(player.PlayerStatus || '').toLowerCase()
  }));

  const battingStats = Array.from(battingByPlayer.values()).map(entry => ({
    ...entry,
    avg: calculateBattingAverage(entry.h, entry.ab),
    obp: calculateOBP(entry.h, entry.bb, entry.hbp, entry.ab, entry.sac),
    slg: calculateSLG(entry.h, entry.doubles, entry.triples, entry.hr, entry.ab)
  }));

  const pitchingStats = Array.from(pitchingByPlayer.values()).map(entry => {
    const era = entry.ip ? ((entry.er * 9) / entry.ip).toFixed(2) : '0.00';
    const wl = `${entry.wins}-${entry.losses}`;
    return {
      playerId: entry.playerId,
      player: entry.player,
      era,
      wl,
      k: entry.k,
      whip: calculateWHIP(entry.bb, entry.h, entry.ip)
    };
  });

  const teamBattingHits = battingStats.reduce((sum, entry) => sum + entry.h, 0);
  const teamBattingAtBats = battingStats.reduce((sum, entry) => sum + entry.ab, 0);
  const totalPitchingInnings = pitchingByPlayer.size
    ? Array.from(pitchingByPlayer.values()).reduce((sum, entry) => sum + entry.ip, 0)
    : 0;
  const totalPitchingEarnedRuns = Array.from(pitchingByPlayer.values()).reduce((sum, entry) => sum + entry.er, 0);
  const totalPitchingERA = totalPitchingInnings ? ((totalPitchingEarnedRuns * 9) / totalPitchingInnings).toFixed(2) : '0.00';

  const fieldingTotals = Array.from(fieldingByPlayer.values()).reduce((totals, entry) => {
    totals.putouts += entry.putouts;
    totals.assists += entry.assists;
    totals.errors += entry.errors;
    return totals;
  }, { putouts: 0, assists: 0, errors: 0 });

  const fieldingDenominator = fieldingTotals.putouts + fieldingTotals.assists + fieldingTotals.errors;
  const fieldingPct = fieldingDenominator ? ((fieldingTotals.putouts + fieldingTotals.assists) / fieldingDenominator).toFixed(3).slice(1) : '.000';

  const summary = {
    teamAvg: calculateBattingAverage(teamBattingHits, teamBattingAtBats),
    teamERA: totalPitchingERA,
    fieldingPct,
    activePlayerCount: players.filter(player => player.status === 'active').length
  };

  const games = gameRows.map(game => ({
    gameId: game.GameID,
    date: formatDate(game.GameDate),
    gameDateISO: new Date(game.GameDate).toISOString().slice(0, 10),
    opponent: String(game.HomeTeamID) === String(teamId)
      ? (teamNameById.get(String(game.AwayTeamID)) || `Team ${game.AwayTeamID}`)
      : (teamNameById.get(String(game.HomeTeamID)) || `Team ${game.HomeTeamID}`),
    location: String(game.HomeTeamID) === String(teamId) ? 'Home' : 'Away',
    result: String(game.HomeTeamID) === String(teamId)
      ? (game.HomeScore > game.AwayScore ? 'W' : game.HomeScore < game.AwayScore ? 'L' : 'T')
      : (game.AwayScore > game.HomeScore ? 'W' : game.AwayScore < game.HomeScore ? 'L' : 'T'),
    teamScore: String(game.HomeTeamID) === String(teamId) ? game.HomeScore : game.AwayScore,
    opponentScore: String(game.HomeTeamID) === String(teamId) ? game.AwayScore : game.HomeScore,
    homeTeamId: game.HomeTeamID,
    awayTeamId: game.AwayTeamID,
    gameLocation: game.GameLocation,
    notes: game.GameLocation
  }));

  return {
    team: {
      teamId: teamRows[0].TeamID,
      name: teamRows[0].TeamName,
      level: teamRows[0].TeamLevel,
      season: teamRows[0].Season
    },
    players,
    battingStats,
    pitchingStats,
    games,
    summary
  };
}

app.get('/api/teams', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM TEAMS ORDER BY TeamName');
    res.json(rows.map(row => ({
      teamId: row.TeamID,
      name: row.TeamName,
      level: row.TeamLevel,
      season: row.Season
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load teams' });
  }
});

app.get('/api/teams/:teamId/summary', async (req, res) => {
  try {
    const summary = await loadTeamSummary(req.params.teamId);
    if (!summary) return res.status(404).json({ error: 'Team not found' });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load team summary' });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const { name, level, season } = req.body;
    if (!name || !level || !season) {
      return res.status(400).json({ error: 'name, level, and season are required' });
    }

    const [result] = await db.query(
      'INSERT INTO TEAMS (TeamName, TeamLevel, Season) VALUES (?, ?, ?)',
      [name, level, season]
    );

    res.status(201).json({
      teamId: result.insertId,
      name,
      level,
      season
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

app.put('/api/teams/:teamId', async (req, res) => {
  try {
    const { name, level, season } = req.body;
    await db.query(
      'UPDATE TEAMS SET TeamName = ?, TeamLevel = ?, Season = ? WHERE TeamID = ?',
      [name, level, season, req.params.teamId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team' });
  }
});

app.delete('/api/teams/:teamId', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const teamId = req.params.teamId;
    await connection.beginTransaction();

    const [playerRows] = await connection.query('SELECT PlayerID FROM PLAYERS WHERE TeamID = ?', [teamId]);
    const playerIds = playerRows.map(row => row.PlayerID);

    if (playerIds.length) {
      await connection.query(`DELETE FROM BATTING_STATS WHERE PlayerID IN (${playerIds.map(() => '?').join(',')})`, playerIds);
      await connection.query(`DELETE FROM PITCHING_STATS WHERE PlayerID IN (${playerIds.map(() => '?').join(',')})`, playerIds);
      await connection.query(`DELETE FROM FIELDING_STATS WHERE PlayerID IN (${playerIds.map(() => '?').join(',')})`, playerIds);
      await connection.query(`DELETE FROM CATCHING_STATS WHERE PlayerID IN (${playerIds.map(() => '?').join(',')})`, playerIds);
      await connection.query(`DELETE FROM PLAYERS WHERE PlayerID IN (${playerIds.map(() => '?').join(',')})`, playerIds);
    }

    const [gameRows] = await connection.query(
      'SELECT GameID FROM GAMES WHERE HomeTeamID = ? OR AwayTeamID = ?',
      [teamId, teamId]
    );
    const gameIds = gameRows.map(row => row.GameID);

    if (gameIds.length) {
      await connection.query(`DELETE FROM BATTING_STATS WHERE GameID IN (${gameIds.map(() => '?').join(',')})`, gameIds);
      await connection.query(`DELETE FROM PITCHING_STATS WHERE GameID IN (${gameIds.map(() => '?').join(',')})`, gameIds);
      await connection.query(`DELETE FROM FIELDING_STATS WHERE GameID IN (${gameIds.map(() => '?').join(',')})`, gameIds);
      await connection.query(`DELETE FROM CATCHING_STATS WHERE GameID IN (${gameIds.map(() => '?').join(',')})`, gameIds);
      await connection.query(`DELETE FROM GAMES WHERE GameID IN (${gameIds.map(() => '?').join(',')})`, gameIds);
    }

    await connection.query('DELETE FROM TEAMS WHERE TeamID = ?', [teamId]);
    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Failed to delete team' });
  } finally {
    connection.release();
  }
});

app.post('/api/players', async (req, res) => {
  try {
    const {
      teamId,
      jerseyNumber,
      firstName,
      lastName,
      email,
      position,
      playerYear,
      batStance,
      throwStance,
      playerStatus
    } = req.body;

    if (!teamId || !jerseyNumber || !firstName || !lastName || !position || !playerYear || !batStance || !throwStance || !playerStatus) {
      return res.status(400).json({ error: 'Missing required player fields' });
    }

    const [result] = await db.query(
      `INSERT INTO PLAYERS
       (JerseyNumber, FirstName, LastName, Email, Position, PlayerYear, BatStance, ThrowStance, PlayerStatus, TeamID)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [jerseyNumber, firstName, lastName, email || '', position, playerYear, batStance, throwStance, playerStatus, teamId]
    );

    res.status(201).json({ playerId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player' });
  }
});

app.put('/api/players/:playerId', async (req, res) => {
  try {
    const {
      jerseyNumber,
      firstName,
      lastName,
      email,
      position,
      playerYear,
      batStance,
      throwStance,
      playerStatus,
      teamId
    } = req.body;

    await db.query(
      `UPDATE PLAYERS
       SET JerseyNumber = ?, FirstName = ?, LastName = ?, Email = ?, Position = ?, PlayerYear = ?, BatStance = ?, ThrowStance = ?, PlayerStatus = ?, TeamID = ?
       WHERE PlayerID = ?`,
      [jerseyNumber, firstName, lastName, email, position, playerYear, batStance, throwStance, playerStatus, teamId, req.params.playerId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player' });
  }
});

app.delete('/api/players/:playerId', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const playerId = req.params.playerId;
    await connection.beginTransaction();
    await connection.query('DELETE FROM BATTING_STATS WHERE PlayerID = ?', [playerId]);
    await connection.query('DELETE FROM PITCHING_STATS WHERE PlayerID = ?', [playerId]);
    await connection.query('DELETE FROM FIELDING_STATS WHERE PlayerID = ?', [playerId]);
    await connection.query('DELETE FROM CATCHING_STATS WHERE PlayerID = ?', [playerId]);
    await connection.query('DELETE FROM PLAYERS WHERE PlayerID = ?', [playerId]);
    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Failed to delete player' });
  } finally {
    connection.release();
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const { gameDate, gameLocation, homeScore, awayScore, homeTeamId, awayTeamId } = req.body;
    if (!gameDate || !gameLocation || homeScore === undefined || awayScore === undefined || !homeTeamId || !awayTeamId) {
      return res.status(400).json({ error: 'Missing required game fields' });
    }

    const [result] = await db.query(
      'INSERT INTO GAMES (GameDate, GameLocation, HomeScore, AwayScore, HomeTeamID, AwayTeamID) VALUES (?, ?, ?, ?, ?, ?)',
      [gameDate, gameLocation, homeScore, awayScore, homeTeamId, awayTeamId]
    );

    res.status(201).json({ gameId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game' });
  }
});

app.put('/api/games/:gameId', async (req, res) => {
  try {
    const { gameDate, gameLocation, homeScore, awayScore, homeTeamId, awayTeamId } = req.body;
    await db.query(
      'UPDATE GAMES SET GameDate = ?, GameLocation = ?, HomeScore = ?, AwayScore = ?, HomeTeamID = ?, AwayTeamID = ? WHERE GameID = ?',
      [gameDate, gameLocation, homeScore, awayScore, homeTeamId, awayTeamId, req.params.gameId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update game' });
  }
});

app.delete('/api/games/:gameId', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const gameId = req.params.gameId;
    await connection.beginTransaction();
    await connection.query('DELETE FROM BATTING_STATS WHERE GameID = ?', [gameId]);
    await connection.query('DELETE FROM PITCHING_STATS WHERE GameID = ?', [gameId]);
    await connection.query('DELETE FROM FIELDING_STATS WHERE GameID = ?', [gameId]);
    await connection.query('DELETE FROM CATCHING_STATS WHERE GameID = ?', [gameId]);
    await connection.query('DELETE FROM GAMES WHERE GameID = ?', [gameId]);
    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Failed to delete game' });
  } finally {
    connection.release();
  }
});

app.post('/api/games/:gameId/stats', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { playerId, batting, pitching, fielding, catching } = req.body;
    await connection.beginTransaction();

    if (batting) {
      await connection.query(
        `INSERT INTO BATTING_STATS
         (PlayerID, GameID, AtBats, Runs, Hits, Doubles, Triples, HomeRuns, RBIs, Walks, Strikeouts, StolenBases, HitByPitch, Sacrifice, BattingAverage, OnBasePercentage, SluggingPercentage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         AtBats = VALUES(AtBats), Runs = VALUES(Runs), Hits = VALUES(Hits), Doubles = VALUES(Doubles), Triples = VALUES(Triples), HomeRuns = VALUES(HomeRuns), RBIs = VALUES(RBIs), Walks = VALUES(Walks), Strikeouts = VALUES(Strikeouts), StolenBases = VALUES(StolenBases), HitByPitch = VALUES(HitByPitch), Sacrifice = VALUES(Sacrifice), BattingAverage = VALUES(BattingAverage), OnBasePercentage = VALUES(OnBasePercentage), SluggingPercentage = VALUES(SluggingPercentage)`,
        [
          playerId,
          req.params.gameId,
          batting.ab,
          batting.r,
          batting.h,
          batting.doubles,
          batting.triples,
          batting.hr,
          batting.rbi,
          batting.bb,
          batting.so,
          batting.sb,
          batting.hbp,
          batting.sac,
          batting.avg,
          batting.obp,
          batting.slg
        ]
      );
    }

    if (pitching) {
      await connection.query(
        `INSERT INTO PITCHING_STATS
         (PlayerID, GameID, InningsPitched, HitsAllowed, RunsAllowed, EarnedRuns, WalksAllowed, Strikeouts, HomeRunsAllowed, PitchCount, Strikes, Balls, Decision, PitcherStarted, WHIP)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         InningsPitched = VALUES(InningsPitched), HitsAllowed = VALUES(HitsAllowed), RunsAllowed = VALUES(RunsAllowed), EarnedRuns = VALUES(EarnedRuns), WalksAllowed = VALUES(WalksAllowed), Strikeouts = VALUES(Strikeouts), HomeRunsAllowed = VALUES(HomeRunsAllowed), PitchCount = VALUES(PitchCount), Strikes = VALUES(Strikes), Balls = VALUES(Balls), Decision = VALUES(Decision), PitcherStarted = VALUES(PitcherStarted), WHIP = VALUES(WHIP)`,
        [
          playerId,
          req.params.gameId,
          pitching.ip,
          pitching.h,
          pitching.r,
          pitching.er,
          pitching.bb,
          pitching.k,
          pitching.hr,
          pitching.pitches,
          pitching.strikes,
          pitching.balls || 0,
          pitching.decision,
          pitching.gs === '1' || pitching.gs === 1 || pitching.gs === true,
          pitching.whip || '0.000'
        ]
      );
    }

    if (fielding) {
      await connection.query(
        `INSERT INTO FIELDING_STATS
         (PlayerID, GameID, Position, Putouts, Assists, Errors, DoublePlays, FieldingPercentage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         Position = VALUES(Position), Putouts = VALUES(Putouts), Assists = VALUES(Assists), Errors = VALUES(Errors), DoublePlays = VALUES(DoublePlays), FieldingPercentage = VALUES(FieldingPercentage)`,
        [playerId, req.params.gameId, fielding.pos, fielding.po, fielding.a, fielding.e, fielding.dp, fielding.fp || '1.000']
      );
    }

    if (catching) {
      await connection.query(
        `INSERT INTO CATCHING_STATS
         (PlayerID, GameID, PassedBalls, StolenBasesAllowed, CaughtStealing)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         PassedBalls = VALUES(PassedBalls), StolenBasesAllowed = VALUES(StolenBasesAllowed), CaughtStealing = VALUES(CaughtStealing)`,
        [playerId, req.params.gameId, catching.pb, catching.sba, catching.cs]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Failed to save game stats' });
  } finally {
    connection.release();
  }
});

app.get('/api/games/:gameId/stats/:playerId', async (req, res) => {
  try {
    const { gameId, playerId } = req.params;

    const [battingRows] = await db.query(
      'SELECT * FROM BATTING_STATS WHERE GameID = ? AND PlayerID = ?',
      [gameId, playerId]
    );
    const [pitchingRows] = await db.query(
      'SELECT * FROM PITCHING_STATS WHERE GameID = ? AND PlayerID = ?',
      [gameId, playerId]
    );
    const [fieldingRows] = await db.query(
      'SELECT * FROM FIELDING_STATS WHERE GameID = ? AND PlayerID = ?',
      [gameId, playerId]
    );
    const [catchingRows] = await db.query(
      'SELECT * FROM CATCHING_STATS WHERE GameID = ? AND PlayerID = ?',
      [gameId, playerId]
    );

    res.json({
      batting: battingRows[0] || null,
      pitching: pitchingRows[0] || null,
      fielding: fieldingRows[0] || null,
      catching: catchingRows[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player game stats' });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Client', 'index.html'));
});

app.listen(port, () => {
  console.log(`Baseball project server running on port ${port}`);
});
