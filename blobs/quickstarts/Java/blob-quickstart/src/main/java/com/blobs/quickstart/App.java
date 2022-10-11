package com.blobs.quickstart;

/**
 * Azure blob storage SDK quickstart
 */
import com.azure.core.*;
import com.azure.identity.*;
import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import java.io.*;

public class App
{
    public static void main( String[] args ) throws IOException
    {
        // <Snippet_CreateServiceClientDAC>
        /*
         * The default credential first checks environment variables for configuration
         * If environment configuration is incomplete, it will try managed identity
         */
        DefaultAzureCredential defaultCredential = new DefaultAzureCredentialBuilder().build();

        // Azure SDK client builders accept the credential as a parameter
        // TODO: Replace <storage-account-name> with your actual storage account name
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .endpoint("https://<storage-account-name>.blob.core.windows.net/")
                .credential(defaultCredential)
                .buildClient();
        // </Snippet_CreateServiceClientDAC>

        // <Snippet_CreateContainer>
        // Create a unique name for the container
        String containerName = "quickstartblobs" + java.util.UUID.randomUUID();

        // Create the container and return a container client object
        BlobContainerClient blobContainerClient = blobServiceClient.createBlobContainer(containerName);
        // </Snippet_CreateContainer>

        // <Snippet_UploadBlobFromFile>
        // Create a local file in the ./data/ directory for uploading and downloading
        String localPath = "./data/";
        String fileName = "quickstart" + java.util.UUID.randomUUID() + ".txt";

        // Get a reference to a blob
        BlobClient blobClient = blobContainerClient.getBlobClient(fileName);

        // Write text to the file
        FileWriter writer = null;
        try
        {
            writer = new FileWriter(localPath + fileName, true);
            writer.write("Hello, World!");
            writer.close();
        }
        catch (IOException ex)
        {
            System.out.println(ex.getMessage());
        }

        System.out.println("\nUploading to Blob storage as blob:\n\t" + blobClient.getBlobUrl());

        // Upload the blob
        blobClient.uploadFromFile(localPath + fileName);
        // </Snippet_UploadBlobFromFile>

        // <Snippet_ListBlobs>
        System.out.println("\nListing blobs...");

        // List the blob(s) in the container.
        for (BlobItem blobItem : blobContainerClient.listBlobs()) {
            System.out.println("\t" + blobItem.getName());
        }
        // </Snippet_ListBlobs>

        // <Snippet_DownloadBlob>
        // Download the blob to a local file

        // Append the string "DOWNLOAD" before the .txt extension for comparison purposes
        String downloadFileName = fileName.replace(".txt", "DOWNLOAD.txt");

        System.out.println("\nDownloading blob to\n\t " + localPath + downloadFileName);

        blobClient.downloadToFile(localPath + downloadFileName);
        // </Snippet_DownloadBlob>

        // <Snippet_DeleteContainer>
        File downloadedFile = new File(localPath + downloadFileName);
        File localFile = new File(localPath + fileName);

        // Clean up resources
        System.out.println("\nPress the Enter key to begin clean up");
        System.console().readLine();

        System.out.println("Deleting blob container...");
        blobContainerClient.delete();

        System.out.println("Deleting the local source and downloaded files...");
        localFile.delete();
        downloadedFile.delete();

        System.out.println("Done");
        // </Snippet_DeleteContainer>
    }
}