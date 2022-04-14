const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function createBlobFromString(client, blobName, fileContentsAsString, tags) {
    console.log(`creating blob ${blobName}`);
    const blockBlobClient = await client.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length);
}

async function main(blobServiceClient) {

    let blobs = [];

    // create container
    const timestamp = Date.now();
    const containerName = `createblobfromstring-${timestamp}`;
    console.log(`creating container ${containerName}`);
    const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName);

    if (containerCreateResponse.errorCode) console.log("container creation failed");

    const blobName = `append-blob-${timestamp}`;
    const options = {
        metadata: {
            owner: 'YOUR-NAME',
            project: 'append-blob-sample'
        }
    };
    const appendBlobClient = containerClient.getAppendBlobClient(blobName);
    await appendBlobClient.createIfNotExists(options);

    const maxBlockSize = appendBlobClient.appendBlobMaxAppendBlockBytes;
    let buffer = new buffer(maxBlockSize);

}
main(client)
    .then(() => console.log("done"))
    .catch((ex) => console.log(ex.message));
