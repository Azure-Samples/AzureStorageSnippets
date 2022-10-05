package com.blobs.quickstart;

/**
 * Azure blob storage v12 SDK quickstart
 */
import com.azure.core.*;
import com.azure.identity.*;
import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import java.io.*;

public class App
{
    // <Snippet_MainFunction>
    public static void main( String[] args ) throws IOException
    {
        // Create a local file in the ./data/ directory for uploading and downloading
        String localPath = "./data/";
        String fileName = "quickstart" + java.util.UUID.randomUUID() + ".txt";

        BlobServiceClient blobServiceClient = createServiceClient();

        BlobContainerClient blobContainerClient = createContainer(blobServiceClient);

        // Get a reference to a blob
        BlobClient blobClient = blobContainerClient.getBlobClient(fileName);

        uploadBlob(blobClient, localPath, fileName);

        listBlobs(blobContainerClient);

        downloadBlob(blobClient, localPath, fileName);

        deleteContainer(blobContainerClient, localPath, fileName);
    }
    // </Snippet_MainFunction>

    // <Snippet_CreateServiceClientDAC>
    /**
     * The default credential first checks environment variables for configuration.
     * If environment configuration is incomplete, it will try managed identity.
     */
    public static BlobServiceClient createServiceClient() {
        DefaultAzureCredential defaultCredential = new DefaultAzureCredentialBuilder().build();

        // Azure SDK client builders accept the credential as a parameter
        BlobServiceClient client = new BlobServiceClientBuilder()
                .endpoint("https://YOURSTORAGEACCOUNTNAME.blob.core.windows.net/")
                .credential(defaultCredential)
                .buildClient();

        return client;
    }
    // </Snippet_CreateServiceClientDAC>

    // <Snippet_CreateServiceClientConnectionString>
    public static BlobServiceClient createServiceClientConnectionString() {
        // Retrieve the connection string for use with the application. The storage
        // connection string is stored in an environment variable on the machine
        // running the application called AZURE_STORAGE_CONNECTION_STRING. If the
        // environment variable is created after the application is launched in a console or with
        // Visual Studio, the shell or application needs to be closed and reloaded
        // to take the environment variable into account.
        String connectStr = System.getenv("AZURE_STORAGE_CONNECTION_STRING");

        // Create a BlobServiceClient object using a connection string
        BlobServiceClient client = new BlobServiceClientBuilder().connectionString(connectStr).buildClient();

        return client;
    }
    // </Snippet_CreateServiceClientConnectionString>

    // <Snippet_CreateContainer>
    public static BlobContainerClient createContainer(BlobServiceClient blobServiceClient) {
        // Create a unique name for the container
        String containerName = "quickstartblobs" + java.util.UUID.randomUUID();

        // Create the container and return a container client object
        BlobContainerClient containerClient = blobServiceClient.createBlobContainer(containerName);

        return containerClient;
    }
    // </Snippet_CreateContainer>

    // <Snippet_UploadBlobFromFile>
    public static void uploadBlob(BlobClient blobClient, String localPath, String fileName) {
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
    }
    // </Snippet_UploadBlobFromFile>

    // <Snippet_ListBlobs>
    public static void listBlobs(BlobContainerClient blobContainerClient) {
        System.out.println("\nListing blobs...");

        // List the blob(s) in the container.
        for (BlobItem blobItem : blobContainerClient.listBlobs()) {
            System.out.println("\t" + blobItem.getName());
        }
    }
    // </Snippet_ListBlobs>

    // <Snippet_DownloadBlob>
    public static void downloadBlob(BlobClient blobClient, String localPath, String fileName) {
        // Download the blob to a local file
        // Append the string "DOWNLOAD" before the .txt extension so that you can see
        // both files.
        String downloadFileName = fileName.replace(".txt", "DOWNLOAD.txt");

        System.out.println("\nDownloading blob to\n\t " + localPath + downloadFileName);

        blobClient.downloadToFile(localPath + downloadFileName);
    }
    // </Snippet_DownloadBlob>

    // <Snippet_DeleteContainer>
    public static void deleteContainer(BlobContainerClient blobContainerClient, String localPath, String fileName) {
        String downloadFileName = fileName.replace(".txt", "DOWNLOAD.txt");
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
    }
    // </Snippet_DeleteContainer>
}

