DEBUG = true

// This configuration tells us which columns have:
//   - Competitor information (name, level)
//   - Score given to that competitor by the judge
//   - Where to write out the calculated rank for each competitor
// It also tells us which row begins each heat. We don't generate
// the heats; this is all done by teachers and checked by Jena
// before the competition starts.

STAR_AND_ABOVE = {}  // Just a placeholder value
HEATS_ROWS = [
  {
    start: 5,
    end: 10
  },
  {
    start: 14,
    end: 19
  },
  {
    start: 23,
    end: 28
  },
  {
    start: 32,
    end: 37
  },
  {
    start: 41,
    end: 46
  },
  {
    start: 49,
    end: 54
  },
  {
    start: 57,
    end: 62
  },
  {
    start: 65,
    end: 70
  },
]
HEATS_CONFIG = [
  {
    "titles": ["Star+ Latin", "Star+ New Vogue", "Star+ Modern", "Star+ Street Latin"],
    "level": STAR_AND_ABOVE,
    "numInputCols": 10,
    "leaders": {
      "place": 1, // A
      "score": 2, // B
      "name": 3, // C
      "teacher": 4, // D
      "level": 5, // E
    },
    "followers": {
      "name": 6, // F
      "teacher": 7, // G
      "level": 8, // H
      "score": 9, // I
      "place": 10, // J
    },
    "heats": HEATS_ROWS,
  },
  {
    "titles": ["Silver Latin", "Silver New Vogue", "Silver Modern", "Silver Street Latin"],
    "level": "silver",
    "numInputCols": 8,
    "leaders": {
      "place": 1, // A
      "score": 2, // B
      "name": 3, // C
      "teacher": 4, // D
    },
    "followers": {
      "name": 5, // E
      "teacher": 6, // F
      "score": 7, // G
      "place": 8, // H
    },
    "heats": HEATS_ROWS,
  },
  {
    "titles": ["Gold Latin", "Gold New Vogue", "Gold Modern", "Gold Street Latin"],
    "level": "gold",
    "numInputCols": 8,
    "leaders": {
      "place": 1, // A
      "score": 2, // B
      "name": 3, // C
      "teacher": 4, // D
    },
    "followers": {
      "name": 5, // E
      "teacher": 6, // F
      "score": 7, // G
      "place": 8, // H
    },
    "heats": HEATS_ROWS,
  },
  {
    "titles": ["Bronze Latin", "Bronze New Vogue", "Bronze Modern", "Bronze Street Latin", "GV Latin", "GV New Vogue", "GV Modern", "GV Street Latin"],
    "numInputCols": 4,
    "leaders": {
      "name": 1, // A
      "teacher": 2, // B
    },
    "followers": {
      "name": 3, // C
      "teacher": 4, // D
    },
    "heats": [
      {
        start: 5,
        end: 10
      },
      {
        start: 14,
        end: 19
      },
      {
        start: 23,
        end: 28
      },
      {
        start: 32,
        end: 37
      },
      {
        start: 41,
        end: 46
      }
    ],
  }
]

FINALS_CONFIG = {
  styles: {
    latin: ["Star+ Latin", "Silver Latin", "Gold Latin"],
    modern: ["Star+ Modern", "Silver Modern", "Gold Modern"],
    street: ["Star+ Street Latin", "Silver Street Latin", "Gold Street Latin"],
    nv: ["Star+ New Vogue", "Silver New Vogue", "Gold New Vogue"],
  },
  progress_bar: {
    row: 6,
    col: 11 // K,
  },
  output_sheet: "Finals (generated)",
  output_locations: {
    latin: {
      row: 2,
      col: 1,
      title: "LATIN FINALS",
    },
    modern: {
      row: 26,
      col: 1,
      title: "MODERN FINALS",
    },
    street: {
      row: 2,
      col: 6,
      title: "STREET LATIN FINALS",
    },
    nv: {
      row: 26,
      col: 6,
      title: "NEW VOGUE FINALS",
    },
  }
}

// Calculates the top-left offset for each heat of a given final
function heatToRowCol(heatIndex) {
  if (heatIndex === 0) {
    return {
      row: 1,
      col: 0
    }
  } else if (heatIndex === 1) {
    return {
      row: 1,
      col: 2
    }
  } else if (heatIndex === 2) {
    return {
      row: 8,
      col: 0
    }
  } else if (heatIndex === 3) {
    return {
      row: 8,
      col: 2
    }
  } else if (heatIndex === 4) {
    return {
      row: 15,
      col: 0
    }
  } else if (heatIndex === 5) {
    return {
      row: 15,
      col: 2
    }
  } else {
    throw new Error("heatToRowCol not implemented for heat index " + heatIndex)
  }
}

function finalForSheet(sheet) {
  for (const [k, v] of Object.entries(FINALS_CONFIG.styles)) {
    // Ok, this is a bit gross algorithmically, but this is a tiny fixed size list, so there's no point optimising it!
    debugLog(v);
    if (v.includes(sheet)){
      return k;
    }
  }
  throw new Error("Not Found: " + sheet);
}

function debugLog(name, value) {
  if (!DEBUG) return;
  if (value == null) {
    value = "<null>";
  }
  Logger.log("DEBUG: %s = %s", name, value);
}

class Competitor {
  // Row is the row number we read this data from - useful when writing back a place.
  constructor(name, teacher, level, score, row) {
    this.name = name;
    this.teacher = teacher;
    this.level = level;
    this.score = parseFloat(score);
    this.row = row;
  }
  setIsLeader(isLeader) {
    this._isLeader = isLeader;
  }
  getIsLeader() {
    return this._isLeader;
  }
}

function setProgress(spreadsheet, msg) {
  const sheet = spreadsheet.getSheetByName(FINALS_CONFIG.output_sheet);
  sheet.getRange(FINALS_CONFIG.progress_bar.row, FINALS_CONFIG.progress_bar.col).setValue(msg);
}

function clearInputRows() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  spreadsheet.getSheets().forEach((sheet) => {
    const sheetName = sheet.getName();
    let configForSheet = HEATS_CONFIG.find((value) => value.titles.includes(sheetName));
    if (!configForSheet) {
      // Many sheets aren't heats; ignore those at this point.
      return;
    }
    configForSheet.heats.forEach(heat => {
      // sheet.getRange(heat.start - 1, configForSheet.followers.place).setTextStyle(SpreadsheetApp.newTextStyle().setForegroundColor('black').build());
      // sheet.getRange(heat.start - 1, configForSheet.leaders.place).setTextStyle(SpreadsheetApp.newTextStyle().setForegroundColor('black').build());
      // sheet.getRange(heat.start - 1, configForSheet.followers.place).setBackground('white');
      // sheet.getRange(heat.start - 1, configForSheet.leaders.place).setBackground('white');
      for (let row=heat.start; row<=heat.end; row++) {
        sheet.getRange(row, 1, 1, configForSheet.numInputCols).clearContent();
        // sheet.getRange(row, configForSheet.followers.place).setTextStyle(SpreadsheetApp.newTextStyle().setForegroundColor('black').build());
        // sheet.getRange(row, configForSheet.followers.place).setBackground('white');
        // sheet.getRange(row, configForSheet.leaders.place).setTextStyle(SpreadsheetApp.newTextStyle().setForegroundColor('black').build());
        // sheet.getRange(row, configForSheet.leaders.place).setBackground('white');
      }
    });
  });
}

// This is the main function. Don't change its name as it's referred to from the button in the sheet!
function score() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  debugLog("spreadsheet", spreadsheet.getName())
  setProgress(spreadsheet, "Scoring started! Reading scores...");
  const finalists = {};
  // Go through each tab
  spreadsheet.getSheets().forEach((sheet) => {
    const sheetName = sheet.getName();
    debugLog("sheet", sheetName);
    let configForSheet = HEATS_CONFIG.find((value) => value.titles.includes(sheetName));
    if (!configForSheet || !configForSheet.level) {
      // Many sheets aren't scored; ignore those at this point.
      return;
    }

    const leaders = [];
    const followers = [];
    configForSheet.heats.forEach(heat => {
      debugLog("heat", heat);
      for (let row=heat.start; row<=heat.end; row++) {
        let leader = readCompetitor(sheet, row, configForSheet.level, configForSheet.leaders);
        debugLog("LEADER", leader);
        if (leader !== null) {
          leader.setIsLeader(true);
          leaders.push(leader);
        }
        let follower = readCompetitor(sheet, row, configForSheet.level, configForSheet.followers);
        if (follower !== null) {
          follower.setIsLeader(false);
          followers.push(follower);
        }
      }
    });
    debugLog("followers", followers);
    debugLog("leaders", leaders);

    // Sort the lists by level and score, which will tell us who won each level.
    sortAndGradeWithLevels(followers);
    sortAndGradeWithLevels(leaders);

    debugLog("sorted followers", followers);
    debugLog("sorted leaders", leaders);

    // Now write back their places - note that the order is important here; by adding followers before leaders
    // we set it up so that future stable sorts will keep followers first in the finals. This is important
    // for teachers who both lead and follow and don't want to switch back and forth multiple times.
    for (follower of followers) {
      // TODO: Turn this on again when we get Jena to agree to an algorithm for assigning places after first.
      // Apparently we only do four places, and people are distributed between 1,2,3 and 4 according to a set
      // of rules that we don't yet understand, so we need to figure that out before we output a place.
      // sheet.getRange(follower.row, configForSheet.followers.place).setValue(follower.place);
    }
    for (leader of leaders) {
      // TODO: Ditto here.
      // sheet.getRange(leader.row, configForSheet.leaders.place).setValue(leader.place);
    }
    
    setProgress(spreadsheet, "Finished calculating places for " + sheetName);

    // And add the winners to the finalists list
    followers.concat(leaders).forEach(contestant => {
      if (contestant.place === 1) {
        const finalistsForSheet = finalists[finalForSheet(sheetName)]
        if (finalistsForSheet === undefined) {
            finalists[finalForSheet(sheetName)] = []
        }
        finalists[finalForSheet(sheetName)].push(contestant);
      }
    })
  });
  // The winners get written to a tab called "Finals".
  debugLog("finalists", finalists);
  writeFinals(spreadsheet, finalists);
  setProgress(spreadsheet, "Done generating heats for Finals! Feel free to make changes now if needed.");
}

function sortAndGradeWithLevels(competitorList) {
  competitorList.sort((a, b) => a.level.localeCompare(b.level) || b.score - a.score);
  let place = 0
  let currentLevel = null;
  let previousScore = -1;
  for (let competitor of competitorList) {
    if (competitor.level != currentLevel) {
      place = 0;
      currentLevel = competitor.level;
      previousScore = -1;
    }
    // Competitors who achieved the same score, receive the same place.
    // No matter how many competitors scored the same, the next place
    // awarded is only incremented by 1.
    if (competitor.score !== previousScore) {
      place += 1; // Places are 1-indexed.
      previousScore = competitor.score;
    }
    competitor.place = place;
  }
}

function readCompetitor(sheet, row, sheetLevel, competitorConfig) {
  const name = sheet.getRange(row, competitorConfig.name).getValue();
  const teacher = sheet.getRange(row, competitorConfig.teacher).getValue();
  let level = sheetLevel;
  if (sheetLevel === STAR_AND_ABOVE) {
    level = sheet.getRange(row, competitorConfig.level).getValue();
  }
  const score = sheet.getRange(row, competitorConfig.score).getValue();
  if (name && teacher && level && score && (score !== 'No mark')) {
      return new Competitor(
        name,
        teacher,
        level,
        score,
        row
      )
  }
  // We only want to consider complete entries; someone may have not danced or this event may not be scored.
  return null;
}

function writeFinals(spreadsheet, finalists) {
  const sheet = spreadsheet.getSheetByName(FINALS_CONFIG.output_sheet);
  for (const [style, outputLocation] of Object.entries(FINALS_CONFIG.output_locations)) {
    debugLog(style, outputLocation);
    sheet.getRange(outputLocation.row, outputLocation.col).setValue(
      outputLocation.title
    );
    if (!finalists[style]) {
      debugLog("No finalists for style", style);
      continue;
    }
    const heats = makeHeats(finalists[style]);
    debugLog("heats", heats);
    let rowsUsed = 0;
    heats.forEach((heat, heatIndex) => {
      const heatOffset = heatToRowCol(heatIndex);
      sheet.getRange(outputLocation.row + heatOffset.row, outputLocation.col + heatOffset.col).setValue("Heat " + (heatIndex + 1));
      heat.forEach((finalist, finalistIndex) => {
        sheet.getRange(outputLocation.row + heatOffset.row + finalistIndex + 1, outputLocation.col + heatOffset.col, 1, 2).setValues([
          [finalist.name, finalist.teacher]
        ])
      })
    })
  }
}

// This is a secondary "main" function. Don't change its name as it's referred to from the "clear" button in the sheet!
function clear() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(FINALS_CONFIG.output_sheet);
  for (const [style, outputLocation] of Object.entries(FINALS_CONFIG.output_locations)) {
    [0,1,2,3].forEach(heat => {
      const heatOffset = heatToRowCol(heat);
      [0,1,2,3,4].forEach(i => {
        sheet.getRange(outputLocation.row + heatOffset.row + i + 1, outputLocation.col + heatOffset.col, 1, 2).clearContent();
      })
    });
  }
  sheet.getRange(FINALS_CONFIG.progress_bar.row, FINALS_CONFIG.progress_bar.col).setValue("");
}

function makeHeats(finalists) {
  // Two-stage algorithm.
  // Stage 1. Which teacher has the most students? That's the number of heats; put them in every heat.
  // Stage 2. Spread the remaining teachers approximately evenly, ordering their dances by roles where they're a leader first.
  let byTeacher = Object.entries(Object.groupBy(finalists, f => f.teacher));
  byTeacher.sort((a, b) => b[1].length - a[1].length);
  debugLog("teacher with most students", byTeacher[0])
  debugLog("byteacher sorted", byTeacher)
  // Put students who are followers first within each teacher's list; this prevents
  // teachers who both lead and follow from having to switch multiple times.
  byTeacher.map(entry => entry[1].sort((a,b) => (a.getIsLeader() && 1 || -1) - (b.getIsLeader() && 1 || -1)));
  const heatCount = byTeacher[0][1].length;
  debugLog("heatCount", heatCount);
  const heats = new Array(heatCount).fill(null).map(() => []);
  // Put one of the first teacher's students in each heat
  for (let i=0; i<heats.length; i++) {
    heats[i].push(byTeacher[0][1][i]);
  }
  byTeacher = byTeacher.slice(1);
  const remainingStudentCount = byTeacher.reduce(((soFar, entry) => soFar + entry[1].length), 0);
  const avgExtraStudentsPerHeat = Math.ceil(remainingStudentCount / heatCount);
  debugLog('student target', avgExtraStudentsPerHeat);
  let currentHeat = 0;
  debugLog("byTeacher remaining teachers", byTeacher);
  while (true) {
    let foundAStudent = false;
    byTeacher.forEach((entry, index) => {
      let nextStudentForTeacher = entry[1].pop();
      if (nextStudentForTeacher) {
        // Is this heat full?
        if (heats[currentHeat].length > avgExtraStudentsPerHeat) {
          currentHeat += 1;
        }
        debugLog(`Adding student ${nextStudentForTeacher.name} with teacher ${nextStudentForTeacher.teacher} to heat`, currentHeat);
        foundAStudent = true;
        heats[currentHeat].push(nextStudentForTeacher);
      }
    });
    if (!foundAStudent) {
      break;
    }
  }
  return heats;
}