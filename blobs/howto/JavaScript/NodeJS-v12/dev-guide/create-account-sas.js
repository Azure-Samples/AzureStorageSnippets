//<Snippet_Dependencies>
const { 
    BlobServiceClient, 
    generateAccountSASQueryParameters, 
    AccountSASPermissions, 
    AccountSASServices,
    AccountSASResourceTypes,
    StorageSharedKeyCredential,
    SASProtocol 
} = require('@azure/storage-blob');
require('dotenv').config()
//</Snippet_Dependencies>

//<Snippet_EnvironmentVariables>
const constants = {
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY
};
const sharedKeyCredential = new StorageSharedKeyCredential(
    constants.accountName,
    constants.accountKey
);
//</Snippet_EnvironmentVariables>

//<Snippet_UseSas>
// example function of using sasToken
// sasToken is prepended with `?`
async function useSasToken(sasToken) {

    // Use SAS token to create authenticated connection to Blob Service
    const blobServiceClient = new BlobServiceClient(
        `https://${constants.accountName}.blob.core.windows.net${sasToken}`
    );

    // Get Blob Service properties
    const blobServicePropertiesResponse = await blobServiceClient.getProperties();

    // Display Blob Service properties
    console.log(`Success: Properties ${JSON.stringify(blobServicePropertiesResponse)}\n`);
}
//</Snippet_UseSas>

//<Snippet_GetSas>
async function createAccountSas() {

    const sasOptions = {

        services: AccountSASServices.parse("btqf").toString(),          // blobs, tables, queues, files
        resourceTypes: AccountSASResourceTypes.parse("sco").toString(), // service, container, object
        permissions: AccountSASPermissions.parse("rwdlacupi"),          // permissions
        protocol: SASProtocol.Https,
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + (10 * 60 * 1000)),   // 10 minutes
    };

    const sasToken = generateAccountSASQueryParameters(
        sasOptions,
        sharedKeyCredential 
    ).toString();

    console.log(`sasToken = '${sasToken}'\n`);

    // prepend sasToken with `?`
    return (sasToken[0] === '?') ? sasToken : `?${sasToken}`;
}
//</Snippet_GetSas>

//<Snippet_AsyncBoilerplate>
async function main() {

    const sasToken = await createAccountSas();

    await useSasToken(sasToken);
}

main()
    .then(() => {
        console.log(`done`);
    }).catch((ex) => {
        console.log(`Error: ${ex.message}`)
    });
//</Snippet_AsyncBoilerplate>
