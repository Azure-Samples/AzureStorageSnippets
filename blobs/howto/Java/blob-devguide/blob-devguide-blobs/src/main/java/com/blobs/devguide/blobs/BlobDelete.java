package com.blobs.devguide.blobs;


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
}
