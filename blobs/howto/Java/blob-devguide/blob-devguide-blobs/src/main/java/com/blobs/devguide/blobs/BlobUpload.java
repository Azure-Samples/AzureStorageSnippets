package com.blobs.devguide.blobs;

import com.azure.core.http.rest.*;
import com.azure.core.util.BinaryData;
import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import com.azure.storage.blob.options.BlobUploadFromFileOptions;
import com.azure.storage.blob.specialized.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Duration;
import java.util.*;

public class BlobUpload {
    // <Snippet_UploadBlobData>
    public void uploadDataToBlob(BlobContainerClient blobContainerClient) {
        // Create a BlobClient object from BlobContainerClient
        BlobClient blobClient = blobContainerClient.getBlobClient("sampleBlob.txt");
        String sampleData = "Sample data for blob";
        blobClient.upload(BinaryData.fromString(sampleData));
    }
    // </Snippet_UploadBlobData>

    // <Snippet_UploadBlobStream>
    public void uploadBlobFromStream(BlobContainerClient blobContainerClient) {
        BlockBlobClient blockBlobClient = blobContainerClient.getBlobClient("sampleBlob.txt").getBlockBlobClient();
        String sampleData = "Sample data for blob";
        try (ByteArrayInputStream dataStream = new ByteArrayInputStream(sampleData.getBytes())) {
            blockBlobClient.upload(dataStream, sampleData.length());
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }
    // </Snippet_UploadBlobStream>

    // <Snippet_UploadBlobFile>
    public void uploadBlobFromFile(BlobContainerClient blobContainerClient) {
        BlobClient blobClient = blobContainerClient.getBlobClient("sampleBlob.txt");

        try {
            blobClient.uploadFromFile("filepath/local-file.png");
        } catch (UncheckedIOException ex) {
            System.err.printf("Failed to upload from file: %s%n", ex.getMessage());
        }
    }
    // </Snippet_UploadBlobFile>

    // <Snippet_UploadBlobTags>
    public void uploadBlockBlobWithIndexTags(BlobContainerClient blobContainerClient) {
        BlobClient blobClient = blobContainerClient.getBlobClient("sampleBlob");

        Map<String, String> tags = new HashMap<String, String>();
        tags.put("Content", "image");
        tags.put("Date", "2099-01-01");

        Duration timeout = Duration.ofSeconds(10);

        BlobUploadFromFileOptions options = new BlobUploadFromFileOptions("local-file.png");
        options.setTags(tags);

        try {
            // Create a new block blob, or update the content of an existing blob
            Response<BlockBlobItem> blockBlob = blobClient.uploadFromFileWithResponse(options, timeout, null);
        } catch (UncheckedIOException ex) {
            System.err.printf("Failed to upload from file: %s%n", ex.getMessage());
        }
    }
    // </Snippet_UploadBlobTags>
}
