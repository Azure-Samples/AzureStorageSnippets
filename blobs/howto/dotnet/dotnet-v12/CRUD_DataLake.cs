//----------------------------------------------------------------------------------
// Microsoft Developer & Platform Evangelism
//
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, 
// EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES 
// OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
//----------------------------------------------------------------------------------
// The example companies, organizations, products, domain names,
// e-mail addresses, logos, people, places, and events depicted
// herein are fictitious.  No association with any real company,
// organization, product, domain name, email address, logo, person,
// places, or events is intended or should be inferred.
//----------------------------------------------------------------------------------

using Azure;
using Azure.Storage.Files.DataLake;
using Azure.Storage.Files.DataLake.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace dotnet_v12
{
    public class CRUD_DataLake
    {

        DataLakeServiceClient dataLakeServiceClient;

        #region Create container

        //-------------------------------------------------------------------
        // Create a container
        //-------------------------------------------------------------------

        // <Snippet_CreateContainer>
        public async Task<DataLakeFileSystemClient> CreateFileSystem(
            DataLakeServiceClient serviceClient,
            string fileSystemName)
        {
            return await serviceClient.CreateFileSystemAsync(fileSystemName);
        }
        // </Snippet_CreateContainer>

        #endregion

        #region Get a file system

        // ---------------------------------------------------------
        // Get a fileSystem
        //----------------------------------------------------------

        // <Snippet_GetContainer>
        public DataLakeFileSystemClient GetFileSystem(
            DataLakeServiceClient serviceClient,
            string fileSystemName)
        {
            DataLakeFileSystemClient fileSystemClient =
                serviceClient.GetFileSystemClient(fileSystemName);

            return fileSystemClient;
        }
        // </Snippet_GetContainer>

        #endregion

        #region create a directory

        // ---------------------------------------------------------
        // Create directory
        //----------------------------------------------------------

        // <Snippet_CreateDirectory>
        public async Task<DataLakeDirectoryClient> CreateDirectory(
            DataLakeServiceClient serviceClient,
            string fileSystemName,
            string directoryName,
            string subdirectoryName)
        {
            DataLakeFileSystemClient fileSystemClient =
                serviceClient.GetFileSystemClient(fileSystemName);

            DataLakeDirectoryClient directoryClient =
                await fileSystemClient.CreateDirectoryAsync(directoryName);

            return await directoryClient.CreateSubDirectoryAsync(subdirectoryName);
        }
        // </Snippet_CreateDirectory>

        #endregion

        #region Get a directory

        // ---------------------------------------------------------
        // Get a directory
        //----------------------------------------------------------

        // <Snippet_GetDirectory>
        public DataLakeDirectoryClient GetDirectory
            (DataLakeFileSystemClient fileSystemClient, string directoryName)
        {
            DataLakeDirectoryClient directoryClient =
                 fileSystemClient.GetDirectoryClient(directoryName);

            return directoryClient;
        }
        // </Snippet_GetDirectory>

        #endregion

        #region Rename a directory

        // ---------------------------------------------------------
        // Rename a directory
        //----------------------------------------------------------

        // <Snippet_RenameDirectory>
        public async Task<DataLakeDirectoryClient> RenameDirectory(
            DataLakeFileSystemClient fileSystemClient,
            string directoryName,
            string subdirectoryName,
            string subdirectoryNameNew)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient($"{directoryName}/{subdirectoryName}");

            return await directoryClient.RenameAsync($"{directoryName}/{subdirectoryNameNew}");
        }
        // </Snippet_RenameDirectory>

        #endregion

        #region Move a directory

        // ---------------------------------------------------------
        // Move a directory
        //----------------------------------------------------------

        // <Snippet_MoveDirectory>
        public async Task<DataLakeDirectoryClient> MoveDirectory(
            DataLakeFileSystemClient fileSystemClient,
            string directoryNameFrom,
            string directoryNameTo,
            string subdirectoryName)
        {
            DataLakeDirectoryClient directoryClient =
                 fileSystemClient.GetDirectoryClient($"{directoryNameFrom}/{subdirectoryName}");

            return await directoryClient.RenameAsync($"{directoryNameTo}/{subdirectoryName}");
        }
        // </Snippet_MoveDirectory>

        #endregion

        #region Delete a directory

        // ---------------------------------------------------------
        // Delete a directory
        //----------------------------------------------------------

        // <Snippet_DeleteDirectory>
        public async Task DeleteDirectory(
            DataLakeFileSystemClient fileSystemClient,
            string directoryName)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient(directoryName);

            await directoryClient.DeleteAsync();
        }
        // </Snippet_DeleteDirectory>

        #endregion

        #region Restore a soft-deleted directory

        // ---------------------------------------------------------
        // Restore a soft-deleted directory
        //----------------------------------------------------------

        // <Snippet_RestoreDirectory>
        public async Task RestoreDirectory(
            DataLakeFileSystemClient fileSystemClient,
            string directoryName)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient(directoryName);

            // List deleted paths
            List<PathDeletedItem> deletedItems = new List<PathDeletedItem>();
            await foreach (PathDeletedItem deletedItem in fileSystemClient.GetDeletedPathsAsync(directoryName))
            {
                deletedItems.Add(deletedItem);
            }

            // Restore deleted directory
            Response<DataLakePathClient> restoreResponse = await fileSystemClient.UndeletePathAsync(
                deletedItems[0].Path,
                deletedItems[0].DeletionId);
        }
        // </Snippet_RestoreDirectory>

        #endregion

        #region List directory contents

        // ----------------------------------------------------------
        // List directory contents
        // ----------------------------------------------------------

        // <Snippet_ListFilesInDirectory>
        public async Task ListFilesInDirectory(
            DataLakeFileSystemClient fileSystemClient,
            string directoryName)
        {
            IAsyncEnumerator<PathItem> enumerator =
                fileSystemClient.GetPathsAsync(directoryName).GetAsyncEnumerator();

            await enumerator.MoveNextAsync();

            PathItem item = enumerator.Current;

            while (item != null)
            {
                Console.WriteLine(item.Name);

                if (!await enumerator.MoveNextAsync())
                {
                    break;
                }

                item = enumerator.Current;
            }

        }
        // </Snippet_ListFilesInDirectory>

        #endregion

        #region Upload a file to a directory

        // ---------------------------------------------------------
        // Upload a file to the directory
        //----------------------------------------------------------

        // <Snippet_UploadFile>
        public async Task UploadFile(
            DataLakeFileSystemClient fileSystemClient,
            string directoryName,
            string fileName,
            string localPath)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient(directoryName);

            DataLakeFileClient fileClient = 
                directoryClient.GetFileClient(fileName);

            FileStream fileStream = File.OpenRead(localPath);

            await fileClient.UploadAsync(content: fileStream, overwrite: true);
        }
        // </Snippet_UploadFile>

        #endregion

        #region Append data to a file

        // ---------------------------------------------------------
        // Append data to a file
        //----------------------------------------------------------

        // <Snippet_AppendDataToFile>
        public async Task AppendDataToFile(
            DataLakeFileSystemClient fileSystemClient,
            string directoryName,
            string fileName,
            string localPath)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient(directoryName);

            DataLakeFileClient fileClient = 
                directoryClient.GetFileClient(fileName);

            long fileSize = fileClient.GetProperties().Value.ContentLength;

            FileStream fileStream = File.OpenRead(localPath);

            await fileClient.AppendAsync(fileStream, offset: fileSize);

            await fileClient.FlushAsync(position: fileSize + fileStream.Length);
        }
        // </Snippet_AppendDataToFile>

        #endregion

        #region Download a file from a directory

        // ---------------------------------------------------------
        // Download file from directory
        //----------------------------------------------------------

        // <Snippet_DownloadFromDirectory>
        public async Task DownloadFile2(DataLakeFileSystemClient fileSystemClient)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient("my-directory");

            DataLakeFileClient fileClient = directoryClient.GetFileClient("my-image.png");

            Response<FileDownloadInfo> downloadResponse = await fileClient.ReadAsync();

            StreamReader reader = new StreamReader(downloadResponse.Value.Content);

            FileStream fileStream = File.OpenWrite("C:\\Users\\contoso\\my-image-downloaded.png");

            string output = await reader.ReadToEndAsync();

            byte[] data = System.Text.Encoding.UTF8.GetBytes(output);

            fileStream.Write(data, 0, data.Length);

            await fileStream.FlushAsync();

            fileStream.Close();
        }
        // </Snippet_DownloadFromDirectory>

        #endregion

        #region Download a binary file from a directory

        // ---------------------------------------------------------
        // Download file from directory (binary)
        //----------------------------------------------------------

        // <Snippet_DownloadBinaryFromDirectory>
        public async Task DownloadFile(
            DataLakeFileSystemClient fileSystemClient,
            string directoryName,
            string fileName,
            string localPath)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient(directoryName);

            DataLakeFileClient fileClient =
                directoryClient.GetFileClient(fileName);

            Response<FileDownloadInfo> downloadResponse = await fileClient.ReadAsync();

            BinaryReader reader = new BinaryReader(downloadResponse.Value.Content);

            FileStream fileStream = File.OpenWrite(localPath);

            int bufferSize = 4096;

            byte[] buffer = new byte[bufferSize];

            int count;

            while ((count = reader.Read(buffer, 0, buffer.Length)) != 0)
            {
                fileStream.Write(buffer, 0, count);
            }

            await fileStream.FlushAsync();

            fileStream.Close();
        }
        // </Snippet_DownloadBinaryFromDirectory>

        #endregion

        #region User menu

        //-------------------------------------------------
        // CRUD menu (Can call asynchronous and synchronous methods)
        //-------------------------------------------------

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a Create, Read, Update, or Delete (CRUD) scenario:");
            Console.WriteLine("1) Create a file system");
            Console.WriteLine("2) Create a directory");
            Console.WriteLine("3) Rename a directory");
            Console.WriteLine("4) Delete a directory");
            Console.WriteLine("5) List directory contents");
            Console.WriteLine("6) Upload a file to a directory");
            Console.WriteLine("7) Append data to a file");
            Console.WriteLine("8) Download a file from a directory");
            Console.WriteLine("9) Restore a soft-deleted directory");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            // Uncomment to test SAS authorization
            //Authorize_DataLake.GetDataLakeServiceClientSAS(ref dataLakeServiceClient, Constants.storageAccountName, "<sas-token");

            // Uncomment to test shared key authorization
            Authorize_DataLake.GetDataLakeServiceClient(ref dataLakeServiceClient, Constants.storageAccountName, Constants.accountKey);

            // Uncomment if you want to test AD Authorization
            //   Authorize_DataLake.GetDataLakeServiceClient(ref dataLakeServiceClient, Constants.storageAccountName, 
            //       Constants.clientID, Constants.clientSecret, Constants.tenantID);

            // Get file system client

            string fileSystemName = "sample-filesystem";

            DataLakeFileSystemClient fileSystemClient =
                GetFileSystem(dataLakeServiceClient, fileSystemName);

            string directoryName = "sample-directory";
            string subdirectoryName = "sample-subdirectory";
            string subdirectoryNameNew = "renamed-sample-directory";
            string fileName = "testfile.txt";

            string localPath = @"C:\Users\pauljewell\OneDrive - Microsoft\Desktop\Blob\testfile.txt";
            string localPathAppend = @"C:\Users\pauljewell\OneDrive - Microsoft\Desktop\Blob\appendfile.txt";

            switch (Console.ReadLine())
            {
                case "1":

                    await CreateFileSystem(dataLakeServiceClient, fileSystemName);

                    Console.WriteLine("Press enter to continue");   
                    Console.ReadLine();          
                    return true;
                
                case "2":

                    await CreateDirectory(dataLakeServiceClient, fileSystemName, directoryName, subdirectoryName);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();              
                    return true;

                case "3":

                    await RenameDirectory(fileSystemClient, directoryName, subdirectoryName, subdirectoryNameNew);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "4":

                    await DeleteDirectory(fileSystemClient, directoryName);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "5":

                    await ListFilesInDirectory(fileSystemClient, directoryName);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "6":

                    await UploadFile(fileSystemClient, directoryName, fileName, localPath);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "7":

                    await AppendDataToFile(fileSystemClient, directoryName, fileName, localPathAppend);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "8":

                    await DownloadFile(fileSystemClient, directoryName, fileName, localPath);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "9":

                    await RestoreDirectory(fileSystemClient, "my-directory");

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;


                case "x":
                case "X":
                
                   return false;
                
                default:
                
                   return true;
            }
        }
        #endregion

    }

}
