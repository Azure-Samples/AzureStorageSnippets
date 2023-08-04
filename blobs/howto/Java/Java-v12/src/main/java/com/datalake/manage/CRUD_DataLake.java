package com.datalake.manage;

import java.io.*;
import java.security.InvalidKeyException;

import javax.xml.crypto.Data;

import java.net.URISyntaxException;
import java.nio.file.Path;

import com.azure.core.http.rest.PagedIterable;
import com.azure.core.util.BinaryData;
import com.azure.storage.file.datalake.*;
import com.azure.storage.file.datalake.models.*;


public class CRUD_DataLake {
    
    // ----------------------------------------------------------
    // Create a file system
    // ----------------------------------------------------------
    
    //<Snippet_CreateFileSystem>
    public DataLakeFileSystemClient CreateFileSystem(
            DataLakeServiceClient serviceClient,
            String fileSystemName) {

        DataLakeFileSystemClient fileSystemClient = serviceClient.getFileSystemClient(fileSystemName);

        return fileSystemClient;
    }
    //</Snippet_CreateFileSystem>

    // ----------------------------------------------------------
    // Get a file system
    // ----------------------------------------------------------

    //<Snippet_GetFileSystem>
    public DataLakeFileSystemClient GetFileSystem
    (DataLakeServiceClient serviceClient, String fileSystemName){
        
        DataLakeFileSystemClient fileSystemClient = serviceClient.getFileSystemClient(fileSystemName);

        return fileSystemClient;
    }
    //</Snippet_GetFileSystem>

    // ----------------------------------------------------------
    // Create directory
    // ----------------------------------------------------------

    // <Snippet_CreateDirectory>
    public DataLakeDirectoryClient CreateDirectory(
            DataLakeFileSystemClient fileSystemClient,
            String directoryName,
            String subDirectoryName) {

        DataLakeDirectoryClient directoryClient = fileSystemClient.createDirectory(directoryName);

        return directoryClient.createSubdirectory(subDirectoryName);
    }
    // </Snippet_CreateDirectory>
    
    // ----------------------------------------------------------
    // Get a directory
    // ----------------------------------------------------------

    //<Snippet_GetDirectory>
    public DataLakeDirectoryClient GetDirectory
    (DataLakeFileSystemClient fileSystemClient, String directoryName){

        DataLakeDirectoryClient directoryClient =
            fileSystemClient.getDirectoryClient(directoryName);

        return directoryClient;
    }
    //</Snippet_GetDirectory>
    
    // ---------------------------------------------------------
    // Rename a directory
    //----------------------------------------------------------

    //<Snippet_RenameDirectory>
    public DataLakeDirectoryClient RenameDirectory(
            DataLakeFileSystemClient fileSystemClient,
            String directoryPath,
            String subdirectoryName,
            String subdirectoryNameNew) {

        DataLakeDirectoryClient directoryClient = fileSystemClient
                .getDirectoryClient(String.join("/", directoryPath, subdirectoryName));

        return directoryClient.rename(
                fileSystemClient.getFileSystemName(),
                String.join("/", directoryPath, subdirectoryNameNew));
    }
    //</Snippet_RenameDirectory>
  
    // ---------------------------------------------------------
    // Move a directory
    //----------------------------------------------------------

    //<Snippet_MoveDirectory>
    public DataLakeDirectoryClient MoveDirectory(
            DataLakeFileSystemClient fileSystemClient,
            String directoryPathFrom,
            String directoryPathTo,
            String subdirectoryName) {

        DataLakeDirectoryClient directoryClient = fileSystemClient
                .getDirectoryClient(String.join("/", directoryPathFrom, subdirectoryName));

        return directoryClient.rename(
            fileSystemClient.getFileSystemName(),
            String.join("/", directoryPathTo, subdirectoryName));
    }
    //</Snippet_MoveDirectory>
  
    // ----------------------------------------------------------
    // Delete directory
    // ----------------------------------------------------------

    //<Snippet_DeleteDirectory>
    public void DeleteDirectory(
        DataLakeFileSystemClient fileSystemClient,
        String directoryName){
        
        DataLakeDirectoryClient directoryClient =
            fileSystemClient.getDirectoryClient(directoryName);

        directoryClient.delete();
    }
    //</Snippet_DeleteDirectory>

    // ----------------------------------------------------------
    // List directory contents
    // ----------------------------------------------------------

    //<Snippet_ListFilesInDirectory>
    public void ListFilesInDirectory(
        DataLakeFileSystemClient fileSystemClient,
        String directoryName){
        
        ListPathsOptions options = new ListPathsOptions();
        options.setPath(directoryName);
     
        PagedIterable<PathItem> pagedIterable = 
        fileSystemClient.listPaths(options, null);

        java.util.Iterator<PathItem> iterator = pagedIterable.iterator();
        PathItem item = iterator.next();

        while (item != null)
        {
            System.out.println(item.getName());

            if (!iterator.hasNext())
            {
                break;
            }
            item = iterator.next();
        }

    }
    //</Snippet_ListFilesInDirectory>

    // ----------------------------------------------------------
    // Upload files to directory
    // ----------------------------------------------------------

    //<Snippet_UploadFile>
    public void UploadFile(
        DataLakeDirectoryClient directoryClient,
        String fileName){

        DataLakeFileClient fileClient = directoryClient.getFileClient(fileName);

        fileClient.uploadFromFile("filepath/local-file.png");
    }
    //</Snippet_UploadFile>

    // ----------------------------------------------------------
    // Upload files in bulk
    // ----------------------------------------------------------

    //<Snippet_AppendDataToFile>
    public void AppendDataToFile(
        DataLakeDirectoryClient directoryClient){

        DataLakeFileClient fileClient = directoryClient.getFileClient("uploaded-file.txt");
        long fileSize = fileClient.getProperties().getFileSize();

        String sampleData = "Data to append to end of file";
        fileClient.append(BinaryData.fromString(sampleData), fileSize);

        fileClient.flush(fileSize + sampleData.length(), true);
    }
    //</Snippet_AppendDataToFile>
   
    // ----------------------------------------------------------
    // Download a file from a directory (binary)
    // ----------------------------------------------------------
    
    //<Snippet_DownloadFile>
    public void DownloadFile(
        DataLakeDirectoryClient directoryClient,
        String fileName){

        DataLakeFileClient fileClient = directoryClient.getFileClient(fileName);

        fileClient.readToFile("filepath/local-file.png");       
    }
    //</Snippet_DownloadFile>

    // ----------------------------------------------------------
    // Driver Menu
    // ----------------------------------------------------------

    public void ShowMenu() throws java.lang.Exception, URISyntaxException, InvalidKeyException{
        
        try {

            // Uncomment if you want to test shared key authorization.
            //DataLakeServiceClient dataLakeServiceClient = Authorize_DataLake.GetDataLakeServiceClient
            //    (Constants.storageAccountName, Constants.accountKey);
            
            // Uncomment if you want to test SAS authorization.
            String sasToken = "<SAS_TOKEN>";
            DataLakeServiceClient dataLakeServiceClient = Authorize_DataLake.GetDataLakeServiceClient
                (Constants.storageAccountName, sasToken);

            // Uncomment if you want to test AD Authorization.
            // DataLakeServiceClient dataLakeServiceClient = Authorize_DataLake.GetDataLakeServiceClient(accountName);

            DataLakeFileSystemClient fileSystemClient = GetFileSystem(dataLakeServiceClient, Constants.containerName);

            // Listening for commands from the console
            System.out.print("\033[H\033[2J");  
            System.out.flush();

            System.out.println("Enter a command");

            System.out.println("(1) Add file system (2) Add directory | (3) Rename directory | " +
            "(4) Delete directory | (5) Upload a file to a directory | (6) Upload in bulk | " + 
            " (7) List files in directory | (8) Get files from directory | (9) Exit");

            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));

            while (true) {

                System.out.println("# Enter a command : ");
                String input = reader.readLine();

                switch(input){

                    case "1":
                       fileSystemClient = CreateFileSystem(dataLakeServiceClient);
                    break;
                    case "2":
                        CreateDirectory(dataLakeServiceClient, Constants.containerName);
                    break;
                    case "3":
                        RenameDirectory(fileSystemClient);
                        break;
                    case "4":
                        DeleteDirectory(fileSystemClient);
                        break;
                    case "5":
                        UploadFile(fileSystemClient);
                    break;
                    case "6":
                        ListFilesInDirectory(fileSystemClient);
                    break;
                    case "7":
                        DownloadFile(fileSystemClient);
                    break;
                    case "8":
                       UploadFileBulk(fileSystemClient);
                    break;
                    case "9":
                    return;
                    default:
                        break;
                }
            }
        } catch (java.lang.Exception e) {
            System.out.println(e.toString());
            System.exit(-1);

        }

    }
}
