function fetchCanvasAssignments() {
    var token = "Bearer 1016~Q9XGYF7e3UYTue2ARF7Ku6n9FnrPKvQCvUWBHMTGk4ZArwTh2M3VvhtA8rmrDMQJ"; // Replace with your Canvas API access token
    
    // Define courses and their respective API URLs
    var courses = [
      {id: "521656", name: "Design 1"},
      {id: "519261", name: "AI & Neuro"},
      {id: "508237", name: "Operating Systems"},
      {id: "514246", name: "Digital Design"}
    ];
    
    // Get the active spreadsheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
    // Clear or create a "Summary" sheet
    var summarySheet = spreadsheet.getSheetByName("Summary");
    if (!summarySheet) {
      summarySheet = spreadsheet.insertSheet("Summary");
    } else {
      summarySheet.clear(); // Clear existing data
    }
  
    // Add headers to the "Summary" sheet
    summarySheet.appendRow(["Assignment Name", "Due Date (MM/DD/YYYY)", "Course", "Day of the Week"]);
  
    // Array to store all assignments for sorting later
    var allAssignments = [];
  
    // Loop through each course
    courses.forEach(function(course) {
      var canvasUrl = `https://ufl.instructure.com/api/v1/courses/${course.id}/assignments?per_page=100`;
  
      // Create or get a sheet for the course
      var courseSheet = spreadsheet.getSheetByName(course.name);
      if (!courseSheet) {
        courseSheet = spreadsheet.insertSheet(course.name);
      } else {
        courseSheet.clear(); // Clear existing data
      }
  
      // Add headers to the course-specific sheet
      courseSheet.appendRow(["Assignment Name", "Due Date (MM/DD/YYYY)", "Course", "Day of the Week"]);
  
      // Fetch assignments from Canvas API, including handling pagination
      fetchAllAssignments(canvasUrl, token, function(assignments) {
        var courseAssignments = []; // Store course-specific assignments for sorting
  
        assignments.forEach(function(assignment) {
          if (assignment.due_at) {
            var assignmentDate = new Date(assignment.due_at);
            var formattedDate = formatDate(assignmentDate);
            courseAssignments.push([assignment.name, formattedDate, course.name, ""]);
  
            allAssignments.push({
              name: assignment.name,
              dueDate: assignmentDate,
              course: course.name
            });
          }
        });
  
        // Sort course assignments by due date
        courseAssignments.sort(function(a, b) {
          return new Date(a[1]) - new Date(b[1]);
        });
  
        // Batch write course-specific assignments
        if (courseAssignments.length > 0) {
          courseSheet.getRange(2, 1, courseAssignments.length, 4).setValues(courseAssignments);
  
          // Batch highlight past due / upcoming assignments and set the day of the week for green cells
          highlightCells(courseSheet, courseAssignments);
        }
      });
    });
  
    // Sort all assignments by due date for the summary sheet
    allAssignments.sort(function(a, b) {
      return a.dueDate - b.dueDate;
    });
  
    // Prepare the summary data for batch writing
    var summaryData = allAssignments.map(function(assignment) {
      return [assignment.name, formatDate(assignment.dueDate), assignment.course, ""];
    });
  
    // Batch write all assignments to the summary sheet
    if (summaryData.length > 0) {
      summarySheet.getRange(2, 1, summaryData.length, 4).setValues(summaryData);
  
      // Batch highlight past due / upcoming assignments in the summary sheet
      highlightCells(summarySheet, summaryData);
    }
  }
  
  // Helper function to fetch all assignments across multiple pages
  function fetchAllAssignments(url, token, callback, assignments = []) {
    var options = {
      "method" : "get",
      "headers" : {
        "Authorization" : token
      }
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var newAssignments = JSON.parse(response.getContentText());
    assignments = assignments.concat(newAssignments);
  
    // Check if there is a "next" link for pagination
    var linkHeader = response.getHeaders()['Link'];
    if (linkHeader && linkHeader.includes('rel="next"')) {
      var nextUrl = linkHeader.match(/<([^>]+)>;\s*rel="next"/)[1];
      fetchAllAssignments(nextUrl, token, callback, assignments);
    } else {
      callback(assignments);
    }
  }
  
  // Helper function to format the date as MM/DD/YYYY
  function formatDate(date) {
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var year = date.getFullYear();
    return month + "/" + day + "/" + year;
  }
  
  // Helper function to get the day of the week from a date
  function getDayOfWeek(date) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }
  
  // Helper function to highlight cells and populate the "Day of the Week" column
  function highlightCells(sheet, data) {
    var currentDate = new Date();
    var oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(currentDate.getDate() + 7);
  
    for (var i = 0; i < data.length; i++) {
      var assignmentDate = new Date(data[i][1]);
      var rowRange = sheet.getRange(i + 2, 1, 1, 3); // For highlighting cells
      var dayOfWeekCell = sheet.getRange(i + 2, 4); // For setting the day of the week
  
      // Highlight past due assignments in red
      if (assignmentDate < currentDate) {
        rowRange.setBackground("red").setFontColor("white");
      }
      // Highlight assignments due within a week in green and set the day of the week
      else if (assignmentDate >= currentDate && assignmentDate <= oneWeekFromNow) {
        rowRange.setBackground("green").setFontColor("white");
        var dayOfWeek = getDayOfWeek(assignmentDate);
        dayOfWeekCell.setValue(dayOfWeek); // Set the day of the week
      }
    }
  }
  