# Prerequisites

  1. Install MongoDB Community Server 8 with default user
  2. Install NodeJS 22 with NPM

# Quick Start

  1. **OPTIONAL:** Configure the server port and MongoDB host variables in `.env` and `/src/frontend/src/app/environment.ts` files if necessary.
  2. Check [FontAwesome Icons](./docs/fontawesome-icons.md) to setup FontAwesome for the frontend icons to work.
  3. From the project root, run `npm run build` to build the frontend application.
  4. Run `npm start` to start the service on http://localhost:6002 (if configuration was not changed in step 1).

# Setup Auto-Startup

## MacOS

  1. Run **Automator** app
  2. Select **Application**
  3. Search for **Run Shell Script** and select it
  4. Write the following code inside the script (follow the instructions of comments):
      ```bash
      # Add the path to NodeJS installation in PATH
      # You can obtain the path from a terminal using "where node"
      export PATH=/opt/homebrew/bin:$PATH
      # Replace PATH_TO_REPO with the path to this repo on disk
      cd PATH_TO_REPO
      npm start
      ```
  5. Save the application on disk
  6. Go to **System Preferences / General / Login Items** and the created app.

## Windows

  1. Create `run.bat` at project root with the following content (follow the instructions of comments):
      ```bat
      REM Replace PATH_TO_REPO with the path to this repo on disk
      cd PATH_TO_REPO
      npm start
      ```
  2. Go to `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup`
  3. Create a file with `.vbs` extension with the following content (follow the instructions of comments):
      ```vbs
      'Replace PATH_TO_REPO with the path to this repo on disk
      CreateObject("Wscript.Shell").Run "PATH_TO_REPO\run.bat", 0, True
      ```

> The `run.bat` file will start the server and the `.vbs` file in startup directory will launch the `.bat` file while hiding the command line.

# Frontend Documentation

To build and serve Compodoc for the Angular project (frontend), run `npm run compodoc` from root directory and visit http://127.0.0.1:6060.