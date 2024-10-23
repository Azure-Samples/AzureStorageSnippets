import {
  BlobServiceClient,
  BlockBlobClient,
  BlobGetTagsResponse,
  Tags
} from '@azure/storage-blob';

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <Snippet_getTags>
async function getBlobTags(
  blockBlobClient: BlockBlobClient
): Promise<Tags> {
  const getTagsResponse: BlobGetTagsResponse = await blockBlobClient.getTags();

  if (getTagsResponse.errorCode) throw Error(getTagsResponse.errorCode);

  // Tags: Record<string, string>
  const tags: Tags = getTagsResponse.tags;

  console.log(`tags for ${blockBlobClient.name}`);

  // Print out name/value pairs
  Object.keys(tags).map((tag) => console.log(`${[tag]}: ${tags[tag]}`));

  return tags;
}
// </Snippet_getTags>
// <Snippet_setTags>
async function setBlobTags(
  blockBlobClient: BlockBlobClient
): Promise<void> {
  // Set tags
  const tags: Tags = {
    'Sealed': 'false',
    'Content': 'image',
    'Date': '2022-07-18',
  };

  // Set tags
  const result = await blockBlobClient.setTags(tags);
  if (result.errorCode) throw Error(result.errorCode);
}
// </Snippet_setTags>

async function main(blobServiceClient): Promise<void> {
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Create blob client
  const blockBlobClient = containerClient.getBlockBlobClient('sample-blob.txt');

  // Set tags
  await setBlobTags(blockBlobClient);

  // Get tags
  await getBlobTags(blockBlobClient);
}

main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });