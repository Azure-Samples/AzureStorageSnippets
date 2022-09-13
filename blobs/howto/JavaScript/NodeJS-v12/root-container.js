const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
require('dotenv').config();

const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;

if (!account || !accountKey) throw Error("Azure Storage required params are empty");

const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    new StorageSharedKeyCredential(account, accountKey)
);

async function rootContainer(){
    const containerName = `$root`;

    const { containerClient } = await blobServiceClient.createContainer(containerName);

    if (containerClient.exists()) {

        console.log(`root container created`);

        // set Metadata
        const containerSetMetadataResponse = await containerClient.setMetadata({'owner':'samples', 'purpose':'training'});
        if(containerSetMetadataResponse.errorCode===undefined) console.log("metadata set successfully");

        // get AccessPolicy
        const containerGetAccessPolicyResponse = await containerClient.getAccessPolicy();
        console.log(containerGetAccessPolicyResponse);

        // get Properties
        const containerGetPropertiesResponse = await containerClient.getProperties();
        console.log(containerGetPropertiesResponse);        

        // delete during garbage collection
        //const containerDeleteResponse = await containerClient.delete();
        //console.log(containerDeleteResponse);
        //console.log(`root container deleted`)

        // delete immediately
        //const containerDeleteResponse = await blobServiceClient.deleteContainer(containerName, {});
        //if (containerDeleteResponse.errorCode===undefined) console.log(`root container deleted`);

    }

    console.log("done");
}

async function main() {

    await rootContainer();

    console.log("done");
}

main().catch((err => {
    console.log(err);
}))

