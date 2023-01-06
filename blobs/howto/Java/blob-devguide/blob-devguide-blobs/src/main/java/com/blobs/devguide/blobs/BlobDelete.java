package com.blobs.devguide.blobs;


import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

import com.azure.core.http.rest.*;
import com.azure.core.util.*;
import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;

public class BlobDelete {
    // <Snippet_DeleteBlob>
    public void deleteBlob(BlobClient blobClient) {
        blobClient.delete();
    }
    // </Snippet_DeleteBlob>

    // <Snippet_DeleteBlobSnapshots>
    public void deleteBlobWithSnapshots(BlobClient blobClient) {
        Response<Boolean> response = blobClient.deleteIfExistsWithResponse(DeleteSnapshotsOptionType.INCLUDE, null,
                null,
                new Context("key", "value"));
        if (response.getStatusCode() == 404) {
            System.out.println("Blob does not exist");
        } else {
            System.out.printf("Delete blob completed with status %d%n", response.getStatusCode());
        }
    }
    // </Snippet_DeleteBlobSnapshots>

    // <Snippet_RestoreBlob>
    public void restoreBlob(BlobClient blobClient) {
        blobClient.undelete();
    }
    // </Snippet_RestoreBlob>

    // <Snippet_RestoreBlobVersion>
    public void restoreBlobVersion(BlobContainerClient containerClient, BlobClient blobClient){
        // List blobs in this container that match the prefix
        // Include versions in the listing
        ListBlobsOptions options = new ListBlobsOptions()
                .setPrefix(blobClient.getBlobName())
                .setDetails(new BlobListDetails()
                        .setRetrieveVersions(true));
        Iterator<BlobItem> blobItem = containerClient.listBlobs(options, null).iterator();
        List<String> blobVersions = new ArrayList<>();
        while (blobItem.hasNext()) {
            blobVersions.add(blobItem.next().getVersionId());
        }

        // Sort the list of blob versions and get the most recent version ID
        Collections.sort(blobVersions, Collections.reverseOrder());
        String latestVersion = blobVersions.get(0);

        // Get a client object with the name of the deleted blob and the specified version
        BlobClient blob = containerClient.getBlobVersionClient("sampleBlob.txt", latestVersion);

        // Restore the most recent version by copying it to the base blob
        blobClient.copyFromUrl(blob.getBlobUrl());
    }
    // </Snippet_RestoreBlobVersion>
}