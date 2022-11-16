package com.blobs.devguide.containers;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;

public class ContainerDelete {
    // <Snippet_DeleteContainer>
    public void deleteContainer(BlobServiceClient blobServiceClient, String containerName) {
        // Delete the container using the service client
        blobServiceClient.deleteBlobContainer(containerName);
    }
    // </Snippet_DeleteContainer>

    // <Snippet_DeleteContainersPrefix>
    public void deleteContainersWithPrefix(BlobServiceClient blobServiceClient) {
        ListBlobContainersOptions options = new ListBlobContainersOptions()
                .setPrefix("container-");

        // Delete the container with the specified prefix using the service client
        for (BlobContainerItem containerItem : blobServiceClient.listBlobContainers(options, null)) {
            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerItem.getName());
            containerClient.delete();
        }
    }
    // </Snippet_DeleteContainersPrefix>

    // <Snippet_RestoreContainer>
    public void restoreContainer(BlobServiceClient blobServiceClient) {
        ListBlobContainersOptions options = new ListBlobContainersOptions();
        options.getDetails().setRetrieveDeleted(true);

        // Delete the container with the specified prefix using the service client
        for (BlobContainerItem deletedContainerItem : blobServiceClient.listBlobContainers(options, null)) {
            BlobContainerClient containerClient = blobServiceClient
                    .undeleteBlobContainer(deletedContainerItem.getName(), deletedContainerItem.getVersion());
        }
    }
    // </Snippet_RestoreContainer>
}
