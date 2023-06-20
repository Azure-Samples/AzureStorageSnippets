import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Transform } from 'stream';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <Snippet_Transform>
// Transform stream
// Reasons to transform:
// 1. Sanitize the data - remove PII
// 2. Compress or uncompress
const myTransform = new Transform({
  transform(chunk, encoding, callback) {
    // see what is in the artificially
    // small chunk
    console.log(chunk);
    callback(null, chunk);
  },
  decodeStrings: false
});
// </Snippet_Transform>

// <Snippet_UploadBlob>
async function uploadBlobFromReadStream(
  containerClient: ContainerClient,
  blobName: string,
  readStream: fs.ReadStream
): Promise<void> {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadStream(readStream);
}
// </Snippet_UploadBlob>

// <Snippet_useUploadStream>
async function main(blobServiceClient): Promise<void> {
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath: string = path.join('file-path', 'sample-blob.txt');

  const readStream: fs.ReadStream = fs.createReadStream(localFilePath);

  await uploadBlobFromReadStream(
    containerClient,
    'sample-blob-from-stream.txt',
    readStream
  );
}
// </Snippet_useUploadStream>
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
