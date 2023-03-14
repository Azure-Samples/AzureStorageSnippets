import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

// <Snippet_UploadBlob>
// containerClient: container client
// blobName: string, includes file extension if provided
// fileContentsAsString: blob content
// uploadOptions: {
//    metadata: { reviewer: 'john', reviewDate: '2022-04-01' },
//    tags: {project: 'xyz', owner: 'accounts-payable'}
//  }
async function createBlobFromString(
  containerClient,
  blobName,
  fileContentsAsString,
  uploadOptions
): Promise<void> {
  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Upload string
  await blockBlobClient.upload(
    fileContentsAsString,
    fileContentsAsString.length,
    uploadOptions
  );

  // do something with blob
  const getTagsResponse = await blockBlobClient.getTags();
  console.log(`tags for ${blobName} = ${JSON.stringify(getTagsResponse.tags)}`);
}
// </Snippet_UploadBlob>

async function main(blobServiceClient) {
  type TList = Promise<void>;
  const blobs: Promise<void>[] = [];

  // create container
  const timestamp = Date.now();
  const containerName = `createblobfromstring-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };
  const { containerClient } = await blobServiceClient.createContainer(
    containerName,
    containerOptions
  );

  console.log('container creation succeeded');

  // create 10 blobs with Promise.all
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

    const pCreateBlob = createBlobFromString(
      containerClient,
      `${containerName}-${i}.txt`,
      `Hello from a string ${i}`,
      uploadOptions
    );

    blobs.push(pCreateBlob);
  }
  await Promise.all<TList>(blobs);
}
main(client)
  .then(() => console.log('done'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
