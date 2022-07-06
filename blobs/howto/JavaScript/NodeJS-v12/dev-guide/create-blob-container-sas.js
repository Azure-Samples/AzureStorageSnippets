const { setLogLevel } = require("@azure/logger");
setLogLevel("info");

//<Snippet_Dependencies>
const { newPipeline, ContainerClient,ContainerSASResourceTypes, AnonymousCredential, BlobServiceClient,generateBlobSASQueryParameters,ContainerSASPermissions, generateAccountSASQueryParameters , AccountSASPermissions, AccountSASServices ,AccountSASResourceTypes, StorageSharedKeyCredential, SASProtocol } = require('@azure/storage-blob');
require('dotenv').config()
//</Snippet_Dependencies>



//<Snippet_EnvironmentVariables>
const constants = {
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
    containerName: process.env.AZURE_STORAGE_BLOB_CONTAINER_NAME,
    sasToken: undefined // to be filled in after it is created
};
const sharedKeyCredential = new StorageSharedKeyCredential(
    constants.accountName,
    constants.accountKey
);
//</Snippet_EnvironmentVariables>

//<Snippet_UseSas>
async function getProperties(containerUrl) {

    // Use SAS token to create authenticated connection to Blob Service
    const containerClient = new ContainerClient(
        containerUrl,
        newPipeline(new AnonymousCredential())
    );

    // Get Blob Service properties
    const containerClientPropertiesResponse = await containerClient.getProperties();

    // Display Blob Service properties
    console.log(`Properties: ${JSON.stringify(containerClientPropertiesResponse)}`);
}
//<Snippet_UseSas>

//<Snippet_GetSas>
async function createContainerSas(containerName) {

    const sasOptions = {
        containerName,
        permissions: ContainerSASPermissions.parse("fmitracwdl"),          
        protocol: SASProtocol.Https,
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + (10 * 60 * 1000)),   // 10 minutes
    };
    console.log(sasOptions);

    const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        sharedKeyCredential 
    );

    constants.sasToken = sasToken;

    return sasToken;
}
//</Snippet_GetSas>

//<Snippet_AsyncBoilerplate>
async function main() {

    const blobServiceClient = new BlobServiceClient(
        `https://${constants.accountName}.blob.core.windows.net`,
        sharedKeyCredential
      );
    const containerClient = blobServiceClient.getContainerClient(constants.containerName);

    const sasToken = await createContainerSas(constants.containerName);
    const fixedSasToken = `${(sasToken[0] === '?') ? sasToken : `?${sasToken}`}`;

    const containerURL =  `${containerClient.url}${fixedSasToken}`;
    console.log(containerURL);
    
    await getProperties(containerURL);
}

main()
    .then(() => {
        console.log(`done`);
    }).catch((ex) => {
        console.log(`Error: ${ex.message}`)
    });
//</Snippet_AsyncBoilerplate>
