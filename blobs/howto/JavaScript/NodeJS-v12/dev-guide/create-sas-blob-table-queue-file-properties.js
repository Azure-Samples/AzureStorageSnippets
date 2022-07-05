// index.js
const { BlobServiceClient, ContainerClient, generateAccountSASQueryParameters , AccountSASPermissions, AccountSASServices ,AccountSASResourceTypes, StorageSharedKeyCredential, ContainerSASPermissions, SASProtocol, generateBlobSASQueryParameters } = require('@azure/storage-blob');
const { ShareServiceClient, } = require("@azure/storage-file-share");
require('dotenv').config()
//const { setLogLevel } = require("@azure/logger");
//setLogLevel("info");

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

async function getBlobServiceClientProperties() {

    try {
        // ? if I have a container name on this - I get an error of 
        // 'UnsupportedHttpVerb'
        // 'The resource doesn't support specified Http Verb.\nRequestId:32987b5f-101e-0072-3ca1-90ab72000000\nTime:2022-07-05T18:58:51.4305537Z'
        // why not just ignore the container name? 

        // log issue - 
        const blobServiceUriWithSasToken = `https://${constants.accountName}.blob.core.windows.net/${constants.containerName}${(constants.sasToken[0] === '?' ? constants.sasToken : `?${constants.sasToken}`)}`;
        console.log(blobServiceUriWithSasToken);

        const blobServiceClient = new BlobServiceClient(
            blobServiceUriWithSasToken
        );

        const blobServicePropertiesResponse = await blobServiceClient.getProperties();

        console.log(
            `Sas Permission: ${JSON.stringify(blobServicePropertiesResponse)}`
        );
    } catch (err) {
        console.log(err);
    }

}
// this should fail because this permission wasn't requested when the sas was created
async function getFileShareServiceClientProperties(){

    try{

        const fileShareServiceClientWithSasToken = new ShareServiceClient(
            // When using AnonymousCredential, following url should include a valid SAS
            `https://${account}.file.core.windows.net${(constants.sasToken[0] === '?' ? constants.sasToken : `?${constants.sasToken}`)}`
          );

        const fileSharePropertiesResponse = await fileShareServiceClientWithSasToken.getProperties();
        console.log(fileSharePropertiesResponse);

    }catch(err){
        console.log(`${err.message}`)
    }
}
// blobs, tables, queues - not including files
async function createAccountSas() {

    // where is signed encryption scope?
    // all resources, all services except files, all permissions
    const sasOptions = {

        // ref doc issue or sdk issue because I thought I would need 
        // `AccountSASPermissions` to create property values

        services: AccountSASServices.parse("btqf").toString(), //"bqt", // not files
        resourceTypes: AccountSASResourceTypes.parse("sco").toString(), // service, container, object
        permissions: AccountSASPermissions.parse("rwdlacupi"), // FULL permissions
        protocol: SASProtocol.Https,
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + (60 * 60 * 1000)), // 1 hour

    };

    const sasToken = generateAccountSASQueryParameters(
        sasOptions,
        sharedKeyCredential // is this optional, when should I use it?
    ).toString();

    constants.sasToken = sasToken;
}


async function main() {
    await createAccountSas();

    // success
    await getBlobServiceClientProperties();

    // failure - not requested when created sas token
    //await getFileShareServiceClientProperties();
}

main()
    .then(() => {
        console.log(`done`);
    }).catch((ex) => {
        console.log(`Error: ${ex.message}`)
    });