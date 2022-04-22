const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function createBlobFromString(blobServiceClient, containerName, blobName, blobContent) {

    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

    // upload blob
    await blockBlobClient.upload(blobContent, blobContent.length);
    console.log(`created blob ${blobName}`);
}

async function copyBlob(
    blobServiceClient, 
    sourceBlobContainer, 
    sourceBlobName, 
    destinationBlobContainer,
    destinationBlobName,) {

    // create container clients
    const sourceContainerClient = blobServiceClient.getContainerClient(sourceBlobContainer); 
    const destinationContainerClient = blobServiceClient.getContainerClient(destinationBlobContainer);   
    
    // create blob clients
    const sourceBlobClient = await sourceContainerClient.getBlobClient(sourceBlobName);
    const destinationBlobClient = await destinationContainerClient.getBlobClient(destinationBlobName);

    // start copy
    const copyPoller = await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
    console.log('start copy from A to B');

    // wait until done
    await copyPoller.pollUntilDone();
}
async function copyThenAbortBlob(
    blobServiceClient, 
    sourceBlobContainer, 
    sourceBlobName, 
    destinationBlobContainer,
    destinationBlobName,) {

    // create container clients
    const sourceContainerClient = blobServiceClient.getContainerClient(sourceBlobContainer); 
    const destinationContainerClient = blobServiceClient.getContainerClient(destinationBlobContainer);   
    
    // create blob clients
    const sourceBlobClient = await sourceContainerClient.getBlobClient(sourceBlobName);
    const destinationBlobClient = await destinationContainerClient.getBlobClient(destinationBlobName);

    // start copy
    const copyPoller = await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
    console.log('start copy from A to C');

    // cancel operation after starting it -
    // sample file may be too small to be canceled.
    try {
      await copyPoller.cancelOperation();
      console.log('request to cancel copy from A to C');

      // calls to get the result now throw PollerCancelledError
      await copyPoller.getResult();
    } catch (err) {
      if (err.name === 'PollerCancelledError') {
        console.log('The copy was cancelled.');
      }
    }
}

async function main(blobServiceClient) {

    // create container
    const timestamp = Date.now();
    const containerNameA = `copy-blob-a-${timestamp}`;
    const containerNameB = `copy-blob-b-${timestamp}`;

    const containerOptions = {
        access: 'container'
    }; 

    await blobServiceClient.createContainer(containerNameA, containerOptions);
    console.log(`created container ${containerNameA}`);
    
    await blobServiceClient.createContainer(containerNameB, containerOptions);
    console.log(`created container ${containerNameB}`);

    const blobNameA = `a-from-string.txt`;
    const blobNameB = `b-from-string.txt`;
    const blobNameC = `c-from-string.txt`;
    const blobContent = `Hello from a string`;

    // create blob from string
    await createBlobFromString(blobServiceClient, containerNameA, blobNameA, blobContent);

    // copy blob A to B
    await copyBlob(blobServiceClient, containerNameA, blobNameA, containerNameB, blobNameB);

    // copy blob A to C then abort
    await copyThenAbortBlob(blobServiceClient, containerNameA, blobNameA, containerNameB, blobNameC);
}
main(client)
    .then(() => console.log('done'))
    .catch((ex) => console.log(ex.message));
