package com.blobs.devguide.blobs;

import com.azure.storage.blob.*;
import com.azure.storage.common.*;
import com.azure.storage.blob.options.BlobDownloadToFileOptions;
import com.azure.storage.blob.specialized.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class BlobDownload {
    // <Snippet_DownloadBLobFile>
    public void downloadBlobToFile(BlobClient blobClient) {
        blobClient.downloadToFile("filepath/local-file.png");
    }
    // </Snippet_DownloadBLobFile>

    // <Snippet_DownloadBLobStream>
    public void downloadBlobToStream(BlobClient blobClient) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            blobClient.downloadStream(outputStream);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    // </Snippet_DownloadBLobStream>

    // <Snippet_DownloadBLobText>
    public void downloadBlobToText(BlobClient blobClient) {
        String content = blobClient.downloadContent().toString();
        System.out.printf("Blob contents: %s%n", content);
    }
    // </Snippet_DownloadBLobText>

    // <Snippet_ReadBlobStream>
    public void readBlobFromStream(BlobClient blobClient) {
        // Opening a blob input stream allows you to read from a blob through a normal
        // stream interface

        try (BlobInputStream blobStream = blobClient.openInputStream()) {
            blobStream.read();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    // </Snippet_ReadBlobStream>

    // <Snippet_DownloadBlobWithTransferOptions>
    public void downloadBlobWithTransferOptions(BlobClient blobClient) {
        ParallelTransferOptions parallelTransferOptions = new ParallelTransferOptions()
                .setBlockSizeLong((long) (4 * 1024 * 1024)) // 4 MiB block size
                .setMaxConcurrency(2);

        BlobDownloadToFileOptions options = new BlobDownloadToFileOptions("<localFilePath>");
        options.setParallelTransferOptions(parallelTransferOptions);

        blobClient.downloadToFileWithResponse(options, null, null);
    }
    // </Snippet_DownloadBlobWithTransferOptions>
}
