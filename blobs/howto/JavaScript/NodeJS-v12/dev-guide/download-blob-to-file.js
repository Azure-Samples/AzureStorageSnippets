const { BlobServiceClient } = require('@azure/storage-blob');

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

const path = require('path');
require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

// <snippet_downloadBlobToFile>
async function downloadBlobToFile(containerClient, blobName, localFilePath) {

    const blobClient = containerClient.getBlobClient(blobName);
    
    await blobClient.downloadToFile(localFilePath);
}
// </snippet_downloadBlobToFile>

async function main() {
    // Create service client from DefaultAzureCredential
    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
    );

    const containerClient = blobServiceClient.getContainerClient('sample-container');
    const blobName = 'sample-blob.txt';

    const localFilePath = path.join('path/to/file', 'fileName.txt');

    // download blob to string
    await downloadBlobToFile(containerClient, blobName, localFilePath)

}
main()
    .then(() => console.log('done'))
    .catch((ex) => console.log(ex.message));
