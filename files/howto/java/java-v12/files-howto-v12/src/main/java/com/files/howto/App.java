package com.files.howto;

/**
* Azure file storage v12 SDK how-to
*/

// <Snippet_ImportStatements>
// Include the following imports to use Azure Files APIs
import com.azure.storage.file.share.*;
// </Snippet_ImportStatements>

public class App 
{
    public static String fileName = "Log1.txt";
    public static String shareName = "share-" + java.util.UUID.randomUUID();
    public static String dirName = "dir-" + java.util.UUID.randomUUID();

    // <Snippet_ConnectionString>
    // Define the connection-string.
    // Replace the values, including <>, with
    // the values from your storage account.
    public static final String connectStr = 
       "DefaultEndpointsProtocol=https;" +
       "AccountName=<storage_account_name>;" +
       "AccountKey=<storage_account_key>";
    // </Snippet_ConnectionString>

    public static void main( String[] args )
    {
        createFileShare(connectStr, shareName);                         // Create a new file share
        createDirectory(connectStr, shareName, dirName);                // Create a directory in the new file share
        uploadFile(connectStr, shareName, "", fileName);                // Upload a file to the file share root directory
        enumerateFilesAndDirs(connectStr, shareName, "");               // Enumerate the file share root directory
        downloadFile(connectStr, shareName, "", "C:/temp", fileName);   // Download a file from the file share root directory
        deleteFile(connectStr, shareName, "", fileName);                // Delete a file from the file share root directory
        deleteDirectory(connectStr, shareName, dirName);                // Delete the specified directory
        deleteFileShare(connectStr, shareName);                         // Delete the file share
    }

    // <Snippet_createFileShare>
    public static Boolean createFileShare(String connectStr, String shareName)
    {
        try
        {
            // <Snippet_createClient>
            ShareClient shareClient = new ShareClientBuilder()
                .connectionString(connectStr).shareName(shareName)
                .buildClient();
            // </Snippet_createClient>

            shareClient.create();
            return true;
        }
        catch (Exception e)
        {
            System.out.println("createFileShare exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_createFileShare>

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
            System.out.println("deleteFileShare exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_deleteFileShare>

    // <Snippet_createDirectory>
    public static Boolean createDirectory(String connectStr, String shareName,
                                            String dirName)
    {
        try
        {
            ShareDirectoryClient dirClient = new ShareFileClientBuilder()
                 .connectionString(connectStr).shareName(shareName)
                 .resourcePath(dirName)
                 .buildDirectoryClient();

            dirClient.create();
            return true;
        }
        catch (Exception e)
        {
            System.out.println("createDirectory exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_createDirectory>

    // <Snippet_deleteDirectory>
    public static Boolean deleteDirectory(String connectStr, String shareName,
                                            String dirName)
    {
        try
        {
            ShareDirectoryClient dirClient = new ShareFileClientBuilder()
                 .connectionString(connectStr).shareName(shareName)
                 .resourcePath(dirName)
                 .buildDirectoryClient();

            dirClient.delete();
            return true;
        }
        catch (Exception e)
        {
            System.out.println("deleteDirectory exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_deleteDirectory>

    // <Snippet_enumerateFilesAndDirs>
    public static Boolean enumerateFilesAndDirs(String connectStr, String shareName,
                                                    String dirName)
    {
        try
        {
            ShareDirectoryClient dirClient = new ShareFileClientBuilder()
                 .connectionString(connectStr).shareName(shareName)
                 .resourcePath(dirName)
                 .buildDirectoryClient();

            dirClient.listFilesAndDirectories().forEach(
                fileRef -> System.out.printf("Resource: %s\t Directory? %b\n",
                fileRef.getName(), fileRef.isDirectory())
            );

            return true;
        }
        catch (Exception e)
        {
            System.out.println("enumerateFilesAndDirs exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_enumerateFilesAndDirs>

    // <Snippet_uploadFile>
    public static Boolean uploadFile(String connectStr, String shareName,
                                        String dirName, String fileName)
    {
        try
        {
            ShareDirectoryClient dirClient = new ShareFileClientBuilder()
                 .connectionString(connectStr).shareName(shareName)
                 .resourcePath(dirName)
                 .buildDirectoryClient();

            ShareFileClient fileClient = dirClient.getFileClient(fileName);
            fileClient.create(1024);
            fileClient.uploadFromFile(fileName);
            return true;
        }
        catch (Exception e)
        {
            System.out.println("uploadFile exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_uploadFile>

    // <Snippet_downloadFile>
    public static Boolean downloadFile(String connectStr, String shareName,
                                        String dirName, String destDir,
                                            String fileName)
    {
        try
        {
            ShareDirectoryClient dirClient = new ShareFileClientBuilder()
                 .connectionString(connectStr).shareName(shareName)
                 .resourcePath(dirName)
                 .buildDirectoryClient();

            ShareFileClient fileClient = dirClient.getFileClient(fileName);

            // Create a unique file name
            String date = new java.text.SimpleDateFormat("yyyyMMdd-HHmmss").format(new java.util.Date());
            String destPath = destDir + "/"+ date + "_" + fileName;

            fileClient.downloadToFile(destPath);
            return true;
        }
        catch (Exception e)
        {
            System.out.println("downloadFile exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_downloadFile>

    // <Snippet_deleteFile>
    public static Boolean deleteFile(String connectStr, String shareName,
                                        String dirName, String fileName)
    {
        try
        {
            ShareDirectoryClient dirClient = new ShareFileClientBuilder()
                 .connectionString(connectStr).shareName(shareName)
                 .resourcePath(dirName)
                 .buildDirectoryClient();

            ShareFileClient fileClient = dirClient.getFileClient(fileName);
            fileClient.delete();
            return true;
        }
        catch (Exception e)
        {
            System.out.println("deleteFile exception: " + e.getMessage());
            return false;
        }
    }
    // </Snippet_deleteFile>
}
