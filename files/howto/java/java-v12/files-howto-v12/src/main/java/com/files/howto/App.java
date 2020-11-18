package com.files.howto;

// import java.time.*;
// import java.time.Duration;
//import java.util.UUID.*;

/**
 * Azure file storage v12 SDK how-to
 */

// import com.azure.core.*;

// <Snippet_ImportStatements>
// Include the following imports to use queue APIs
import com.azure.storage.file.share.*;
// </Snippet_ImportStatements>

public class App 
{
    public static void main( String[] args )
    {
        // <Snippet_ConnectionString>
        // Define the connection-string with your values
        final String connectStr = 
            "DefaultEndpointsProtocol=https;" +
            "AccountName=<storage_account_name>;" +
            "AccountKey=<storage_account_key>";
        // </Snippet_ConnectionString>

        String shareName = createFileShare(connectStr);

        String dirName = createDirectory(connectStr, shareName);

        String fileName = "Log1.txt";
        uploadFile(connectStr, shareName, fileName);

        // enumerateFilesAndDirs
        // downloadFile
        // deleteFile

        deleteDirectory(connectStr, shareName, dirName);

        deleteFileShare(connectStr, shareName);
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
            e.printStackTrace();
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
            e.printStackTrace();
            return null;
        }
    }
    // </Snippet_createDirectory>

    // <Snippet_uploadFile>
    public static Boolean uploadFile(String connectStr, String shareName, String fileName)
    {
        try
        {
            ShareClient shareClient = new ShareClientBuilder()
                .connectionString(connectStr).shareName(shareName)
                .buildClient();

            ShareDirectoryClient rootDirClient = shareClient.getRootDirectoryClient();

            ShareFileClient fileClient = rootDirClient.getFileClient(fileName);
            fileClient.uploadFromFile(fileName);
            return true;
        }
        catch (Exception e)
        {
            // Output the exception message and stack trace
            System.out.println("Exception: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    // </Snippet_uploadFile>

    // public static Boolean enumerateFilesAndDirs(String connectStr, String shareName, String dirName)

    // public static Boolean downloadFile(String connectStr, String shareName, String fileName)

    // public static Boolean deleteFile(String connectStr, String shareName, String fileName)

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
            e.printStackTrace();
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
            e.printStackTrace();
            return false;
        }
    }
    // </Snippet_deleteFileShare>
}
