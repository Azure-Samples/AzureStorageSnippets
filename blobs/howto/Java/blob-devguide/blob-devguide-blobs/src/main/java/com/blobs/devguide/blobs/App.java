package com.blobs.devguide.blobs;

import com.azure.identity.*;
import com.azure.storage.blob.*;
import com.azure.storage.blob.specialized.*;

public class App {
    public static void main(String[] args) {
        /*
         * The default credential first checks environment variables for configuration
         * If environment configuration is incomplete, it will try managed identity
         */
        DefaultAzureCredential defaultCredential = new DefaultAzureCredentialBuilder().build();

        // Azure SDK client builders accept the credential as a parameter
        // TODO: Replace <storage-account-name> with your actual storage account name
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .endpoint("https://<storage-account-name>.blob.core.windows.net/")
                .credential(defaultCredential)
                .buildClient();

        // This sample assumes a container named 'sample-container' and a blob called 'sampleBlob.txt'
        BlobContainerClient blobContainerClient = blobServiceClient.getBlobContainerClient("sample-container");
        BlobClient blobClient = blobContainerClient.getBlobClient("sampleBlob.txt");

        // Test various upload methods
        BlobUpload uploadHelper = new BlobUpload();
        uploadHelper.uploadDataToBlob(blobContainerClient);
        // uploadHelper.uploadBlobFromStream(blobContainerClient);
        // uploadHelper.uploadBlobFromFile(blobContainerClient);

        // Test methods for properties, metadata, and tags
        BlobPropertiesMetadataTags propertiesHelper = new BlobPropertiesMetadataTags();
        propertiesHelper.setBlobProperties(blobClient);
        propertiesHelper.getBlobProperties(blobClient);
        propertiesHelper.addBlobMetadata(blobClient);
        propertiesHelper.readBlobMetadata(blobClient);
        propertiesHelper.setBlobTags(blobClient);
        propertiesHelper.getBlobTags(blobClient);
        propertiesHelper.findBlobsByTag(blobContainerClient);

        // Test methods for blob leases
        BlobLease leaseHelper = new BlobLease();
        BlobLeaseClient leaseClient = leaseHelper.acquireBlobLease(blobClient);
        leaseHelper.renewBlobLease(leaseClient);
        leaseHelper.releaseBlobLease(leaseClient);
        // leaseHelper.breakBlobLease(leaseClient);

        // Test methods for copy blob operations
        BlobCopy copyHelper = new BlobCopy();
        copyHelper.copyBlob_copyFromUrl(blobServiceClient);
        // copyHelper.copyBlob_beginCopy(blobServiceClient);
        // copyHelper.copyBlobWithOptions(blobServiceClient);
        // copyHelper.abortCopy(blobServiceClient);

        // Test methods for listing blobs
        String prefix = "";
        BlobList listHelper = new BlobList();
        listHelper.listBlobsFlat(blobContainerClient);
        listHelper.listBlobsFlatWithOptions(blobContainerClient);
        System.out.println("List blobs hierarchical:");
        listHelper.listBlobsHierarchicalListing(blobContainerClient, prefix);

        // Test methods for downloading blobs
        BlobDownload downloadHelper = new BlobDownload();
        // downloadHelper.downloadBlobToFile(blobClient);
        // downloadHelper.downloadBlobToStream(blobClient);
        downloadHelper.downloadBlobToText(blobClient);
        // downloadHelper.readBlobFromStream(blobClient);

        // Test methods for deleting blobs
        BlobDelete deleteHelper = new BlobDelete();
        deleteHelper.deleteBlob(blobClient);
        // deleteHelper.deleteBlobWithSnapshots(blobClient);
    }
}