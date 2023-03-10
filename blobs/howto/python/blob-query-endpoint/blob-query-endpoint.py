from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.storage import StorageManagementClient

class BlobEndpointSample(object):

    # <Snippet_query_blob_endpoint>
    def get_blob_service_endpoint(self, storage_account_name, credential: DefaultAzureCredential) -> str:
        subscription_id = "<subscription-id>"
        rg_name = "<resource-group-name>"

        resource_mgmt_client = ResourceManagementClient(
            credential=credential,
            subscription_id=subscription_id
        )
        resource_mgmt_client.providers.register('Microsoft.Storage')

        storage_mgmt_client = StorageManagementClient(
            credential=credential,
            subscription_id=subscription_id
        )
        
        # Get storage account
        storage_account = storage_mgmt_client.storage_accounts.get_properties(
            resource_group_name=rg_name,
            account_name=storage_account_name
        )
        
        # Get blob service endpoint
        endpoint = storage_account.primary_endpoints.blob

        return endpoint
    # </Snippet_query_blob_endpoint>

if __name__ == '__main__':
    # <Snippet_create_client_with_endpoint>
    storage_account_name = "<storage-account-name>"
    credential = DefaultAzureCredential()

    sample = BlobEndpointSample()
    endpoint = sample.get_blob_service_endpoint(storage_account_name, credential)
    print(f"URL: {endpoint}")

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url=endpoint, credential=credential)

    # Do something with the storage account or its resources ...
    # </Snippet_create_client_with_endpoint>
