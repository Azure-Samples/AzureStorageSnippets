const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

async function appendToBlob(containerClient, timestamp) {

    // name of blob
    const blobName = `append-blob-${timestamp}`;

    // add metadata to blob
    const options = {
        metadata: {
            owner: 'YOUR-NAME',
            project: 'append-blob-sample'
        }
    };

    // get appendBlob client
    const appendBlobClient = containerClient.getAppendBlobClient(blobName);

    // create blob to save logs
    await appendBlobClient.createIfNotExists(options);
    console.log(`Created appendBlob ${blobName}`);

    // fetch log as stream
    // get fully qualified path of file
    // Create file `my-local-file.txt` in same directory as this file
    const localFileWithPath = path.join(__dirname, `my-local-file.txt`);

    // read file
    const contents = await fs.readFile(localFileWithPath, 'utf8');

    // send content to appendBlob
    // such as a log file on hourly basis
    await appendBlobClient.appendBlock(contents, contents.length);

    // add more iterations of appendBlob to continue adding
    // to same blob
    // ...await appendBlobClient.appendBlock(contents, contents.length);

    // when done, seal a day's log to read-only
    await appendBlobClient.seal();
    console.log(`Sealed appendBlob ${blobName}`);
}

async function main(blobServiceClient) {

    // create container
    const timestamp = Date.now();
    const containerName = `append-blob-from-log-${timestamp}`;
    console.log(`creating container ${containerName}`);

    const containerOptions = {
        access: 'container'
    };

    // create a container
    const { containerClient } = await blobServiceClient.createContainer(containerName, containerOptions);

    await appendToBlob(containerClient, timestamp);

}
main(blobServiceClient)
    .then(() => console.log("done"))
    .catch((ex) => console.log(ex.message));
