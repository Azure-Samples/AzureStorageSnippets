//<Snippet_Dependencies>
const { BlobServiceClient, generateAccountSASQueryParameters , AccountSASPermissions, AccountSASServices ,AccountSASResourceTypes, StorageSharedKeyCredential, SASProtocol } = require('@azure/storage-blob');
require('dotenv').config()
//</Snippet_Dependencies>

//<Snippet_EnvironmentVariables>
const constants = {
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
    sasToken: undefined // to be filled in after it is created
};
const sharedKeyCredential = new StorageSharedKeyCredential(
    constants.accountName,
    constants.accountKey
);
//</Snippet_EnvironmentVariables>

//<Snippet_UseSas>
async function getProperties() {

    // Use SAS token to create authenticated connection to Blob Service
    const blobServiceClient = new BlobServiceClient(
        `https://${constants.accountName}.blob.core.windows.net${(constants.sasToken[0] === '?' ? constants.sasToken : `?${constants.sasToken}`)}`
    );

    // Get Blob Service properties
    const blobServicePropertiesResponse = await blobServiceClient.getProperties();

    // Display Blob Service properties
    console.log(`Properties: ${JSON.stringify(blobServicePropertiesResponse)}`);
}
//<Snippet_UseSas>

//<Snippet_GetSas>
async function createAccountSas() {

    const sasOptions = {

        services: AccountSASServices.parse("btqf").toString(),          // blobs, tables, queues, files
        resourceTypes: AccountSASResourceTypes.parse("sco").toString(), // service, container, object
        permissions: AccountSASPermissions.parse("rwdlacupi"),          // all permissions
        protocol: SASProtocol.Https,
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + (10 * 60 * 1000)),   // 10 minutes
    };

    const sasToken = generateAccountSASQueryParameters(
        sasOptions,
        sharedKeyCredential 
    ).toString();

    constants.sasToken = sasToken;
}
//</Snippet_GetSas>

//<Snippet_AsyncBoilerplate>
async function main() {

    await createAccountSas();
    await getProperties();
}

main()
    .then(() => {
        console.log(`done`);
    }).catch((ex) => {
        console.log(`Error: ${ex.message}`)
    });
//</Snippet_AsyncBoilerplate>
