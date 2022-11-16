package com.blobs.devguide.containers;

import com.azure.storage.blob.*;

public class ContainerCreate {
    // <Snippet_CreateContainer>
    public BlobContainerClient createContainer(BlobServiceClient blobServiceClient, String containerName) {
        // Create the container using the service client object
        BlobContainerClient blobContainerClient = blobServiceClient.createBlobContainer(containerName);

        return blobContainerClient;
    }
    // </Snippet_CreateContainer>

    // <Snippet_CreateRootContainer>
    public void createRootContainer(BlobServiceClient blobServiceClient) {
        // Creates a new BlobContainerClient object by appending the containerName to
        // the end of the URI
        BlobContainerClient blobContainerClient = blobServiceClient.getBlobContainerClient("$root");

        // If the container does not already exist, create it using the container client
        blobContainerClient.createIfNotExists();
    }
    // </Snippet_CreateRootContainer>
}
