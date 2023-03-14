import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
import { Transform } from 'stream';

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

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
// containerName: string
// blobName: string, includes file extension if provided
// readableStream: Node.js Readable stream
// uploadOptions: {
//    metadata: { reviewer: 'john', reviewDate: '2022-04-01' },
//    tags: {project: 'xyz', owner: 'accounts-payable'},
//  }
async function createBlobFromReadStream(
  containerClient,
  blobName,
  readableStream,
  uploadOptions
) {
  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Size of every buffer allocated, also
  // the block size in the uploaded block blob.
  // Default value is 8MB
  const bufferSize = 4 * 1024 * 1024;

  // Max concurrency indicates the max number of
  // buffers that can be allocated, positive correlation
  // with max uploading concurrency. Default value is 5
  const maxConcurrency = 20;

  // use transform per chunk - only to see chunck
  const transformedReadableStream = readableStream.pipe(myTransform);

  // Upload stream
  await blockBlobClient.uploadStream(
    transformedReadableStream,
    bufferSize,
    maxConcurrency,
    uploadOptions
  );

  // do something with blob
  const getTagsResponse = await blockBlobClient.getTags();
  console.log(`tags for ${blobName} = ${JSON.stringify(getTagsResponse.tags)}`);
}
// </Snippet_UploadBlob>
async function main(blobServiceClient) {
  // create container
  const timestamp = Date.now();
  const containerName = `create-blob-from-stream-${timestamp}`;
  console.log(`creating container ${containerName}`);
  const { containerClient } = await blobServiceClient.createContainer(
    containerName
  );

  console.log('container creation succeeded');

  // get fully qualified path of file
  // Create file `my-local-file.txt` in same directory as this file
  const localFileWithPath = path.join(__dirname, `my-local-file.txt`);

  // highWaterMark: artificially low value to demonstrate appendBlob
  // encoding: just to see the chunk as it goes by
  const bufferEncoding: BufferEncoding = 'utf-8';
  const streamOptions = { highWaterMark: 20, encoding: bufferEncoding };

  const readableStream = fs.createReadStream(localFileWithPath, streamOptions);

  const uploadOptions = {
    // not indexed for searching
    metadata: {
      owner: 'PhillyProject'
    },

    // indexed for searching
    tags: {
      createdBy: 'YOUR-NAME',
      createdWith: `StorageSnippetsForDocs`,
      createdOn: new Date().toDateString()
    }
  };

  await createBlobFromReadStream(
    containerClient,
    `${containerName}.txt`,
    readableStream,
    uploadOptions
  );
}
main(client)
  .then(() => console.log('done'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
