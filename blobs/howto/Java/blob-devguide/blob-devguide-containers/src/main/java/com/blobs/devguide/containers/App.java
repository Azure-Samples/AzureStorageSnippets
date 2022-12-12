package com.blobs.devguide.containers;

import com.azure.identity.*;
import com.azure.storage.blob.*;
import com.azure.storage.blob.specialized.BlobLeaseClient;

public class App {
    public static void main(String[] args) {
        // Name the sample container based on new GUID to ensure uniqueness.
        // The container name must be lowercase.
        String containerName = "container-" + java.util.UUID.randomUUID();

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

        ContainerCreate createHelper = new ContainerCreate();
        BlobContainerClient blobContainerClient = createHelper.createContainer(blobServiceClient, containerName);
        // Create the root container
        createHelper.createRootContainer(blobServiceClient);

        ContainerPropertiesMetadata propertiesHelper = new ContainerPropertiesMetadata();
        propertiesHelper.getContainerProperties(blobContainerClient);
        propertiesHelper.addContainerMetadata(blobContainerClient);
        propertiesHelper.readContainerMetadata(blobContainerClient);

        ContainerList listHelper = new ContainerList();
        listHelper.listContainers(blobServiceClient);
        listHelper.listContainersWithPaging(blobServiceClient);

        ContainerLease leaseHelper = new ContainerLease();
        BlobLeaseClient leaseClient =  leaseHelper.acquireContainerLease(blobContainerClient);
        leaseHelper.releaseContainerLease(leaseClient);

        ContainerDelete deleteHelper = new ContainerDelete();
        deleteHelper.deleteContainer(blobServiceClient, containerName);
        deleteHelper.deleteContainer(blobServiceClient, "$root");
        deleteHelper.deleteContainersWithPrefix(blobServiceClient);
        // deleteHelper.restoreContainer(blobServiceClient);
    }
}