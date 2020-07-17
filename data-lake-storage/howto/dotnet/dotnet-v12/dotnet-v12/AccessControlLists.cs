using Azure;
using Azure.Core;
using Azure.Identity;
using Azure.Storage;
using Azure.Storage.Files.DataLake;
using Azure.Storage.Files.DataLake.Models;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace dotnet_v12
{
    class AccessControlLists
    {
        DataLakeServiceClient dataLakeServiceClient;

        //-------------------------------------------------
        // Connect to account by using an account key
        //-------------------------------------------------

        public void GetDataLakeServiceClient(ref DataLakeServiceClient dataLakeServiceClient,
            string accountName, string accountKey)
        {
            StorageSharedKeyCredential sharedKeyCredential =
                new StorageSharedKeyCredential(accountName, accountKey);

            string dfsUri = "https://" + accountName + ".dfs.core.windows.net";

            dataLakeServiceClient = new DataLakeServiceClient
                (new Uri(dfsUri), sharedKeyCredential);
        }

        //-------------------------------------------------
        // Connect to account by using Azure AD
        //-------------------------------------------------

        public void GetDataLakeServiceClient(ref DataLakeServiceClient dataLakeServiceClient,
            String accountName, String clientID, string clientSecret, string tenantID)
        {

            TokenCredential credential = new ClientSecretCredential(
                tenantID, clientID, clientSecret, new TokenCredentialOptions());

            string dfsUri = "https://" + accountName + ".dfs.core.windows.net";

            dataLakeServiceClient = new DataLakeServiceClient(new Uri(dfsUri), credential);
        }

        //-------------------------------------------------
        // Set ACLs recursively
        //-------------------------------------------------

        public async void SetACLRecursively(DataLakeServiceClient serviceClient)
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
                    RolePermissions.Execute),
                    
                new PathAccessControlItem(AccessControlType.Group, 
                    RolePermissions.Read | 
                    RolePermissions.Execute),
                    
                new PathAccessControlItem(AccessControlType.Other, 
                    RolePermissions.None),

                new PathAccessControlItem(AccessControlType.User, 
                    RolePermissions.Read | 
                    RolePermissions.Execute, 
                    entityId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"),
            };

            await directoryClient.SetAccessControlRecursiveAsync
                (accessControlList, null);
        }

        //-------------------------------------------------
        // Update ACLs recursively
        //-------------------------------------------------

        public async void UpdateACLsRecursively(DataLakeServiceClient serviceClient)
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
                    RolePermissions.Execute, 
                    entityId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"),
            };

            await directoryClient.UpdateAccessControlRecursiveAsync
                (accessControlListUpdate, null);

        }

        //-------------------------------------------------
        // Remove ACLs recursively
        //-------------------------------------------------

        public async void RemoveACLsRecursively(DataLakeServiceClient serviceClient)
        {
            DataLakeDirectoryClient directoryClient =
                serviceClient.GetFileSystemClient("my-container").
                    GetDirectoryClient("my-parent-directory");

            List<RemovePathAccessControlItem> accessControlListForRemoval = 
                new List<RemovePathAccessControlItem>()
                {
                    new RemovePathAccessControlItem(AccessControlType.User, 
                    entityId: "4a9028cf-f779-4032-b09d-970ebe3db258"),
                };

            await directoryClient.RemoveAccessControlRecursiveAsync
                (accessControlListForRemoval, null);

        }

        //-------------------------------------------------
        // Continue on failure
        //-------------------------------------------------

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

        //--------------------------------------------------
        // Use continuation token
        //--------------------------------------------------

        public async Task<string> ResumeAsync(DataLakeServiceClient serviceClient,
            DataLakeDirectoryClient directoryClient,
            List<PathAccessControlItem> accessControlList, 
            string continuationToken)
        {
            try
            {
                var accessControlChangeResult =
                    await directoryClient.SetAccessControlRecursiveAsync(
                        accessControlList, null, continuationToken: continuationToken);

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

        //-------------------------------------------------
        // AccessControlList menu
        //-------------------------------------------------

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a monitoring scenario:");
            Console.WriteLine("1) Connect by using an account key");
            Console.WriteLine("2) Connect by using Azure AD");
            Console.WriteLine("3) Set ACLs recursively");
            Console.WriteLine("4) Update ACLs recursively");
            Console.WriteLine("5) Remove ACLs recursively");
            Console.WriteLine("6) Set ACLs and continue on failure");
            Console.WriteLine("7) Set ACLs and stop on failure");
            Console.WriteLine("8) Return to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":

                    GetDataLakeServiceClient
                        (ref dataLakeServiceClient, Constants.storageAccountName, 
                        Constants.accountKey);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "2":

                    GetDataLakeServiceClient
                        (ref dataLakeServiceClient, Constants.storageAccountName, 
                        Constants.clientID, Constants.clientSecret, Constants.tenantID);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "3":

                    SetACLRecursively(dataLakeServiceClient);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    
                    return true;

                case "4":

                    UpdateACLsRecursively(dataLakeServiceClient);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "5":

                    RemoveACLsRecursively(dataLakeServiceClient);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "6":

                    DataLakeDirectoryClient directoryClient =
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
                            entityId: "4a9028cf-f779-4032-b09d-970ebe3db258"),

                    };
                    
                    await ContinueOnFailureAsync(dataLakeServiceClient, directoryClient, accessControlList);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "7":

                     directoryClient =
                         dataLakeServiceClient.GetFileSystemClient("my-container").
                         GetDirectoryClient("my-parent-directory");

                     accessControlList = new List<PathAccessControlItem>()
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
                            entityId: "4a9028cf-f779-4032-b09d-970ebe3db258"),

                    };

                    await ResumeAsync(dataLakeServiceClient, directoryClient, accessControlList, null);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "8":

                    return false;

                default:

                    return true;
            }
        }
    }
}
