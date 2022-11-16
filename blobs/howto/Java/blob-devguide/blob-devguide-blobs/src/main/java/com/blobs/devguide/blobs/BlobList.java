package com.blobs.devguide.blobs;

import com.azure.core.http.rest.*;
import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;

public class BlobList {
    // <Snippet_ListBlobsFlat>
    public void listBlobsFlat(BlobContainerClient blobContainerClient) {
        System.out.println("List blobs flat:");

        blobContainerClient.listBlobs()
                .forEach(blob -> System.out.printf("Name: %s%n", blob.getName()));
    }
    // </Snippet_ListBlobsFlat>

    // <Snippet_ListBlobsFlatOptions>
    public void listBlobsFlatWithOptions(BlobContainerClient blobContainerClient) {
        ListBlobsOptions options = new ListBlobsOptions()
                .setMaxResultsPerPage(2) // Low number for demonstration purposes
                .setDetails(new BlobListDetails()
                        .setRetrieveDeletedBlobs(true));

        System.out.println("List blobs flat:");

        int i = 0;
        Iterable<PagedResponse<BlobItem>> blobPages = blobContainerClient.listBlobs(options, null).iterableByPage();
        for (PagedResponse<BlobItem> page : blobPages) {
            System.out.printf("Page %d%n", ++i);
            page.getElements().forEach(blob -> {
                System.out.printf("Name: %s, Is deleted? %b%n",
                        blob.getName(),
                        blob.isDeleted());
            });
        }
    }
    // </Snippet_ListBlobsFlatOptions>

    // <Snippet_ListBlobsHierarchical>
    public void listBlobsHierarchicalListing(BlobContainerClient blobContainerClient, String prefix/* ="" */) {
        String delimiter = "/";
        ListBlobsOptions options = new ListBlobsOptions()
                .setPrefix(prefix);

        blobContainerClient.listBlobsByHierarchy(delimiter, options, null)
                .forEach(blob -> {
                    if (blob.isPrefix()) {
                        System.out.printf("Virtual directory prefix: %s%n", delimiter + blob.getName());
                        listBlobsHierarchicalListing(blobContainerClient, blob.getName());
                    } else {
                        System.out.printf("Blob name: %s%n", blob.getName());
                    }
                });
    }
    // </Snippet_ListBlobsHierarchical>
}
