package com.files.howto;

//import java.time.Duration.*;
//import java.util.UUID.*;

/**
* Azure file storage v12 SDK how-to
*/

// <Snippet_ImportStatements>
// Include the following imports to use Azure Files APIs
import com.azure.storage.file.share.*;
// </Snippet_ImportStatements>

public class App 
{
    public static void main( String[] args )
    {
        String fileName = "Log1.txt";

        // <Snippet_ConnectionString>
        // Define the connection-string.
        // Replace the values, including <>, with
        // the values from your storage account.
        final String connectStr = 
           "DefaultEndpointsProtocol=https;" +
           "AccountName=<storage_account_name>;" +
           "AccountKey=<storage_account_key>";
        // </Snippet_ConnectionString>

        String shareName = createFileShare(connectStr);             // Create a new file share
        String dirName = createDirectory(connectStr, shareName);    // Create a directory in the new file share
        uploadFile(connectStr, shareName, "", fileName);            // Upload a file to the file share root directory
        enumerateFilesAndDirs(connectStr, shareName, "");           // Enumerate the file share root directory
        downloadFile(connectStr, shareName, "", fileName);          // Download a file from the file share root directory
        deleteFile(connectStr, shareName, "", fileName);            // Delete a file from the file share root directory
        deleteDirectory(connectStr, shareName, dirName);            // Delete the specified directory
        deleteFileShare(connectStr, shareName);                     // Delete the file share
    }

    // <Snippet_createFileShare>
    public static String createFileShare(String connectStr)
    {
        try
        {
            String shareName = "share-" + java.util.UUID.randomUUID();

            ShareClient shareClient = new ShareClientBuilder()
                .connectionString(connectStr).shareName(shareName)
                .buildClient();

            shareClient.create();
            return shareName;
        }
        catch (Exception e)
        {
            // Output the exception message and stack trace
            System.out.println("Exception: " + e.getMessage());
            return null;
        }
    }
    // </Snippet_createFileShare>

    // <Snippet_createDirectory>
    public static String createDirectory(String connectStr, String shareName)
    {
        try
        {
            ShareClient shareClient = new ShareClientBuilder()
                .connectionString(connectStr).shareName(shareName)
                .buildClient();

            String dirName = "dir-" + java.util.UUID.randomUUID();
            ShareDirectoryClient dirClient = shareClient.getDirectoryClient(dirName);
            dirClient.create();
            return dirName;
        }
        catch (Exception e)
        {
            // Output the exception message and stack trace
            System.out.println("Exception: " + e.getMessage());
            return null;
        }
    }
    // </Snippet_createDirectory>

    // <Snippet_uploadFile>
    public static Boolean uploadFile(String connectStr, String shareName, String dirName, String fileName)
    {
        try
        {
            ShareClient shareClient = new ShareClientBuilder()
                .connectionString(connectStr).shareName(shareName)
                .buildClient();

            ShareDirectoryClient dirClient = shareClient.getDirectoryClient(dirName);

            ShareFileClient fileClient = dirClient.getFileClient(fileName);
            fileClient.create(1024);
            fileClient.uploadFromFile(fileName);
            return true;
        }
        catch (Exception e)
        {
            // Output the exception message and stack trace
            System.out.println("Exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_uploadFile>

    // <Snippet_enumerateFilesAndDirs>
    public static Boolean enumerateFilesAndDirs(String connectStr, String shareName, String dirName)
    {
        try
        {
            ShareClient shareClient = new ShareClientBuilder()
                .connectionString(connectStr).shareName(shareName)
                .buildClient();

            ShareDirectoryClient dirClient = shareClient.getDirectoryClient(dirName);

            dirClient.listFilesAndDirectories().forEach(
                fileRef -> System.out.printf("Directory? %b. Resource name: %s.\n",
                fileRef.isDirectory(), fileRef.getName())
            );

            return true;
        }
        catch (Exception e)
        {
            // Output the exception message and stack trace
            System.out.println("Exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_enumerateFilesAndDirs>

    // <Snippet_downloadFile>
    public static Boolean downloadFile(String connectStr, String shareName, String dirName, String fileName)
    {
        try
        {
            ShareClient shareClient = new ShareClientBuilder()
                .connectionString(connectStr).shareName(shareName)
                .buildClient();

            ShareDirectoryClient dirClient = shareClient.getDirectoryClient(dirName);

            ShareFileClient fileClient = dirClient.getFileClient(fileName);
            fileClient.downloadToFile("DOWNLOADED_" + fileName);
            return true;
        }
        catch (Exception e)
        {
            // Output the exception message and stack trace
            System.out.println("Exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_downloadFile>

    // <Snippet_deleteFile>
    public static Boolean deleteFile(String connectStr, String shareName, String dirName, String fileName)
    {
        try
        {
            ShareClient shareClient = new ShareClientBuilder()
                .connectionString(connectStr).shareName(shareName)
                .buildClient();

            ShareDirectoryClient dirClient = shareClient.getDirectoryClient(dirName);

            ShareFileClient fileClient = dirClient.getFileClient(fileName);
            fileClient.delete();
            return true;
        }
        catch (Exception e)
        {
            // Output the exception message and stack trace
            System.out.println("Exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_deleteFile>

    // <Snippet_deleteDirectory>
    public static Boolean deleteDirectory(String connectStr, String shareName, String dirName)
    {
        try
        {
            ShareClient shareClient = new ShareClientBuilder()
                .connectionString(connectStr).shareName(shareName)
                .buildClient();

            ShareDirectoryClient dirClient = shareClient.getDirectoryClient(dirName);
            dirClient.delete();
            return true;
        }
        catch (Exception e)
        {
            // Output the exception message and stack trace
            System.out.println("Exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_deleteDirectory>

    // <Snippet_deleteFileShare>
    public static Boolean deleteFileShare(String connectStr, String shareName)
    {
        try
        {
            ShareClient shareClient = new ShareClientBuilder()
                .connectionString(connectStr).shareName(shareName)
                .buildClient();

            shareClient.delete();
            return true;
        }
        catch (Exception e)
        {
            // Output the exception message and stack trace
            System.out.println("Exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_deleteFileShare>
}
