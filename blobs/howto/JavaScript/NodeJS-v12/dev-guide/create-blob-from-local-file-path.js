
const path = require('path');
const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function createBlobFromLocalPath(containerClient, blobName, localFileWithPath, uploadOptions){
  console.log(`creating blob ${blobName} from ${localFileWithPath}`);
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blockBlobClient.uploadFile(localFileWithPath, uploadOptions);

  if(uploadBlobResponse.errorCode) console.log(`${blobName} failed to upload from file: ${errorCode}`);
}

async function main(blobServiceClient){
 
    let blobs=[];

  // create container
  const timestamp = Date.now();
  const containerName = `createblobfromstring-${timestamp}`;
  console.log(`creating container ${containerName}`);
  const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName);

  if(containerCreateResponse.errorCode) console.log("container creation failed");

  // get fully qualified path of file
  // Create file `my-local-file.txt` in same directory as this file
  const localFileWithPath = path.join(__dirname, `my-local-file.txt`);

  // create 10 blobs with Promise.all
  for (let i=0; i<10; i++){

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

    blobs.push(createBlobFromLocalPath(containerClient, `${containerName}-${i}.txt`, localFileWithPath, uploadOptions));
  }
  await Promise.all(blobs);

}
main(client)
.then(() => console.log("done"))
.catch((ex) => console.log(ex.message));
