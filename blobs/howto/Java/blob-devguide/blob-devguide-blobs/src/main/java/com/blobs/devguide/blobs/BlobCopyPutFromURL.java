package com.blobs.devguide.blobs;

//<Snippet_Imports>
import com.azure.storage.blob.*;
import com.azure.storage.blob.specialized.*;
//</Snippet_Imports>

public class BlobCopyPutFromURL {

    // <Snippet_CopyFromAzure_PutBlobFromURL>
    public void copyFromSourceInAzure(BlobClient sourceBlob, BlockBlobClient destinationBlob) {
        // Get the source blob URL and create the destination blob
        // set overwrite param to true if you want to overwrite an existing blob
        destinationBlob.uploadFromUrl(sourceBlob.getBlobUrl(), false);
    }
    // </Snippet_CopyFromAzure_PutBlobFromURL>

    // <Snippet_CopyFromExternalSource_PutBlobFromURL>
    public void copyFromExternalSource(String sourceURL, BlockBlobClient destinationBlob) {
        // Create the destination blob from the source URL
        // set overwrite param to true if you want to overwrite an existing blob
        destinationBlob.uploadFromUrl(sourceURL, false);
    }
    // </Snippet_CopyFromExternalSource_PutBlobFromURL>
}
