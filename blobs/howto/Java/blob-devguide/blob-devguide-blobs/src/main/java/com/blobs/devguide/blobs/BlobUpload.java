package com.blobs.devguide.blobs;

//<Snippet_Imports>
import com.azure.core.http.rest.*;
import com.azure.core.util.BinaryData;
import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import com.azure.storage.blob.options.BlobUploadFromFileOptions;
import com.azure.storage.blob.specialized.*;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.*;
//</Snippet_Imports>

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
    public void uploadBlockBlobWithIndexTags(BlobContainerClient blobContainerClient, Path filePath) {
        String fileName = filePath.getFileName().toString();
        BlobClient blobClient = blobContainerClient.getBlobClient(fileName);

        Map<String, String> tags = new HashMap<String, String>();
        tags.put("Content", "image");
        tags.put("Date", "2022-01-01");

        Duration timeout = Duration.ofSeconds(10);

        BlobUploadFromFileOptions options = new BlobUploadFromFileOptions(filePath.toString());
        options.setTags(tags);

        try {
            // Create a new block blob, or update the content of an existing blob
            Response<BlockBlobItem> blockBlob = blobClient.uploadFromFileWithResponse(options, timeout, null);
        } catch (UncheckedIOException ex) {
            System.err.printf("Failed to upload from file: %s%n", ex.getMessage());
        }
    }
    // </Snippet_UploadBlobTags>

    // <Snippet_UploadBlocks>
    public void uploadBlocks(BlobContainerClient blobContainerClient, Path filePath, int blockSize) throws IOException {
        String fileName = filePath.getFileName().toString();
        BlockBlobClient blobClient = blobContainerClient.getBlobClient(fileName).getBlockBlobClient();
    
        FileInputStream fileStream = new FileInputStream(filePath.toString());
        List<String> blockIDArrayList = new ArrayList<>();
        byte[] buffer = new byte[blockSize];
        int bytesRead;

        while ((bytesRead = fileStream.read(buffer, 0, blockSize)) != -1) {

            try (ByteArrayInputStream stream = new ByteArrayInputStream(buffer)) {
                String blockID = Base64.getEncoder().encodeToString(UUID.randomUUID().toString().getBytes(StandardCharsets.UTF_8));
    
                blockIDArrayList.add(blockID);
                blobClient.stageBlock(blockID, stream, buffer.length);
            }
        }
    
        blobClient.commitBlockList(blockIDArrayList);

        fileStream.close();
    }
    // </Snippet_UploadBlocks>

    // <Snippet_UploadBlobWithTransferOptions>
    public void uploadBlockBlobWithTransferOptions(BlobContainerClient blobContainerClient, Path filePath) {
        String fileName = filePath.getFileName().toString();
        BlobClient blobClient = blobContainerClient.getBlobClient(fileName);

        ParallelTransferOptions parallelTransferOptions = new ParallelTransferOptions()
                .setBlockSizeLong((long) (4 * 1024 * 1024)) // 4 MiB block size
                .setMaxConcurrency(2)
                .setMaxSingleUploadSizeLong((long) 8 * 1024 * 1024); // 8 MiB max size for single request upload

        BlobUploadFromFileOptions options = new BlobUploadFromFileOptions(filePath.toString());
        options.setParallelTransferOptions(parallelTransferOptions);

        try {
            Response<BlockBlobItem> blockBlob = blobClient.uploadFromFileWithResponse(options, null, null);
        } catch (UncheckedIOException ex) {
            System.err.printf("Failed to upload from file: %s%n", ex.getMessage());
        }
    }
    // </Snippet_UploadBlobWithTransferOptions>

    // <Snippet_UploadBlobWithAccessTier>
    public void uploadBlobWithAccessTier(BlobContainerClient blobContainerClient, Path filePath) {
        String fileName = filePath.getFileName().toString();
        BlobClient blobClient = blobContainerClient.getBlobClient(fileName);

        BlobUploadFromFileOptions options = new BlobUploadFromFileOptions(filePath.toString())
                .setTier(AccessTier.COOL);

        try {
            Response<BlockBlobItem> blockBlob = blobClient.uploadFromFileWithResponse(options, null, null);
        } catch (UncheckedIOException ex) {
            System.err.printf("Failed to upload from file: %s%n", ex.getMessage());
        }
    }
    // </Snippet_UploadBlobWithAccessTier>
}
