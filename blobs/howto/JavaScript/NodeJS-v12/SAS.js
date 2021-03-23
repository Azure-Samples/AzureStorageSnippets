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
// Run the following npm command from a console prompt in this directory
// to install the required Azure Blob Storage client libraries:
//
// npm install
//
// Update package.json to keep the required versions current.
//
// Use the following command to run this test app
//
// node SAS.js
//----------------------------------------------------------------------------------

const { 
    BlobServiceClient,
    StorageSharedKeyCredential,
    ContainerSASPermissions,
    BlobSASPermissions,
    generateBlobSASQueryParameters } = require('@azure/storage-blob');

const Constants = require('./constants.js');
constants = new Constants();

const accountUrl = 'https://' + constants.accountName + '.blob.core.windows.net';

// Use StorageSharedKeyCredential with storage account and account key
// StorageSharedKeyCredential is only available in Node.js runtime, not in browsers
const sharedKeyCredential = new StorageSharedKeyCredential(constants.accountName, constants.accountKey);

const blobSvcClient = new BlobServiceClient(accountUrl, sharedKeyCredential);

const containerClient = blobSvcClient.getContainerClient(constants.containerName);

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

//<Snippet_ContainerSAS>
// Create a service SAS for a blob container
function getContainerSasUri(containerClient, sharedKeyCredential, storedPolicyName) {
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
function getBlobSasUri(containerClient, blobName, sharedKeyCredential, storedPolicyName) {
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
function Menu() {
    console.clear();
    console.log('SAS scenario menu:');
    console.log('1) SAS for a container');
    console.log('2) SAS for a blob');
    console.log('X) Exit');

    readline.question('Select an option: ', (option) => {
        readline.close();

        switch (option) {
            case "1":
                containerSasUri = getContainerSasUri(containerClient, sharedKeyCredential, null);
                console.log('Container SAS URI: ', containerSasUri);
                return true;
            case "2":
                blobSasUri = getBlobSasUri(containerClient, constants.blobName, sharedKeyCredential, null);
                console.log('Blob SAS URI:', blobSasUri);
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
        while (Menu()){ }
    }
    catch (ex) {
        console.log(ex.message);
    }
}

main();