//----------------------------------------------------------------------------------
// Microsoft Developer & Platform Evangelism
//
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, 
// EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES 
// OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
//----------------------------------------------------------------------------------
// The example companies, organizations, products, domain names,
// e-mail addresses, logos, people, places, and events depicted
// herein are fictitious.  No association with any real company,
// organization, product, domain name, email address, logo, person,
// places, or events is intended or should be inferred.
//----------------------------------------------------------------------------------

//----------------------------------------------------------------------------------
// Update package.json to keep the required versions current.
//
// Run the following npm command from a console prompt in this directory
// to install the required libraries:
// npm install
//
// Use the following command to run this test app:
// node app.js
//
// Due to the asynchronous nature of Node.js, this menu system doesn't work as
// intended. Run individual scenario files (i.e SAS.js) to test code.
//
//----------------------------------------------------------------------------------

const SAS = require('./SAS.js');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

//-----------------------------------------------
// Main menu
//-----------------------------------------------
function MainMenu() {
    console.clear();
    console.log('Choose a feature area:');
    console.log('1) SAS operations');
    console.log('X) Exit');

    readline.question('Select an option: ', (option) => {
        readline.close();

        switch (option) {
            case "1":
                console.log('Run SAS operations...');
                sas = new SAS();
                sas.Menu();
                return true;
            case "x":
            case "X":
                console.log('Exit...');
                return false;
            default:
                console.log('default...');
                return true;
        }
    });
}

//-----------------------------------------------
// main - program entry point
//-----------------------------------------------
function main() {
    try {
        while (MainMenu()){ }
    }
    catch (ex) {
        console.log(ex.message);
    }
}

main();