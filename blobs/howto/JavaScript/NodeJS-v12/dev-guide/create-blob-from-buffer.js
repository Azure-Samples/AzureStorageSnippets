
const path = require('path');
const fs = require('fs').promises;
const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function createBlobFromLocalPath(containerClient, blobName, buffer, uploadOptions) {
  console.log(`creating blob ${blobName} from buffer`);
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  const uploadBlobResponse = await blockBlobClient.uploadData(buffer, uploadOptions);

  if (uploadBlobResponse.errorCode) console.log(`${blobName} failed to upload from file: ${errorCode}`);
}

async function main(blobServiceClient) {

  let blobs = [];

  // create container
  const timestamp = Date.now();
  const containerName = `createblobfrombuffer-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };

  const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName, containerOptions);

  if (containerCreateResponse.errorCode) console.log("container creation failed");

  // get fully qualified path of file
  // Create image file in same directory as this file
  const localFileWithPath = path.join(__dirname, `daisies.jpg`);

  // because no type is passed, open file as buffer
  const buffer = await fs.readFile(localFileWithPath);

  // create blobs with Promise.all
  // include the file extension
  for (let i = 0; i < 10; i++) {

    const uploadOptions = {

      // not indexed for searching
      metadata: {
        owner: 'PhillyProject'
      },

      // indexed for searching
      tags: {
        createdBy: 'YOUR-NAME',
        createdWith: `StorageSnippetsForDocs-${i}`,
        createdOn: (new Date()).toDateString()
      }
    }

    blobs.push(createBlobFromLocalPath(containerClient, `${containerName}-${i}.jpg`, buffer, uploadOptions));
  }
  await Promise.all(blobs);

}
main(client)
  .then(() => console.log("done"))
  .catch((ex) => console.log(ex.message));
