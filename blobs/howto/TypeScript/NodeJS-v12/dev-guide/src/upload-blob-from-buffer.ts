import { BlobServiceClient } from '@azure/storage-blob';
import { promises as fs } from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

// <Snippet_UploadBlob>
// containerName: string
// blobName: string, includes file extension if provided
// buffer: blob content
// uploadOptions: {
//    blockSize: destination block blob size in bytes,
//    concurrency: concurrency of parallel uploading - must be greater than or equal to 0,
//    maxSingleShotSize: blob size threshold in bytes to start concurrency uploading
//    metadata: { reviewer: 'john', reviewDate: '2022-04-01' },
//    tags: {project: 'xyz', owner: 'accounts-payable'}
//  }
async function createBlobFromBuffer(
  containerClient,
  blobName,
  buffer,
  uploadOptions
) {
  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Upload buffer
  await blockBlobClient.uploadData(buffer, uploadOptions);

  // do something with blob
  const getTagsResponse = await blockBlobClient.getTags();
  console.log(`tags for ${blobName} = ${JSON.stringify(getTagsResponse.tags)}`);
}
// </Snippet_UploadBlob>

async function main(blobServiceClient) {
  const blobs: Promise<void>[] = [];

  // create container
  const timestamp = Date.now();
  const containerName = `createblobfrombuffer-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };

  const { containerClient, containerCreateResponse } =
    await blobServiceClient.createContainer(containerName, containerOptions);

  if (containerCreateResponse.errorCode)
    console.log('container creation failed');

  // get fully qualified path of file
  // Create image file in same directory as this file
  const localFileWithPath = path.join(__dirname, `daisies.jpg`);

  // because no type is passed, open file as buffer
  const buffer = await fs.readFile(localFileWithPath, { encoding: 'utf-8' });

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
        createdOn: new Date().toDateString()
      }
    };

    blobs.push(
      createBlobFromBuffer(
        containerClient,
        `${containerName}-${i}.jpg`,
        buffer,
        uploadOptions
      )
    );
  }
  await Promise.all(blobs);
}
main(client)
  .then(() => console.log('done'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
