/** 
 * Best practice - use managed identity to avoid keys & connection strings
 * managed identity is implemented with @azure/identity's DefaultAzureCredential
 * 
 * The identity that the managed identity chain selects must have the 
 * correct roles applied in order to work correctly. 
 * 
 * For local development: add your personal identity on your resource group
 * az role assignment create --assignee "<your-username>" \
 *   --role "Blob Data Contributor" \
 *   --resource-group "<your-resource-group-name>"
 **/

//const logger = require('@azure/logger');
//logger.setLogLevel('info');

//<Snippet_Dependencies>
const {
    DefaultAzureCredential
} = require('@azure/identity');
const {
    BlockBlobClient,
    BlobServiceClient,
    BlobSASPermissions,
    generateBlobSASQueryParameters,
    SASProtocol
} = require('@azure/storage-blob');

// used for local environment variables
require('dotenv').config();
//</Snippet_Dependencies>


//<Snippet_CreateBlobSas>
// Server creates User Delegation SAS Token for blob
async function createBlobSas(blobName) {

    // Get environment variables
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const containerName = process.env.AZURE_STORAGE_BLOB_CONTAINER_NAME;

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

    // Need only create/write permission to upload file
    const blobPermissionsForAnonymousUser = "cw"

    // Best practice: SAS options are time-limited
    const sasOptions = {
        blobName,
        containerName,                                           
        permissions: BlobSASPermissions.parse(blobPermissionsForAnonymousUser), 
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
//</Snippet_CreateBlobSas>

//<Snippet_UploadToBlob>
// Client or another process uses SAS token to upload content to blob
async function uploadStringToBlob(blobName, sasToken, textAsString){

    // Get environment variables
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const containerName = process.env.AZURE_STORAGE_BLOB_CONTAINER_NAME;

    // Create Url SAS token as query string with typical `?` delimiter
    const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
    console.log(`\nBlobUrl = ${sasUrl}\n`);

    // Create blob client from SAS token url
    const blockBlobClient = new BlockBlobClient(sasUrl);

    // Upload string
    await blockBlobClient.upload(textAsString, textAsString.length, undefined);    
}
//</Snippet_UploadToBlob>

//<Snippet_Main>
async function main() {

    // Create random blob name for text file
    const blobName = `${(0|Math.random()*9e6).toString(36)}.txt`;

    // Server creates SAS Token
    const userDelegationSasForBlob = await createBlobSas(blobName)

    // Server hands off SAS Token & blobName to client to
    // Upload content
    await uploadStringToBlob(blobName, userDelegationSasForBlob, "Hello Blob World");
}

main()
    .then(() => {
        console.log(`\nDone`);
    }).catch((ex) => {
        console.log(`Error: ${ex.message}`)
    });
//</Snippet_Main>
