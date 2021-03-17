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

//const { v1: uuidv1} = require('uuidv1');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

const Constants = require('./constants.js');
var constants = new Constants();

//-----------------------------------------------
// Main menu
//-----------------------------------------------
async function MainMenu() {
    console.clear();
    console.log('Choose a feature area:');
    console.log('1) Copy operations');
    console.log('2) SAS operations');
    console.log('X) Exit');
    readline.question('Select an option: ', option => {
        console.log('You chose: ', option);
        readline.close();

        switch (option) {
            case "1":
                console.log('Run copy operations...');
                return true;

            case "2":
                console.log('Run SAS operations...');
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
async function main() {
    while (await MainMenu()){}
}

main().then(() => console.log('Done')).catch((ex) => console.log(ex.message));
