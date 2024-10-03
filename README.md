# Canvas Assignments Tracker

A Google Apps Script project that fetches assignments and their due dates from Canvas, organizes them in Google Sheets, and highlights assignments based on their due dates. This project helps students keep track of their assignments across multiple courses efficiently.

## Features

- Fetches assignments from multiple Canvas courses based on user input.
- Organizes assignments in Google Sheets with due dates formatted as `MM/DD/YYYY`.
- Highlights past due assignments in red.
- Highlights assignments due within a week in green.
- Displays the day of the week for assignments due soon.
- Automatically updates the assignment list when run.

## How It Works

1. The user is prompted to enter their Canvas API token, course IDs, and course names.
2. The script fetches assignments for the specified courses and populates a Google Sheet.
3. Assignments are highlighted based on their due dates:
   - Past due assignments are highlighted in red.
   - Assignments due within a week are highlighted in green.
4. The day of the week for each assignment is displayed in the sheet.

## Course IDs and Names

The project allows users to input their own course IDs and names. For example:

- **Course ID**: `521656`
- **Course Name**: `Design 1`

## Installation

To use this project, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/repository-name.git
   cd repository-name
