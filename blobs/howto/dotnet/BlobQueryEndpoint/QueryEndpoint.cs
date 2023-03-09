using Azure.ResourceManager;
using Azure.ResourceManager.Resources;
using Azure.ResourceManager.Storage;

namespace ManagementTasks
{
    public static class AccountProperties
    {
        // <Snippet_QueryEndpoint>
        public static async Task<string> GetBlobServiceEndpoint(string storageAccountName, TokenCredential credential)
        {
            // TODO: replace with your subscription ID and resource group name
            // You can locate your subscription ID on the Subscriptions blade of the Azure Portal (https://portal.azure.com)
            const string subscriptionId = "<subscription-id>";
            const string rgName = "<resource-group-name>";

            ArmClient armClient = new(credential);

            // Create a resource identifier, then get the subscription resource
            ResourceIdentifier resourceIdentifier = new($"/subscriptions/{subscriptionId}");
            SubscriptionResource subscription = armClient.GetSubscriptionResource(resourceIdentifier);

            // Register the Storage resource provider in the subscription
            ResourceProviderResource resourceProvider = await subscription.GetResourceProviderAsync("Microsoft.Storage");
            resourceProvider.Register();

            // Get a resource group
            ResourceGroupResource resourceGroup = await subscription.GetResourceGroupAsync(rgName);

            // Get a collection of storage account resources
            StorageAccountCollection accountCollection = resourceGroup.GetStorageAccounts();

            // Get the properties for the specified storage account
            StorageAccountResource storageAccount = await accountCollection.GetAsync(storageAccountName);

            // Get the primary endpoint for the blob service
            string endpoint = storageAccount.Data.PrimaryEndpoints.BlobUri.ToString();

            return endpoint;
        }
        // </Snippet_QueryEndpoint>
    }
}