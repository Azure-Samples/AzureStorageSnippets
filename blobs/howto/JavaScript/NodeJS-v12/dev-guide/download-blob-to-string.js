const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function createBlobFromString(client, blobName, fileContentsAsString) {

    const blockBlobClient = await client.getBlockBlobClient(blobName);

    await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length);
    console.log(`created blob ${blobName}`);
}

async function downloadBlobToString(containerClient, blobName) {

    const blobClient = await containerClient.getBlobClient(blobName);

    const downloadResponse = await blobClient.download();

    const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
    console.log('Downloaded blob content:', downloaded.toString());
}

async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
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

    console.log('container creation success');

    // create blob
    const blobTags = {
        createdBy: 'YOUR-NAME',
        createdWith: `StorageSnippetsForDocs-${timestamp}`,
        createdOn: (new Date()).toDateString()
    }

    const blobName = `${containerName}-from-string.txt`;
    const blobContent = `Hello from a string`;

    // create blob from string
    await createBlobFromString(containerClient, blobName, blobContent, blobTags);

    // download blob to string
    await downloadBlobToString(containerClient, blobName)

}
main(client)
    .then(() => console.log('done'))
    .catch((ex) => console.log(ex.message));
