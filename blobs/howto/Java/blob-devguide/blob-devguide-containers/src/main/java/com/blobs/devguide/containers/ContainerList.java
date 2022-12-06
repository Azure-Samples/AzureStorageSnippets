package com.blobs.devguide.containers;

import com.azure.core.http.rest.*;
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

    // <Snippet_ListContainersWithPaging>
    public void listContainersWithPaging(BlobServiceClient blobServiceClient) {
        // Set a prefix to filter results and specify a page limit
        ListBlobContainersOptions options = new ListBlobContainersOptions()
                .setMaxResultsPerPage(2)  // Low number for demonstration purposes
                .setPrefix("container-");

        int i = 0;
        Iterable<PagedResponse<BlobContainerItem>> blobContainerPages = blobServiceClient
                .listBlobContainers(options, null).iterableByPage();
        for (PagedResponse<BlobContainerItem> page : blobContainerPages) {
            System.out.printf("Page %d%n", ++i);
            page.getElements().forEach(container -> {
                System.out.printf("Name: %s%n", container.getName());
            });
        }
    }
    // </Snippet_ListContainersWithPaging>
}
