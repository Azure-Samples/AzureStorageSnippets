// index.js
const { BlobServiceClient, ContainerClient, StorageSharedKeyCredential, ContainerSASPermissions, SASProtocol, generateBlobSASQueryParameters } = require('@azure/storage-blob');
require('dotenv').config()
const { setLogLevel } = require("@azure/logger");
setLogLevel("info");

const constants = {
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
    containerName: process.env.AZURE_STORAGE_BLOB_CONTAINER_NAME,
    sasToken: undefined,
    restVersion: "2021-06-08" // ref docs: 2016-05-31
};

const sharedKeyCredential = new StorageSharedKeyCredential(
    constants.accountName,
    constants.accountKey
);

// if you want access to all containers - create an account sas with only that service
async function getContainerPropertiesContainer() {
    const blobServiceUriWithSasToken = `https://${constants.accountName}.blob.core.windows.net/${constants.containerName}${(constants.sasToken[0] === '?' ? constants.sasToken : `?${constants.sasToken}`)}`;
    console.log(blobServiceUriWithSasToken);

    const containerClient = new ContainerClient(
        blobServiceUriWithSasToken
    );
    const serviceGetPropertiesResponse = await containerClient.getProperties();

    console.log(
        `Sas Permission: ${JSON.stringify(serviceGetPropertiesResponse)}`
    );
}
async function getContainerPropertiesB() {

    try {
        const blobServiceUriWithSasToken = `https://${constants.accountName}.blob.core.windows.net/${constants.containerName}${(constants.sasToken[0] === '?' ? constants.sasToken : `?${constants.sasToken}`)}`;

        console.log(blobServiceUriWithSasToken);

        const blobServiceClientB = new BlobServiceClient(
            blobServiceUriWithSasToken
        );

        const containerClient = blobServiceClientB.getContainerClient(constants.containerName);

        // 400 invalid uri
        const serviceGetPropertiesResponse = await containerClient.getProperties();

        console.log(
            `Sas Permission: ${JSON.stringify(serviceGetPropertiesResponse)}`
        );
    } catch (err) {
        console.log(err);
    }

}
async function createContainerSas(containerName) {

    const sasOptions = {
        containerName: containerName,
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + (60 * 60 * 1000)), // 1 hour
        permissions: ContainerSASPermissions.parse("racwdl"), // diff permissions - BlobSASPermissions.parse("racwd"),
    };

    const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        sharedKeyCredential // is this optional, when should I use it?
    ).toString();

    console.log(sasToken);
    constants.sasToken = sasToken;

    return sasToken;

}


async function main() {
    await createContainerSas(constants.containerName);
    await getContainerPropertiesContainer();
}

main()
    .then(() => {
        console.log(`done`);
    }).catch((ex) => {
        console.log(`Error: ${ex.message}`)
    });