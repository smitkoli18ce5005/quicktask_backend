# quicktask_backend

## Steps to run the code
* Download and install nodejs version 20.9.0 
    * https://nodejs.org/en/download
      OR 
    * https://nodejs.org/dist/v20.9.0/node-v20.9.0-x64.msi
* Run express backend
    * Install all dependencies
        * npm install
    * Create .env file in main directory and add below keys of back4apps in files
        * PARSE_APP_ID=<YOUR_PARSE_APP_ID>
        * PARSE_JS_KEY=<YOUR_PARSE_JS_KEY>
        * PARSE_MASTER_KEY=<YOUR_PARSE_MASTER_KEY>
    * Run the application on port 3000
        * node app.js