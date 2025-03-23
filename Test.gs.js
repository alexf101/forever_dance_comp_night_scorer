// This is a home-made test runner "main" function.
function runTests() {
  const tr = new TestRunner();
  tr.runTest(snapshotTest);
}

class TestRunner {
  constructor() {
    this.app = SpreadsheetApp.getActiveSpreadsheet();
    this.testOutputSheet = this.app.getSheetByName("Tests");
    this.i = 4;
  }

  runTest(test) {  
    const cell = this.testOutputSheet.getRange(this.i += 1, 1)
    cell.clear();
    cell.setValue("Running test...");
    this._runTest(test, cell);
  }
  // Tests should return true for success and false for failure, or throw an error with a message explaining the failure.
  _runTest(test, outputCell) {
    let result;
    let failureReason;
    try {
      result = test.bind(this).call();
    } catch (error) {
      result = false;
      failureReason = error.message;
    }
    if (result) {
      outputCell.setBackground("#90EE90");
      outputCell.setValue("passed 💖")
    } else {
      outputCell.setBackground("red");
      outputCell.setFontColor("white");
      if (failureReason) {
        outputCell.setValue("failed 😳: " + failureReason)
      } else {
        outputCell.setValue("failed 😳")
      }
    }
  }

  // Returns a string describing the first observed mismatch if any, otherwise null.
  findFirstMismatch(sheet1Name, sheet2Name) {
    var sheet1 = this.app.getSheetByName(sheet1Name);
    var sheet2 = this.app.getSheetByName(sheet2Name);

    if (!sheet1) {
      return "Sheet '" + sheetName1 + "' not found.";
    }
    if (!sheet2) {
      return "Sheet '" + sheetName2 + "' not found.";
    }

    var data1 = sheet1.getDataRange().getValues();
    var data2 = sheet2.getDataRange().getValues();

    if (data1.length !== data2.length) {
      return "Sheet row count mismatch: " + data1.length + " vs " + data2.length;
    }

    for (var i = 0; i < data1.length; i++) {
      if (data1[i].length !== data2[i].length) {
        return "Row " + (i + 1) + " column count mismatch: " + data1[i].length + " vs " + data2[i].length;
      }
      for (var j = 0; j < data1[i].length; j++) {
        if (data1[i][j] !== data2[i][j]) {
          return "Mismatch at row " + (i + 1) + ", column " + (j + 1) + ": '" + data1[i][j] + "' vs '" + data2[i][j] + "'";
        }
      }
    }
    return null;
  }
}

// This is a snapshot test from a real comp night. It checks that the "Finals (generated)" tab gets cleared, then filled out
// so that it ends up identical to the "Finals (expected)" tab.
function snapshotTest() {
  clear();
  let before = this.findFirstMismatch("Finals (generated)", "Finals (expected)");
  score();
  let after = this.findFirstMismatch("Finals (generated)", "Finals (expected)");
  if (before === null) {
    throw new Error("Initial condition not met; after cleaning the sheets still matched!");
  }
  if (after !== null) {
    throw new Error("Found mismatch after scoring: " + after);
  }
  return true;
}

