// Get container and blob URLs from their client objects.

const { BlobServiceClient } = require('@azure/storage-blob');
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

async function main(blobServiceClient) {
// <Storage-GetUrl>

    // create container
    const containerName = `con1-${Date.now()}`;
    const { containerClient } = await blobServiceClient.createContainer(containerName, {access: 'container'});

    // Display container name and its URL
    console.log(`created container:\n\tname=${containerClient.containerName}\n\turl=${containerClient.url}`);

    // create blob from string
    const blobName = `${containerName}-from-string.txt`;
    const blobContent = `Hello from a string`;
    const blockBlobClient = await containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(blobContent, blobContent.length);

    // Display Blob name and its URL 
    console.log(`created blob:\n\tname=${blobName}\n\turl=${blockBlobClient.url}`);

// </Storage-GetUrl>
}
main(client)
    .then(() => console.log('done'))
    .catch((ex) => console.log(ex.message));
