// Azure Storage dependency
const { BlockBlobClient } = require("@azure/storage-blob");

// For development environment - include environment variables
require("dotenv").config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error("Azure Storage accountName not found");

// Container and blob must exist prior to running this script
// SAS token must have READ permissions on blob that haven't expired
const containerName = `test`;
const blobName = `my-text-file.txt`;

// Create SAS URL
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

// Utility function to convert a Node.js Readable stream into a Buffer
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => {
          chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
          resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
  });
}

async function main(){

  // Create a blob client from SAS token
  const client = new BlockBlobClient(sasUrl);

  // Get blob url
  console.log(`blob.url: ${client.url}`);

  // Download file contents
  const result = await client.download();
  const content = await streamToBuffer(result.readableStreamBody);

  // Get results
  return content.toString();
}

main().then((result) => console.log(result)).catch((ex) => console.log(ex.message));
