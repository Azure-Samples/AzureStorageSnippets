package com.blobs.devguide.blobs;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Blob;

import com.azure.core.credential.*;
import com.azure.identity.*;
import com.azure.storage.blob.*;
import com.azure.storage.blob.specialized.*;
import com.azure.storage.common.*;

public class App {
    public static void main(String[] args) {
        // Create a service client using DefaultAzureCredential
        BlobServiceClient blobServiceClient = GetBlobServiceClientTokenCredential();

        //region Create a user delegation SAS
        //BlobSAS sasHelper = new BlobSAS();
        //sasHelper.useUserDelegationSASBlob(blobServiceClient);
        //sasHelper.useUserDelegationSASContainer(blobServiceClient);
        //endregion

        //region Create a service client using a SAS
        // String sasToken = "<SAS token>";
        // BlobServiceClient blobServiceClient = GetBlobServiceClientSAS(sasToken);
        //endregion

        //region Create a service client using the account key
        //String accountName = "<account-name>";
        //String accountKey = "<account-key>";
        //BlobServiceClient blobServiceClient = GetBlobServiceClientAccountKey(accountName, accountKey);
        //endregion

        //region Create an account SAS
        //sasHelper.useAccountSAS(blobServiceClient);
        //endregion

        //region Create a service SAS
        //sasHelper.useServiceSASContainer(blobServiceClient);
        //sasHelper.useServiceSASBlob(blobServiceClient);
        //endregion

        //region Create a service client using a connection string
        // String connectionString = "<Connection string>";
        //BlobServiceClient blobServiceClient = GetBlobServiceClientConnectionString(connectionString);
        //endregion

        // This sample assumes a container named 'sample-container' and a blob called 'sampleBlob.txt'
        BlobContainerClient blobContainerClient = blobServiceClient.getBlobContainerClient("sample-container");
        BlobClient blobClient = blobContainerClient.getBlobClient("sample-blob");

        //region Test upload methods
        //Path filePath = Paths.get("filepath/local-file.png");

        //BlobUpload uploadHelper = new BlobUpload();
        //uploadHelper.uploadDataToBlob(blobContainerClient);
        //uploadHelper.uploadBlobFromStream(blobContainerClient);
        //uploadHelper.uploadBlobFromFile(blobContainerClient);
        //uploadHelper.uploadBlockBlobWithIndexTags(blobContainerClient, filePath);
        //uploadHelper.uploadBlockBlobWithTransferOptions(blobContainerClient, filePath);
        //uploadHelper.uploadBlobWithAccessTier(blobContainerClient, filePath);

        //int blockSize = 1024*1024*4; //4 MiB
        //try {
        //    uploadHelper.uploadBlocks(blobContainerClient, filePath, blockSize);
        //} catch (IOException e) {
        //    e.printStackTrace();
        //}
        //endregion

        //region Test methods for properties, metadata, and tags
        //BlobPropertiesMetadataTags propertiesHelper = new BlobPropertiesMetadataTags();
        //propertiesHelper.setBlobProperties(blobClient);
        //propertiesHelper.getBlobProperties(blobClient);
        //propertiesHelper.addBlobMetadata(blobClient);
        //propertiesHelper.readBlobMetadata(blobClient);
        //propertiesHelper.setBlobTags(blobClient);
        //propertiesHelper.getBlobTags(blobClient);
        //propertiesHelper.findBlobsByTag(blobContainerClient);
        //endregion

        //region Test methods for blob leases
        //BlobLease leaseHelper = new BlobLease();
        //BlobLeaseClient leaseClient = leaseHelper.acquireBlobLease(blobClient);
        //leaseHelper.renewBlobLease(leaseClient);
        //leaseHelper.releaseBlobLease(leaseClient);
        // leaseHelper.breakBlobLease(leaseClient);
        //endregion

        //region Test methods for copy blob operations
        // BlobCopy copyHelper = new BlobCopy();
        // BlobCopyPutFromURL copyPutFromURLHelper = new BlobCopyPutFromURL();
        // BlobContainerClient sourceContainer = blobServiceClient.getBlobContainerClient("source-container");
        // BlobClient sourceBlob = blobContainerClient.getBlobClient("sample-blob.txt");
        // BlobContainerClient destinationContainer = blobServiceClient.getBlobContainerClient("destination-container");
        // BlockBlobClient destinationBlob = destinationContainer.getBlobClient("sample-blob-copy.txt").getBlockBlobClient();
        // copyPutFromURLHelper.copyFromSourceInAzure(sourceBlob, destinationBlob);
        // String sourceURL = "<source-object-url>";
        // copyPutFromURLHelper.copyFromExternalSource(sourceURL, destinationBlob);
        // copyHelper.copyBlobWithinStorageAccount(sourceBlob, destinationBlob);
        // copyHelper.copyBlobAcrossStorageAccounts(sourceBlob, destinationBlob);
        // copyHelper.copyBlob_beginCopy(blobServiceClient);
        // copyHelper.copyBlobWithOptions(blobServiceClient);
        //endregion

        //region Test methods for listing blobs
        //String prefix = "";
        //BlobList listHelper = new BlobList();
        //listHelper.listBlobsFlat(blobContainerClient);
        //listHelper.listBlobsFlatWithOptions(blobContainerClient);
        //System.out.println("List blobs hierarchical:");
        //listHelper.listBlobsHierarchicalListing(blobContainerClient, prefix);
        //endregion

        //region Test methods for downloading blobs
        //BlobDownload downloadHelper = new BlobDownload();
        //downloadHelper.downloadBlobWithTransferOptions(blobClient);
        // downloadHelper.downloadBlobToFile(blobClient);
        // downloadHelper.downloadBlobToStream(blobClient);
        //downloadHelper.downloadBlobToText(blobClient);
        // downloadHelper.readBlobFromStream(blobClient);
        //endregion

        //region Test methods for deleting blobs
        //BlobDelete deleteHelper = new BlobDelete();
        //deleteHelper.deleteBlob(blobClient);
        // deleteHelper.deleteBlobWithSnapshots(blobClient);
        //endregion

        //region Test methods for setting or changing access tiers
        BlobAccessTier accessTierHelper = new BlobAccessTier();
        accessTierHelper.changeBlobAccessTier(blobClient);
        //BlobClient archiveBlob = blobContainerClient.getBlobClient("sample-blob-archive.txt");
        //accessTierHelper.rehydrateBlobSetAccessTier(archiveBlob);

        BlobClient sourceArchiveBlob = blobContainerClient.getBlobClient("sample-blob-archive.txt");
        BlobClient destinationRehydratedBlob = blobContainerClient.getBlobClient("sample-blob-rehydrated-java.txt");
        accessTierHelper.rehydrateBlobUsingCopy(sourceArchiveBlob, destinationRehydratedBlob);
        //endregion
    }

    
    public static BlobServiceClient GetBlobServiceClientTokenCredential() {
        // <Snippet_GetServiceClientAzureAD>
        // Azure SDK client builders accept the credential as a parameter
        // TODO: Replace <storage-account-name> with your actual storage account name
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .endpoint("https://<storage-account-name>.blob.core.windows.net/")
                .credential(new DefaultAzureCredentialBuilder().build())
                .buildClient();

        // If needed, you can create a ContainerClient from the BlobServiceClient
        BlobContainerClient containerClient = blobServiceClient
                .getBlobContainerClient("<container-name>");

        // If needed, you can create a BlobClient from the BlobContainerClient
        BlobClient blobClient = containerClient
                .getBlobClient("<blob-name>");
        // </Snippet_GetServiceClientAzureAD>

        return blobServiceClient;
    }

    // <Snippet_GetServiceClientSAS>
    public static BlobServiceClient GetBlobServiceClientSAS(String sasToken) {
        // TODO: Replace <storage-account-name> with your actual storage account name
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .endpoint("https://<storage-account-name>.blob.core.windows.net/")
                .sasToken(sasToken)
                .buildClient();

        return blobServiceClient;
    }
    // </Snippet_GetServiceClientSAS>

    // <Snippet_GetServiceClientAccountKey>
    public static BlobServiceClient GetBlobServiceClientAccountKey(String accountName, String accountKey) {
        StorageSharedKeyCredential credential = new StorageSharedKeyCredential(accountName, accountKey);

        // Azure SDK client builders accept the credential as a parameter
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .endpoint(String.format("https://%s.blob.core.windows.net/", accountName))
                .credential(credential)
                .buildClient();

        return blobServiceClient;        
    }
    // </Snippet_GetServiceClientAccountKey>

    // <Snippet_GetServiceClientConnectionString>
    public static BlobServiceClient GetBlobServiceClientConnectionString(String connectionString) {
        // Azure SDK client builders accept the credential as a parameter
        // TODO: Replace <storage-account-name> with your actual storage account name
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .endpoint("https://<storage-account-name>.blob.core.windows.net/")
                .connectionString(connectionString)
                .buildClient();

        return blobServiceClient;        
    }
    // </Snippet_GetServiceClientConnectionString>
}