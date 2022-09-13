const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
require('dotenv').config();

// Connect without secrets to Azure
// Learn more: https://www.npmjs.com/package/@azure/identity#DefaultAzureCredential
const { DefaultAzureCredential } = require('@azure/identity');
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error('Azure Storage accountName not found');

const client = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  new DefaultAzureCredential()
);

// Connect with secrets to Azure
// const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
// if (!connString) throw Error('Azure Storage Connection string not found');
// const client = BlobServiceClient.fromConnectionString(connString);

async function createBlobFromString(containerClient, blobName, fileContentsAsString) {

    const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length);
    console.log(`created blob:\n\tname=${blobName}\n\turl=${blockBlobClient.url}`);
}

async function downloadBlobToFile(containerClient, blobName, fileNameWithPath) {

    const blobClient = await containerClient.getBlobClient(blobName);
    
    await blobClient.downloadToFile(fileNameWithPath);
    console.log(`download of ${blobName} success`);
}

async function main(blobServiceClient) {

    // create container
    const timestamp = Date.now();
    const containerName = `download-blob-to-file-${timestamp}`;
    console.log(`creating container ${containerName}`);
    const containerOptions = {
        access: 'container'
    }; 
    const { containerClient } = await blobServiceClient.createContainer(containerName, containerOptions);

    console.log(`created container:\n\tname=${containerClient.containerName}\n\turl=${containerClient.url}`);

    // create blob
    const blobTags = {
        createdBy: 'YOUR-NAME',
        createdWith: `StorageSnippetsForDocs-${timestamp}`,
        createdOn: (new Date()).toDateString()
    }

    const blobName = `${containerName}-from-string.txt`;
    const blobContent = `Hello from a string`;
    const newFileNameAndPath = path.join(__dirname, `${containerName}-downloaded-to-file.txt`);

    // create blob from string
    await createBlobFromString(containerClient, blobName, blobContent, blobTags);

    // download blob to string
    await downloadBlobToFile(containerClient, blobName, newFileNameAndPath)

}
main(client)
    .then(() => console.log('done'))
    .catch((ex) => console.log(ex.message));
