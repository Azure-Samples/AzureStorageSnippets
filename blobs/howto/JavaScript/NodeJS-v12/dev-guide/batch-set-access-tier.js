require('dotenv').config();
const { StorageSharedKeyCredential, ContainerClient, BlobServiceClient, BlockBlobClient } = require('@azure/storage-blob');

/**
 * Batch blob requests require authorization on each subrequest.
 * Learn more: 
 * https://learn.microsoft.com/rest/api/storageservices/blob-batch#authorization
 */

// Credential secrets
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error('AZURE_STORAGE_ACCOUNT_NAME not found');

const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
if (!accountKey) throw Error('AZURE_STORAGE_ACCOUNT_KEY not found');

// Create credential - use credential for each action in batch
const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

// Set resource names
const timestamp = Date.now();
const containerName = `my-container-${timestamp}`;
const baseUrl = `https://${accountName}.blob.core.windows.net`;

// Container client
// assumes same container for all blobs in batch
const containerClient = new ContainerClient(
  `${baseUrl}/${containerName}`,
  sharedKeyCredential
);

// Create container, add blobs with default `Hot` tier
async function prepContainer(containerClient, blockBlobCount, blockBlobClients) {

  // Create container
  await containerClient.create();

  // Create block blob clients to be used in batch
  for (let i = 0; i < blockBlobCount; i++) {

    // Create blob client for new blob
    const tmpBlobName = `blob${i}`;
    const tmpBlockBlobClient = containerClient.getBlockBlobClient(tmpBlobName);
    blockBlobClients[i] = tmpBlockBlobClient;

    // Upload new blob
    const fileContents = `hello from sample ${i}`;
    await blockBlobClients[i].upload(fileContents, fileContents.length);

    // Check blob tier default is `Hot`
    const resp = await blockBlobClients[i].getProperties();
    console.log(`[${i}] access tier ${resp.accessTier}`);
  }
}

//<Snippet_BatchChangeAccessTier>
async function main(containerClient) {

  // Prep array
  const blockBlobCount = 3;
  const blockBlobClients = new Array(blockBlobCount);

  // Create container and blobs in `Hot` tier
  await prepContainer(containerClient, blockBlobCount, blockBlobClients);

  // Blob batch client and batch
  const containerScopedBatchClient = containerClient.getBlobBatchClient();
  const blobBatch = containerScopedBatchClient.createBatch();

  // Assemble batch to set tier to `Cool` tier
  for (let i = 0; i < blockBlobCount; i++) {
    await blobBatch.setBlobAccessTier(blockBlobClients[i].url, sharedKeyCredential, "Cool", {});
  }

  // Submit batch request and verify response
  const resp = await containerScopedBatchClient.submitBatch(blobBatch, {});
  console.log(`Requested ${blockBlobCount}, batched ${resp.subResponses.length}, success ${resp.subResponsesSucceededCount}, failure ${resp.subResponsesFailedCount}`);

  // Examine each batch item
  for (let i = 0; i < blockBlobCount; i++) {

    // Check blob tier set properly
    const resp2 = await blockBlobClients[i].getProperties();
    console.log(`[${i}] access tier ${resp2.accessTier}, status ${resp.subResponses[i].status}, message ${resp.subResponses[i].statusMessage}`)
  }
}
//</Snippet_BatchChangeAccessTier>
main(containerClient)
  .then(() => console.log('done'))
  .catch((ex) => console.log(`Exception: ${ex.message}`));
