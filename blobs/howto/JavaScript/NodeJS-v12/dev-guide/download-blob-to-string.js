const { BlobServiceClient } = require('@azure/storage-blob');

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

// <snippet_downloadBlobToString>
async function downloadBlobToString(containerClient, blobName) {

    const blobClient = await containerClient.getBlobClient(blobName);

    const downloadResponse = await blobClient.download();

    const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
    console.log('Downloaded blob content:', downloaded.toString());
}

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
// </snippet_downloadBlobToString>

async function main() {

    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
    );
    const containerClient = blobServiceClient.getContainerClient('sample-container');
    const blobName = 'sample-blob.txt';

    // download blob to string
    await downloadBlobToString(containerClient, blobName)

}
main()
    .then(() => console.log('done'))
    .catch((ex) => console.log(ex.message));
