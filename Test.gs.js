// This is a home-made test runner "main" function.
function runTests() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Tests");
  runTest(snapshotTest, sheet.getRange(1, 1));
}

// Tests should return true for success and false for failure, or throw an error with a message explaining the failure.
function runTest(test, outputCell) {
  let result;
  let failureReason;
  try {
    result = test();
  } catch (error) {
    result = false;
    failureReason = error.message;
  }
  if (result) {
    outputCell.setBackground("90EE90");
    outputCell.setValue("passed 💖")
  } else {
    outputCell.setBackground("red");
    outputCell.setFontColour("");
    outputCell.setValue("passed 💖")
  }
}

// This is a snapshot test from a real comp night. It checks that the "Finals (generated)" tab gets cleared, then filled out
// so that it ends up identical to the "Finals (expected)" tab.
function snapshotTest() {
  clear();
  let before = tabContentMatches("Finals (generated)", "Finals (expected)");
  score();
  let after = tabContentMatches("Finals (generated)", "Finals (expected)");
  if (before) {
    return false; // We weren't able to clean?
  }
  if (!after) {
    return false; // The results didn't match.
  }
  return true;
}
