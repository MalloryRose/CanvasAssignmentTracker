# Canvas Assignment Tracker

This Canvas Assignment Tracker is a Google Apps Script that retrieves assignment data from Canvas LMS via API and organizes the information into Google Sheets. It helps users track assignments from multiple courses, showing their due dates, points possible, and completion status. The script automatically highlights past-due assignments and upcoming assignments due within a week.

## Features

- **Retrieve Assignments**: Fetch assignments from Canvas LMS for multiple courses.
- **Sorting & Filtering**: Assignments are automatically sorted by due date.
- **Highlighting**:
  - Past-due assignments are highlighted in red.
  - Upcoming assignments due within a week are highlighted in green.
- **Summary Sheet**: A consolidated view of assignments across all courses.
- **Course-Specific Sheets**: Individual sheets for each course with detailed assignment information.
- **Auto Day of the Week**: Automatically adds the day of the week for assignments due within the next 7 days.

## How It Works

1. **Canvas API**: The script makes authenticated API calls to Canvas to retrieve assignments for each course.
2. **Google Sheets Integration**: Data is organized into a "Summary" sheet and individual course sheets.
3. **Highlighting**: The script highlights assignments based on their due date and completion status.
4. **Batch Processing**: Assignments are fetched in bulk (up to 100 per request), and pagination is handled to retrieve all assignments for a course.
5. **Custom Columns**: Points possible, submission status, and day of the week are displayed for each assignment.

## How to Use

### 1. Pre-requisites
- You need access to your Canvas LMS account.
- You'll also need an API key from Canvas (see the "Installation" section).
- The Google Apps Script will be linked to your Google Sheets.

### 2. Steps to Update & Use the Script
1. **Open Google Sheets**: Create a new or open an existing Google Sheets document.
2. **Go to Extensions**: Navigate to `Extensions` > `Apps Script`.
3. **Paste the Code**: Copy and paste the provided code into the script editor.
4. **Update the API Key**: 
    - Find the line: `var token = "Bearer YOUR_API_KEY_HERE";`
    - Replace `"YOUR_API_KEY_HERE"` with your actual Canvas API token.
5. **Add Course Information**: 
    - Update the `courses` array in the script with your course IDs and names. 
    ```js
    var courses = [
      {id: "COURSE_ID_1", name: "Course Name 1"},
      {id: "COURSE_ID_2", name: "Course Name 2"},
      ...
    ];
    ```
6. **Save the Script**: Click the disk icon or `File` > `Save`.
7. **Run the Script**: Click the `Run` button (the play icon) in the toolbar.
8. **Authorize Access**: If prompted, allow the script to access your Google Sheets.
9. **View Results**: The "Summary" sheet will contain all assignments, and individual course sheets will display course-specific assignment data.

### 3. Updating Assignments
- Whenever you want to update the assignments, simply run the script again by clicking the `Run` button.

## Installation

### 1. Get Your Canvas API Token
- Log in to your Canvas account.
- Navigate to `Account` > `Settings`.
- Scroll down to `Approved Integrations`.
- Click `+ New Access Token`, and generate your API key.
- Copy the generated API key.

### 2. Install the Script
- Open a new Google Sheets document.
- Go to `Extensions` > `Apps Script`.
- Replace any existing code with the provided Canvas Assignment Tracker code.
- Update the API key in the script (see the "How to Use" section).

### 3. Run the Script
- Save the script and run it.
- You may need to authorize the script to access your Google Sheets the first time you run it.

---

That's it! Now you can track your Canvas assignments directly in Google Sheets with this simple and efficient script.
