function fetchCanvasAssignments() {
  var token = "Bearer YOUR_API_TOKEN"; // Replace with your Canvas API access token
  
  // Define courses and their respective API URLs
  var courses = [
    {id: "YOUR_COURSE_ID", name: "COURSE_NAME"},
    {id: "YOUR_COURSE_ID", name: "COURSE_NAME"},
    {id: "YOUR_COURSE_ID", name: "COURSE_NAME"},
    {id: "YOUR_COURSE_ID", name: "COURSE_NAME"}
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

  // Add headers to the "Summary" sheet, now with Points and Completed column
  summarySheet.appendRow(["Assignment Name", "Due Date (MM/DD/YYYY)", "Course", "Points", "Completed", "Day of the Week"]);

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

    // Add headers to the course-specific sheet, now with Points and Completed column
    courseSheet.appendRow(["Assignment Name", "Due Date (MM/DD/YYYY)", "Course", "Points", "Completed", "Day of the Week"]);

    // Fetch assignments from Canvas API, including handling pagination
    fetchAllAssignments(canvasUrl, token, function(assignments) {
      var courseAssignments = []; // Store course-specific assignments for sorting

      assignments.forEach(function(assignment) {
        if (assignment.due_at) {
          var assignmentDate = new Date(assignment.due_at);
          var formattedDate = formatDate(assignmentDate);
          var points = assignment.points_possible || "N/A"; // Get points possible or "N/A" if not available
          var completed = assignment.has_submitted_submissions ? "Yes" : "No"; // Check if assignment is submitted
          courseAssignments.push([assignment.name, formattedDate, course.name, points, completed, ""]);

          allAssignments.push({
            name: assignment.name,
            dueDate: assignmentDate,
            course: course.name,
            points: points,
            completed: completed
          });
        }
      });

      // Separate past-due and upcoming assignments
      var currentDate = new Date();
      var upcomingAssignments = courseAssignments.filter(function(a) {
        return new Date(a[1]) >= currentDate;
      });
      var pastDueAssignments = courseAssignments.filter(function(a) {
        return new Date(a[1]) < currentDate;
      });

      // Sort upcoming assignments by due date
      upcomingAssignments.sort(function(a, b) {
        return new Date(a[1]) - new Date(b[1]);
      });

      // Add past-due assignments to the bottom
      pastDueAssignments.sort(function(a, b) {
        return new Date(a[1]) - new Date(b[1]);
      });
      var sortedAssignments = upcomingAssignments.concat(pastDueAssignments);

      // Batch write sorted assignments to course-specific sheet
      if (sortedAssignments.length > 0) {
        courseSheet.getRange(2, 1, sortedAssignments.length, 6).setValues(sortedAssignments);

        // Batch highlight past due / upcoming assignments and set the day of the week
        highlightCells(courseSheet, sortedAssignments);
      }
    });
  });

  // Sort all assignments by due date for the summary sheet
  allAssignments.sort(function(a, b) {
    return a.dueDate - b.dueDate;
  });

  // Separate past-due and upcoming assignments for the summary sheet
  var upcomingAssignmentsSummary = allAssignments.filter(function(a) {
    return a.dueDate >= new Date();
  });
  var pastDueAssignmentsSummary = allAssignments.filter(function(a) {
    return a.dueDate < new Date();
  });

  // Prepare the summary data for batch writing
  var sortedSummaryData = upcomingAssignmentsSummary.concat(pastDueAssignmentsSummary).map(function(assignment) {
    return [assignment.name, formatDate(assignment.dueDate), assignment.course, assignment.points, assignment.completed, ""];
  });

  // Batch write all assignments to the summary sheet
  if (sortedSummaryData.length > 0) {
    summarySheet.getRange(2, 1, sortedSummaryData.length, 6).setValues(sortedSummaryData);

    // Batch highlight past due / upcoming assignments in the summary sheet
    highlightCells(summarySheet, sortedSummaryData);
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
  currentDate.setHours(0, 0, 0, 0); // Set the current time to midnight for accurate comparison

  var oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(currentDate.getDate() + 7);
  oneWeekFromNow.setHours(23, 59, 59, 999); // Ensure the end of the week is considered for "within a week"

  for (var i = 0; i < data.length; i++) {
    var assignmentDate = new Date(data[i][1]);
    assignmentDate.setHours(0, 0, 0, 0); // Set the assignment time to midnight for accurate comparison

    var rowRange = sheet.getRange(i + 2, 1, 1, 5); // For highlighting cells (including Points and Completed columns)
    var dayOfWeekCell = sheet.getRange(i + 2, 6); // For setting the day of the week

    // Highlight past due assignments in red
    if (assignmentDate < currentDate) {
      rowRange.setBackground("red").setFontColor("white");
    }
    // Highlight assignments due today or within a week in green and set the day of the week
    else if (assignmentDate >= currentDate && assignmentDate <= oneWeekFromNow) {
      rowRange.setBackground("green").setFontColor("white");
      var dayOfWeek = getDayOfWeek(assignmentDate);
      dayOfWeekCell.setValue(dayOfWeek); // Set the day of the week for green-highlighted assignments
    }
  }
}
