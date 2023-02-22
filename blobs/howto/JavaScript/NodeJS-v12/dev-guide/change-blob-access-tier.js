const { StorageSharedKeyCredential, BlockBlobClient } = require('@azure/storage-blob');
require('dotenv').config();

// Credential secrets
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error('AZURE_STORAGE_ACCOUNT_NAME not found');

const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
if (!accountKey) throw Error('AZURE_STORAGE_ACCOUNT_KEY not found');

// Create credential
const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

// Set resource names
const containerName = `my-container`;
const blobName = `my-blob`;
const baseUrl = `https://${accountName}.blob.core.windows.net`;

// create blob from BlockBlobClient
const blockBlobClient = new BlockBlobClient(
  `${baseUrl}/${containerName}/${blobName}`,
  sharedKeyCredential
);
//<Snippet_BatchChangeAccessTier>
async function main(blockBlobClient) {

  // Get current access tier
  const { accessTier } = await blockBlobClient.getProperties();
  console.log(`Current access tier: ${accessTier}`);

  // 'Hot', 'Cool', or 'Archive'
  const newAccessTier = 'Cool';

  // Rehydrate priority: 'High' or 'Standard'
  const rehydratePriority = 'High';

  const result = await blockBlobClient.setAccessTier(
    newAccessTier,
    { rehydratePriority }
  );

  if (result?.errorCode == undefined) {
    console.log(`Change to access was successful`);
  } else {
    console.log(result);
  }
}
//</Snippet_BatchChangeAccessTier>
main(blockBlobClient)
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
