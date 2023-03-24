using Azure.ResourceManager;
using Azure.ResourceManager.Resources;
using Azure.ResourceManager.Storage;

namespace ManagementTasks
{
    public static class AccountProperties
    {
        // <Snippet_QueryEndpoint>
        public static async Task<Uri> GetBlobServiceEndpoint(
            string storageAccountName,
            TokenCredential credential)
        {
            // TODO: replace with your subscription ID and resource group name
            // You can locate your subscription ID on the Subscriptions blade
            // of the Azure portal (https://portal.azure.com)
            const string subscriptionId = "<subscription-id>";
            const string rgName = "<resource-group-name>";

            ArmClient armClient = new(credential);

            // Create a resource identifier, then get the subscription resource
            ResourceIdentifier resourceIdentifier = new($"/subscriptions/{subscriptionId}");
            SubscriptionResource subscription = armClient.GetSubscriptionResource(resourceIdentifier);

            // Get a resource group
            ResourceGroupResource resourceGroup = await subscription.GetResourceGroupAsync(rgName);

            // Get a collection of storage account resources
            StorageAccountCollection accountCollection = resourceGroup.GetStorageAccounts();

            // Get the properties for the specified storage account
            StorageAccountResource storageAccount = await accountCollection.GetAsync(storageAccountName);

            // Return the primary endpoint for the blob service
            return storageAccount.Data.PrimaryEndpoints.BlobUri;
        }
        // </Snippet_QueryEndpoint>

        // <Snippet_RegisterSRP>
        public static async Task RegisterSRPInSubscription(SubscriptionResource subscription)
        {
            ResourceProviderResource resourceProvider = 
                await subscription.GetResourceProviderAsync("Microsoft.Storage");

            // Check the registration state of the resource provider and register, if needed
            if (resourceProvider.Data.RegistrationState == "NotRegistered")
                resourceProvider.Register();
        }
        // </Snippet_RegisterSRP>
    }
}