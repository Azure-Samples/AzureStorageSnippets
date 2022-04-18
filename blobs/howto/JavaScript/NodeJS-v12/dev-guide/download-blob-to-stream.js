const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function createBlobFromString(client, blobName, fileContentsAsString, tags) {
    console.log(`creating blob ${blobName}`);
    const blockBlobClient = await client.getBlockBlobClient(blobName);
    await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length);
    console.log(`upload of ${blobName} succeed`);
}
// customer hands SDK a readable stream 
// SDK doesn't return writable stream
async function downloadBlobAsStreamWriteToFile(client, blobName, writableStream) {
    console.log(`downloading blob ${blobName}`);
    const blobClient = await client.getBlobClient(blobName);
    const downloadResponse = await blobClient.download();
    console.log(`download of ${blobName} succeeded`);
    downloadResponse.readableStreamBody.pipe(writableStream);
}

async function main(blobServiceClient) {

    // create container
    const timestamp = Date.now();
    const containerName = `download-blob-to-string-${timestamp}`;
    console.log(`creating container ${containerName}`);
    
    const containerOptions = {
        access: 'container'
    };  
    const { containerClient } = await blobServiceClient.createContainer(containerName, containerOptions);

    console.log("container creation success");

    // create blob
    const blobTags = {
        createdBy: 'YOUR-NAME',
        createdWith: `StorageSnippetsForDocs-${timestamp}`,
        createdOn: (new Date()).toDateString()
    }

    const blobName = `${containerName}-from-string.txt`;
    const blobContent = `Hello from a string`;
    const localFileNameWithPath = path.join(__dirname, blobName);
    const writableStream = fs.createWriteStream(localFileNameWithPath, {encoding: 'utf-8', autoClose: true});

    // create blob from string
    await createBlobFromString(containerClient, blobName, blobContent, blobTags);

    // download blob to string
    await downloadBlobAsStreamWriteToFile(containerClient, blobName, writableStream);

}
main(client)
    .then(() => console.log("done"))
    .catch((ex) => console.log(ex.message));
