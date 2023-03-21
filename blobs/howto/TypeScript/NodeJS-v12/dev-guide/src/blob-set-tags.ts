import {
  BlobGetTagsResponse,
  BlockBlobClient,
  Tags
} from '@azure/storage-blob';

// <Snippet_getTags>
export async function getBlobTags(
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
export async function setBlobTags(
  blockBlobClient: BlockBlobClient,
  tags: Tags
): Promise<void> {
  // Set tags
  const result = await blockBlobClient.setTags(tags);
  if (result.errorCode) throw Error(result.errorCode);

  console.log(`tags set for ${blockBlobClient.name}`);
}
// </Snippet_setTags>
