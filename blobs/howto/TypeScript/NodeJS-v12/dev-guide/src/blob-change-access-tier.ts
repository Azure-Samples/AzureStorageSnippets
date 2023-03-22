import {
  BlobGetPropertiesOptions,
  BlobSetTierOptions,
  BlobSetTierResponse,
  BlockBlobClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import { getBlobClientFromAccountAndKey } from './auth-get-client';
dotenv.config();

const containerName = `my-container`;
const blobName = `my-blob`;
const blockBlobClient: BlockBlobClient = getBlobClientFromAccountAndKey(
  containerName,
  blobName
);

//<Snippet_BlobChangeAccessTier>
async function main(blockBlobClient: BlockBlobClient): Promise<void> {
  const options: BlobGetPropertiesOptions = {};

  // Get current access tier
  const { errorCode, accessTier } = await blockBlobClient.getProperties(
    options
  );
  if (!errorCode) {
    console.log(`Current access tier: ${accessTier}`);
  }

  // 'Hot', 'Cool', or 'Archive'
  const newAccessTier = 'Cool';

  // Rehydrate priority: 'High' or 'Standard'
  const tierOptions: BlobSetTierOptions = {
    rehydratePriority: 'High'
  };

  const result: BlobSetTierResponse = await blockBlobClient.setAccessTier(
    newAccessTier,
    tierOptions
  );

  if (!result?.errorCode) {
    console.log(`Change to access was successful`);
  } else {
    console.log(result);
  }
}
//</Snippet_BlobChangeAccessTier>
main(blockBlobClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
