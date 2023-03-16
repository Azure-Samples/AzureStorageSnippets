import { BlockBlobClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import { getBlobClientFromAccountAndKey } from './auth-get-client';
dotenv.config();

const containerName = `my-container`;
const blobName = `my-blob`;
const blockBlobClient: BlockBlobClient = getBlobClientFromAccountAndKey(
  containerName,
  blobName
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

  const result = await blockBlobClient.setAccessTier(newAccessTier, {
    rehydratePriority
  });

  if (result?.errorCode == undefined) {
    console.log(`Change to access was successful`);
  } else {
    console.log(result);
  }
}
//</Snippet_BatchChangeAccessTier>
main(blockBlobClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
