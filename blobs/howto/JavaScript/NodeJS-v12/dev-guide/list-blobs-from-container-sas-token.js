/** 
 * Best practice - use managed identity to avoid keys & connection strings
 * managed identity is implemented with @azure/identity's DefaultAzureCredential
 * 
 * The identity that the managed identity chain selects must have the 
 * correct roles applied in order to work correctly. 
 * 
 * For local development: add your personal identity on your resource group
 * az role assignment create --assignee "<your-username>" \
 *   --role "Storage Blob Data Contributor" \
 *   --resource-group "<your-resource-group-name>"
 **/

//const logger = require('@azure/logger');
//logger.setLogLevel('info');

//<Snippet_Dependencies>
const {
    DefaultAzureCredential
} = require('@azure/identity');
const {
    ContainerClient,
    BlobServiceClient,
    ContainerSASPermissions,
    generateBlobSASQueryParameters,
    SASProtocol
} = require('@azure/storage-blob');

// used for local environment variables
require('dotenv').config();
//<Snippet_Dependencies>

//<Snippet_CreateContainerSas>
// Create User Delegation SAS Token for container
async function createContainerSas(accountName, containerName) {

    // Best practice: create time limits
    const TEN_MINUTES = 10 * 60 * 1000;
    const NOW = new Date();

    // Best practice: set start time a little before current time to 
    // make sure any clock issues are avoided
    const TEN_MINUTES_BEFORE_NOW = new Date(NOW.valueOf() - TEN_MINUTES);
    const TEN_MINUTES_AFTER_NOW = new Date(NOW.valueOf() + TEN_MINUTES);

    // Best practice: use managed identity - DefaultAzureCredential
    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
      );

    // Best practice: delegation key is time-limited  
    // When using a user delegation key, container must already exist 
    const userDelegationKey = await blobServiceClient.getUserDelegationKey(
        TEN_MINUTES_BEFORE_NOW, 
        TEN_MINUTES_AFTER_NOW
    );

    // Bad practice - don't use full permissions in production
    const containerPermissionsForAnonymousUser = "racwdli"

    // Best practice: SAS options are time-limited
    const sasOptions = {
        containerName,                                           
        permissions: ContainerSASPermissions.parse(containerPermissionsForAnonymousUser), 
        protocol: SASProtocol.HttpsAndHttp,
        startsOn: TEN_MINUTES_BEFORE_NOW,
        expiresOn: TEN_MINUTES_AFTER_NOW
    };
 
    const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        userDelegationKey,
        accountName 
    ).toString();

    return sasToken;
}
//</Snippet_CreateContainerSas>

//<Snippet_Main>
async function main() {

    // Get environment variables
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const containerName = process.env.AZURE_STORAGE_BLOB_CONTAINER_NAME;

    // Create SAS Token
    const userDelegationSasForContainer = await createContainerSas(accountName, containerName)

    // Create Url
    // SAS token is the query string with typical `?` delimiter
    const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}?${userDelegationSasForContainer}`;
    console.log(`\nContainerUrl = ${sasUrl}\n`);

    // Create container client from SAS token url
    const containerClient = new ContainerClient(sasUrl);

    let i = 1;

    // List blobs in container
    for await (const blob of containerClient.listBlobsFlat()) {
        console.log(`Blob ${i++}: ${blob.name}`);
    }
}

main()
    .then(() => {
        console.log(`\nDone`);
    }).catch((ex) => {
        console.log(`Error: ${ex.message}`)
    });
//</Snippet_Main>
