package com.blobs.devguide.containers;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;

public class ContainerList {
    // <Snippet_ListContainers>
    public void listContainers(BlobServiceClient blobServiceClient) {
        // Set a prefix to filter results based on a specified character or string
        ListBlobContainersOptions options = new ListBlobContainersOptions()
                .setPrefix("container-");

        System.out.println("List containers:");
        for (BlobContainerItem blobContainerItem : blobServiceClient.listBlobContainers(options, null)) {
            System.out.printf("Container name: %s%n", blobContainerItem.getName());
        }
    }
    // </Snippet_ListContainers>
}
