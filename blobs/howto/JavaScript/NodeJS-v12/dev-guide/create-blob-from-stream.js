const fs = require('fs');
const path = require('path');
const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function createBlobFromLocalPath(containerClient, blobName, readableStream, uploadOptions){

  // Create blob client
  console.log(`creating blob ${blobName} from stream`);
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Set streaming options
  const bufferSize = 4 * 1024 * 1024;
  const maxConcurrency = 20;

  // Upload stream
  const uploadBlobResponse = await blockBlobClient.uploadStream(readableStream, bufferSize, maxConcurrency, uploadOptions);
  
  // Check for errors or get tags from Azure
  if(uploadBlobResponse.errorCode) {
    console.log(`${blobName} failed to upload from file: ${errorCode}`);
  } else {
    const getTagsResponse = await blockBlobClient.getTags();
    console.log(`tags for ${blobName} = ${JSON.stringify(getTagsResponse.tags)}`);
  }
}

async function main(blobServiceClient){
 
    let blobs=[];

  // create container
  const timestamp = Date.now();
  const containerName = `create-blob-from-stream-${timestamp}`;
  console.log(`creating container ${containerName}`);
  const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName);

  if(containerCreateResponse.errorCode) console.log("container creation failed");

  // get fully qualified path of file
  // Create file `my-local-file.txt` in same directory as this file
  const localFileWithPath = path.join(__dirname, `my-local-file.txt`);



  const readableStream = fs.createReadStream(localFileWithPath);

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

  // create blobs with Promise.all
  for (let i=0; i<9; i++){
    blobs.push(createBlobFromLocalPath(containerClient, `${containerName}-${i}.txt`, readableStream, uploadOptions));
  }
  await Promise.all(blobs);

  readableStream.destroy();

}
main(client)
.then(() => console.log("done"))
.catch((ex) => console.log(ex.message));
