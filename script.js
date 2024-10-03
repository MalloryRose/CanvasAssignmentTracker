function fetchCanvasAssignments() {
    // Prompt user for API token
    var token = Browser.inputBox("Enter your Canvas API Token:");
  
    // Prompt user for course IDs and names
    var courseIdsInput = Browser.inputBox("Enter course IDs separated by commas (e.g., 521656,519261):");
    var courseNamesInput = Browser.inputBox("Enter course names separated by commas (e.g., Design 1, AI & Neuro):");
    
    var courseIds = courseIdsInput.split(',').map(function(id) { return id.trim(); });
    var courseNames = courseNamesInput.split(',').map(function(name) { return name.trim(); });
  
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Clear existing rows
    sheet.clear();
  
    // Add headers
    sheet.appendRow(["Assignment Name", "Due Date", "Course", "Day of Week"]);
  
    // Loop through each course ID to fetch assignments
    courseIds.forEach(function(courseId, index) {
      var canvasUrl = "https://ufl.instructure.com/api/v1/courses/" + courseId + "/assignments"; // Replace with your Canvas domain
  
      // Call Canvas API
      var options = {
        "method": "get",
        "headers": {
          "Authorization": "Bearer " + token
        }
      };
  
      try {
        var response = UrlFetchApp.fetch(canvasUrl, options);
        var assignments = JSON.parse(response.getContentText());
  
        // Populate Google Sheet with assignment data
        assignments.forEach(function(assignment) {
          var dueDate = new Date(assignment.due_at);
          var dayOfWeek = Utilities.formatDate(dueDate, Session.getScriptTimeZone(), "EEEE");
          sheet.appendRow([assignment.name, Utilities.formatDate(dueDate, Session.getScriptTimeZone(), "MM/dd/yyyy"), courseNames[index], dayOfWeek]);
        });
      } catch (error) {
        Logger.log("Error fetching assignments for course ID " + courseId + ": " + error);
      }
    });
  
    // Call function to format assignments based on due dates
    formatAssignments(sheet);
  }
  
  function formatAssignments(sheet) {
    var range = sheet.getDataRange();
    var values = range.getValues();
    
    // Highlight past due assignments in red and upcoming assignments due in a week in green
    var today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for comparison
    
    for (var i = 1; i < values.length; i++) { // Skip header row
      var dueDate = new Date(values[i][1]);
      
      // Check if past due
      if (dueDate < today) {
        sheet.getRange(i + 1, 1, 1, 4).setBackground("red");
      }
      // Check if due within a week
      else if (dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        sheet.getRange(i + 1, 1, 1, 4).setBackground("green");
      }
    }
  }
  