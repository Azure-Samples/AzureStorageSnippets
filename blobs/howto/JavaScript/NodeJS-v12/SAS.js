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

const { BlobServiceClient, ContainerClient } = require('@azure/storage-blob');
const { SASQueryParameters } = require('@azure/storage-blob');

const Constants = require('./constants.js');
var constants = new Constants();

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

class SAS {
    constructor () { }

    //<Snippet_ContainerSAS>
    // Create a service SAS for a blob container
    getContainerSasUri(containerClient, sharedKeyCredential, storedPolicyName) {
        const sasOptions = {
            containerName: containerClient.containerName,
            permissions: ContainerSASPermissions.parse("c")
        };

        if (storedPolicyName == null) {
            sasOptions.startsOn = new Date();
            sasOptions.expiresOn = new Date(new Date().valueOf() + 3600 * 1000);
        } else {
            sasOptions.identifier = storedPolicyName;
        }

        const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
        console.log(`SAS token for blob container is: ${sasToken}`);

        return `${containerClient.url}?${sasToken}`;
    }
    //</Snippet_ContainerSAS>

    //<Snippet_BlobSAS>
    // Create a service SAS for a blob
    getBlobSasUri(containerClient, blobName, sharedKeyCredential, storedPolicyName) {
        const sasOptions = {
            containerName: containerClient.containerName,
            blobName: blobName
        };

        if (storedPolicyName == null) {
            sasOptions.startsOn = new Date();
            sasOptions.expiresOn = new Date(new Date().valueOf() + 3600 * 1000);
            sasOptions.permissions = BlobSASPermissions.parse("r");
        } else {
            sasOptions.identifier = storedPolicyName;
        }

        const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
        console.log(`SAS token for blob is: ${sasToken}`);

        return `${containerClient.getBlockBlobClient(blobName).url}?${sasToken}`;
    }
    //</Snippet_BlobSAS>

    //-----------------------------------------------
    // SAS menu
    //-----------------------------------------------
    Menu() {
        console.clear();
        console.log('SAS scenario menu:');
        console.log('1) SAS for a container');
        console.log('2) SAS for a blob');
        console.log('X) Exit');

        readline.question('Select an option: ', (option) => {
            readline.close();

            switch (option) {
                case "1":
                    console.log('Get a container SAS...');
                    return true;
                case "2":
                    console.log('Get blob SAS...');
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
}

module.exports = SAS;