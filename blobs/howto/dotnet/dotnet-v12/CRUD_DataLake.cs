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
        public async Task<DataLakeFileSystemClient> CreateFileSystem
            (DataLakeServiceClient serviceClient)
        {
            return await serviceClient.CreateFileSystemAsync("my-file-system");
        }
        // </Snippet_CreateContainer>

        #endregion

        #region Get a file system

        // ---------------------------------------------------------
        // Get a fileSystem
        //----------------------------------------------------------

        // <Snippet_GetContainer>
        public DataLakeFileSystemClient GetFileSystem
            (DataLakeServiceClient serviceClient, string fileSystemName)
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
        public async Task<DataLakeDirectoryClient> CreateDirectory
            (DataLakeServiceClient serviceClient, string fileSystemName)
        {
            DataLakeFileSystemClient fileSystemClient =
                serviceClient.GetFileSystemClient(fileSystemName);

            DataLakeDirectoryClient directoryClient =
                await fileSystemClient.CreateDirectoryAsync("my-directory");

            return await directoryClient.CreateSubDirectoryAsync("my-subdirectory");
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
        public async Task<DataLakeDirectoryClient>
            RenameDirectory(DataLakeFileSystemClient fileSystemClient)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient("my-directory/my-subdirectory");

            return await directoryClient.RenameAsync("my-directory/my-subdirectory-renamed");
        }
        // </Snippet_RenameDirectory>

        #endregion

        #region Move a directory

        // ---------------------------------------------------------
        // Move a directory
        //----------------------------------------------------------

        // <Snippet_MoveDirectory>
        public async Task<DataLakeDirectoryClient> MoveDirectory
            (DataLakeFileSystemClient fileSystemClient)
        {
            DataLakeDirectoryClient directoryClient =
                 fileSystemClient.GetDirectoryClient("my-directory/my-subdirectory-renamed");

            return await directoryClient.RenameAsync("my-directory-2/my-subdirectory-renamed");
        }
        // </Snippet_MoveDirectory>

        #endregion

        #region Delete a directory

        // ---------------------------------------------------------
        // Delete a directory
        //----------------------------------------------------------

        // <Snippet_DeleteDirectory>
        public void DeleteDirectory(DataLakeFileSystemClient fileSystemClient)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient("my-directory");

            directoryClient.Delete();
        }
        // </Snippet_DeleteDirectory>

        #endregion

        #region Restore a soft-deleted directory

        // ---------------------------------------------------------
        // Restore a soft-deleted directory
        //----------------------------------------------------------

        // <Snippet_RestoreDirectory>
        public async Task RestoreDirectory(DataLakeFileSystemClient fileSystemClient, string directoryName)
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
        public async Task ListFilesInDirectory(DataLakeFileSystemClient fileSystemClient)
        {
            IAsyncEnumerator<PathItem> enumerator =
                fileSystemClient.GetPathsAsync("my-directory").GetAsyncEnumerator();

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

        #region Upload files to a directory

        // ---------------------------------------------------------
        // Upload files to the directory.
        //----------------------------------------------------------

        // <Snippet_UploadFile>
        public async Task UploadFile(DataLakeFileSystemClient fileSystemClient)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient("my-directory");

            DataLakeFileClient fileClient = await directoryClient.CreateFileAsync("uploaded-file.txt");

            FileStream fileStream =
                File.OpenRead("C:\\Users\\contoso\\Temp\\file-to-upload.txt");

            long fileSize = fileStream.Length;

            await fileClient.AppendAsync(fileStream, offset: 0);

            await fileClient.FlushAsync(position: fileSize);

        }
        // </Snippet_UploadFile>

        #endregion

        #region Upload files to a directory in bulk

        // ---------------------------------------------------------
        // Upload files to the directory - bulk uploads
        //----------------------------------------------------------

        // <Snippet_UploadFileBulk>
        public async Task UploadFileBulk(DataLakeFileSystemClient fileSystemClient)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient("my-directory");

            DataLakeFileClient fileClient = directoryClient.GetFileClient("uploaded-file.txt");

            FileStream fileStream =
                File.OpenRead("C:\\Users\\contoso\\file-to-upload.txt");

            await fileClient.UploadAsync(fileStream);

        }
        // </Snippet_UploadFileBulk>

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
        public async Task DownloadFile(DataLakeFileSystemClient fileSystemClient)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient("my-directory");

            DataLakeFileClient fileClient =
                directoryClient.GetFileClient("my-image.png");

            Response<FileDownloadInfo> downloadResponse = await fileClient.ReadAsync();

            BinaryReader reader = new BinaryReader(downloadResponse.Value.Content);

            FileStream fileStream =
                File.OpenWrite("C:\\Users\\contoso\\my-image-downloaded.png");

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
            Console.WriteLine("6) Upload files to a directory");
            Console.WriteLine("7) Upload files to a directory in bulk");
            Console.WriteLine("8) Download a file from a directory");
            Console.WriteLine("9) Restore a soft-deleted directory");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            Authorize_DataLake.GetDataLakeServiceClient(ref dataLakeServiceClient, Constants.storageAccountName, Constants.accountKey);

            // Uncomment if you want to test AD Authorization.
            //   Authorize_DataLake.GetDataLakeServiceClient(ref dataLakeServiceClient, Constants.storageAccountName, 
            //       Constants.clientID, Constants.clientSecret, Constants.tenantID);

            // Get file system client

            DataLakeFileSystemClient fileSystemClient =
                GetFileSystem(dataLakeServiceClient, Constants.containerName);
            
            switch (Console.ReadLine())
            {
                case "1":

                    await CreateFileSystem(dataLakeServiceClient);

                    Console.WriteLine("Press enter to continue");   
                    Console.ReadLine();          
                    return true;
                
                case "2":

                    await CreateDirectory(dataLakeServiceClient, Constants.containerName);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();              
                    return true;

                case "3":

                    await MoveDirectory(fileSystemClient);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "4":

                    DeleteDirectory(fileSystemClient);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "5":

                    await ListFilesInDirectory(fileSystemClient);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "6":

                    await UploadFile(fileSystemClient);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "7":

                    await UploadFileBulk(fileSystemClient);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "8":

                    await DownloadFile2(fileSystemClient);

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
