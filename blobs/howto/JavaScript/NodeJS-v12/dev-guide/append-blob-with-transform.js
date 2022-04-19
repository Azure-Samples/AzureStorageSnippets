const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

const transform = async (chunk, done) => {
    
    // see what is in the artificially
    // small chunk
    console.log(chunk);

    // upload a chunk as an appendBlob
    await appendBlobClient.appendBlock(chunk, chunk.length);

    done(chunk, null);
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

    const blobName = `append-blob-${timestamp}`;
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

    console.log(`Created appendBlob`);

    // fetch log as stream
    // get fully qualified path of file
    // Create file `my-local-file.txt` in same directory as this file
    const localFileWithPath = path.join(__dirname, `my-local-file.txt`);

    // highWaterMark: artificially low value to demonstrate appendBlob
    // encoding: just to see the chunk as it goes by
    const streamOptions = { highWaterMark: 20, encoding: 'utf-8' }

    // create readable stream
    const readableStream = fs.createReadStream(localFileWithPath, streamOptions);

    // pipe log in chunks to appendBlob
    readableStream.pipe(transform).pipe(appendBlob);

    // seal a day's log
    appendBlobClient.seal();
}
main(blobServiceClient)
    .then(() => console.log("done"))
    .catch((ex) => console.log(ex.message));
