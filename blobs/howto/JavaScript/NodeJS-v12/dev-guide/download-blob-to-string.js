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
    if(uploadBlobResponse.errorCode)console.log(`upload of ${blobName} failed`);
}

async function downloadBlobAsStreamConvertToString(client, blobName) {
    console.log(`downloading blob ${blobName}`);
    const blobClient = await client.getBlobClient(blobName);
    const downloadResponse = await blobClient.download();
    if(downloadResponse.errorCode)console.log(`download of ${blobName} failed`);
    const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
    console.log("Downloaded blob content:", downloaded.toString());
}

async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}

async function main(blobServiceClient) {

    let blobs = [];

    // create container
    const timestamp = Date.now();
    const containerName = `download-blob-to-string-${timestamp}`;
    console.log(`creating container ${containerName}`);
    const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName);

    if (containerCreateResponse.errorCode) console.log("container creation failed");

    // create blob
    const blobTags = {
        createdBy: 'YOUR-NAME',
        createdWith: `StorageSnippetsForDocs-${timestamp}`,
        createdOn: (new Date()).toDateString()
    }

    const blobName = `${containerName}-from-string.txt`;
    const blobContent = `Hello from a string`;

    // create blob from string
    const resultUpload = await createBlobFromString(containerClient, blobName, blobContent, blobTags);

    // download blob to string
    const resultDownload = await downloadBlobAsStreamConvertToString(containerClient, blobName)

}
main(client)
    .then(() => console.log("done"))
    .catch((ex) => console.log(ex.message));
