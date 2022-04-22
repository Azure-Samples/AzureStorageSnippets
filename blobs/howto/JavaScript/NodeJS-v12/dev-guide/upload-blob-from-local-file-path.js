
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

// containerName: string
// blobName: string, includes file extension if provided
// localFileWithPath: fully qualified path and file name
// uploadOptions: {
//   metadata: { reviewer: 'john', reviewDate: '2022-04-01' }, 
//   tags: {project: 'xyz', owner: 'accounts-payable'}
// }
async function createBlobFromLocalPath(containerClient, blobName, localFileWithPath, uploadOptions){

  // create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // upload file to blob storage
  await blockBlobClient.uploadFile(localFileWithPath, uploadOptions);
  console.log(`${blobName} succeeded`);
}

async function main(blobServiceClient){
 
    let blobs=[];

  // create container
  const timestamp = Date.now();
  const containerName = `create-blob-from-local-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };

  const { containerClient } = await blobServiceClient.createContainer(containerName, containerOptions);
  console.log('container creation succeeded');

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
.then(() => console.log('done'))
.catch((ex) => console.log(ex.message));
