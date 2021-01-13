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

using Azure.Storage.Files.DataLake;
using System;
using System.Threading.Tasks;
using Azure.Storage.Files.DataLake.Models;
using System.Collections.Generic;

namespace dotnet_v12
{
    public class ACL_DataLake
    {

        DataLakeServiceClient dataLakeServiceClient;

        #region Get file system

        // ---------------------------------------------------------
        // Get a fileSystem
        //----------------------------------------------------------

        // <Snippet_GetFileSystem>
        public DataLakeFileSystemClient GetFileSystem
            (DataLakeServiceClient serviceClient, string fileSystemName)
        {
            DataLakeFileSystemClient fileSystemClient =
                serviceClient.GetFileSystemClient(fileSystemName);

            return fileSystemClient;
        }
        // </Snippet_GetFileSystem>

        #endregion

        #region Get and set directory ACLs

        // ---------------------------------------------------------
        // Get and set directory-level ACLs
        //----------------------------------------------------------

        // <Snippet_ACLDirectory>
        public async Task ManageDirectoryACLs(DataLakeFileSystemClient fileSystemClient)
        {
            DataLakeDirectoryClient directoryClient =
              fileSystemClient.GetDirectoryClient("");

            PathAccessControl directoryAccessControl =
                await directoryClient.GetAccessControlAsync();

            foreach (var item in directoryAccessControl.AccessControlList)
            {
                Console.WriteLine(item.ToString());
            }

            IList<PathAccessControlItem> accessControlList
                = PathAccessControlExtensions.ParseAccessControlList
                ("user::rwx,group::r-x,other::rw-");

            directoryClient.SetAccessControlList(accessControlList);

        }
        // </Snippet_ACLDirectory>

        #endregion

        #region Get and set file ACLs

        // ---------------------------------------------------------
        // Get and set ACLs on files
        //----------------------------------------------------------

        // <Snippet_FileACL>
        public async Task ManageFileACLs(DataLakeFileSystemClient fileSystemClient)
        {
            DataLakeDirectoryClient directoryClient =
                fileSystemClient.GetDirectoryClient("my-directory");

            DataLakeFileClient fileClient =
                directoryClient.GetFileClient("hello.txt");

            PathAccessControl FileAccessControl =
                await fileClient.GetAccessControlAsync();

            foreach (var item in FileAccessControl.AccessControlList)
            {
                Console.WriteLine(item.ToString());
            }

            IList<PathAccessControlItem> accessControlList
                = PathAccessControlExtensions.ParseAccessControlList
                ("user::rwx,group::r-x,other::rw-");

            fileClient.SetAccessControlList(accessControlList);
        }
        // </Snippet_FileACL>

        #endregion

        #region Set ACLs recursively

        // <Snippet_SetACLRecursively>
        public async Task SetACLRecursively(DataLakeServiceClient serviceClient, bool isDefaultScope)
        {
            DataLakeDirectoryClient directoryClient =
                serviceClient.GetFileSystemClient("my-container").
                    GetDirectoryClient("my-parent-directory");

            List<PathAccessControlItem> accessControlList =
                new List<PathAccessControlItem>()
            {
        new PathAccessControlItem(AccessControlType.User,
            RolePermissions.Read |
            RolePermissions.Write |
            RolePermissions.Execute, isDefaultScope),

        new PathAccessControlItem(AccessControlType.Group,
            RolePermissions.Read |
            RolePermissions.Execute, isDefaultScope),

        new PathAccessControlItem(AccessControlType.Other,
            RolePermissions.None, isDefaultScope),

        new PathAccessControlItem(AccessControlType.User,
            RolePermissions.Read |
            RolePermissions.Execute, isDefaultScope,
            entityId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"),
            };

            await directoryClient.SetAccessControlRecursiveAsync
                (accessControlList, null);
        }
        // </Snippet_SetACLRecursively>

        #endregion

        #region Update ACLs recursively

        // <Snippet_UpdateACLsRecursively>
        public async Task UpdateACLsRecursively(DataLakeServiceClient serviceClient, bool isDefaultScope)
        {
            DataLakeDirectoryClient directoryClient =
                serviceClient.GetFileSystemClient("my-container").
                GetDirectoryClient("my-parent-directory");

            List<PathAccessControlItem> accessControlListUpdate =
                new List<PathAccessControlItem>()
            {
        new PathAccessControlItem(AccessControlType.User,
            RolePermissions.Read |
            RolePermissions.Write |
            RolePermissions.Execute, isDefaultScope,
            entityId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"),
            };

            await directoryClient.UpdateAccessControlRecursiveAsync
                (accessControlListUpdate, null);

        }
        // </Snippet_UpdateACLsRecursively>

        #endregion

        #region Remove ACLs recursively

        // <Snippet_RemoveACLRecursively>
        public async Task RemoveACLsRecursively(DataLakeServiceClient serviceClient, bool isDefaultScope)
        {
            DataLakeDirectoryClient directoryClient =
                serviceClient.GetFileSystemClient("my-container").
                    GetDirectoryClient("my-parent-directory");

            List<RemovePathAccessControlItem> accessControlListForRemoval =
                new List<RemovePathAccessControlItem>()
                {
            new RemovePathAccessControlItem(AccessControlType.User, isDefaultScope,
            entityId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"),
                };

            await directoryClient.RemoveAccessControlRecursiveAsync
                (accessControlListForRemoval, null);

        }
        // </Snippet_RemoveACLRecursively>

        #endregion

        #region Resume with event token

        // <Snippet_ResumeContinuationToken>
        public async Task<string> ResumeAsync(DataLakeServiceClient serviceClient,
            DataLakeDirectoryClient directoryClient,
            List<PathAccessControlItem> accessControlList,
            string continuationToken)
        {
            try
            {
                var accessControlChangeResult =
                    await directoryClient.SetAccessControlRecursiveAsync(
                        accessControlList, continuationToken: continuationToken, null);

                if (accessControlChangeResult.Value.Counters.FailedChangesCount > 0)
                {
                    continuationToken =
                        accessControlChangeResult.Value.ContinuationToken;
                }

                return continuationToken;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return continuationToken;
            }

        }
        // </Snippet_ResumeContinuationToken>

        #endregion

        #region Continue on failure

        // <Snippet_ContinueOnFailure>
        public async Task ContinueOnFailureAsync(DataLakeServiceClient serviceClient,
            DataLakeDirectoryClient directoryClient,
            List<PathAccessControlItem> accessControlList)
        {
            var accessControlChangeResult =
                await directoryClient.SetAccessControlRecursiveAsync(
                    accessControlList, null, new AccessControlChangeOptions()
                    { ContinueOnFailure = true });

            var counters = accessControlChangeResult.Value.Counters;

            Console.WriteLine("Number of directories changed: " +
                counters.ChangedDirectoriesCount.ToString());

            Console.WriteLine("Number of files changed: " +
                counters.ChangedFilesCount.ToString());

            Console.WriteLine("Number of failures: " +
                counters.FailedChangesCount.ToString());
        }
        // </Snippet_ContinueOnFailure>

        #endregion

        //-------------------------------------------------
        // Security menu (Can call asynchronous and synchronous methods)
        //-------------------------------------------------

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a security scenario:");
            Console.WriteLine("1) Get and set directory-level permissions");
            Console.WriteLine("2) Get and set file-level permissions");
            Console.WriteLine("3) Set ACLs recursively");
            Console.WriteLine("4) Update ACLs recursively");
            Console.WriteLine("5) Remove ACLs recursively");
            Console.WriteLine("6) Resume after failure with token");
            Console.WriteLine("7) Continue past failure");
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

                    await ManageDirectoryACLs(fileSystemClient);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "2":

                    await ManageFileACLs(fileSystemClient);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "3":

                    await SetACLRecursively(dataLakeServiceClient, false);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "4":

                    await UpdateACLsRecursively(dataLakeServiceClient, false);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "5":

                    await RemoveACLsRecursively(dataLakeServiceClient, false);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "6":

                    DataLakeDirectoryClient directoryClient =
                        dataLakeServiceClient.GetFileSystemClient("my-container").
                        GetDirectoryClient("my-parent-directory");

                    directoryClient =
                         dataLakeServiceClient.GetFileSystemClient("my-container").
                         GetDirectoryClient("my-parent-directory");

                    List<PathAccessControlItem> accessControlList = new List<PathAccessControlItem>()
                    {
                        new PathAccessControlItem(AccessControlType.User,
                            RolePermissions.Read |
                            RolePermissions.Write |
                            RolePermissions.Execute),

                        new PathAccessControlItem(AccessControlType.Group,
                            RolePermissions.Read |
                            RolePermissions.Execute),

                        new PathAccessControlItem(AccessControlType.Other,
                            RolePermissions.None),

                        new PathAccessControlItem(AccessControlType.User, RolePermissions.Read |
                            RolePermissions.Write | RolePermissions.Execute,
                            entityId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx"),

                    };

                    await ResumeAsync(dataLakeServiceClient, directoryClient, accessControlList, null);


                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "7":

                    DataLakeDirectoryClient directoryClient2 =
                        dataLakeServiceClient.GetFileSystemClient("my-container").
                        GetDirectoryClient("my-parent-directory");

                    List<PathAccessControlItem> accessControlList2 = new List<PathAccessControlItem>()
                     {
                         new PathAccessControlItem(AccessControlType.User,
                             RolePermissions.Read |
                             RolePermissions.Write |
                             RolePermissions.Execute),

                         new PathAccessControlItem(AccessControlType.Group,
                             RolePermissions.Read |
                             RolePermissions.Execute),

                         new PathAccessControlItem(AccessControlType.Other,
                             RolePermissions.None),

                         new PathAccessControlItem(AccessControlType.User, RolePermissions.Read |
                             RolePermissions.Write | RolePermissions.Execute,
                             entityId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx"),

                     };

                    await ContinueOnFailureAsync(dataLakeServiceClient, directoryClient2, accessControlList2);

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
    }
        
    }



