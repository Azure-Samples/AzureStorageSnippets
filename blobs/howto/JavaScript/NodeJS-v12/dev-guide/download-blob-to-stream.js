const { BlobServiceClient } = require('@azure/storage-blob');

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

// <snippet_downloadBlobAsStream>
async function downloadBlobAsStream(containerClient, blobName, writableStream) {

    const blobClient = await containerClient.getBlobClient(blobName);

    const downloadResponse = await blobClient.download();

    downloadResponse.readableStreamBody.pipe(writableStream);
}
// </snippet_downloadBlobAsStream>

async function main() {

    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
    );
    const containerClient = blobServiceClient.getContainerClient('sample-container');
    const blobName = 'sample-blob.txt';
    const localFilePath = path.join('filePath', 'fileName.txt');
    const writableStream = fs.createWriteStream(localFilePath, {
        encoding: 'utf-8',
        autoClose: true
    });

    // download blob to string
    await downloadBlobAsStream(containerClient, blobName, writableStream);

}
main()
    .then(() => console.log('done'))
    .catch((ex) => console.log(ex.message));
