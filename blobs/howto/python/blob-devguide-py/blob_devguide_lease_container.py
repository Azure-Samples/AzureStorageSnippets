# <Snippet_imports>
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobLeaseClient
# </Snippet_imports>

class ContainerSamples(object):

    # <Snippet_acquire_container_lease>
    def acquire_container_lease(self, blob_service_client: BlobServiceClient, container_name):
        # Instantiate a ContainerClient
        container_client = blob_service_client.get_container_client(container=container_name)

        # Acquire a 30-second lease on the container
        lease_client = container_client.acquire_lease(30)

        return lease_client
    # </Snippet_acquire_container_lease>

    # <Snippet_renew_container_lease>
    def renew_container_lease(self, lease_client: BlobLeaseClient):
        # Renew a lease on the container
        lease_client.renew()
    # </Snippet_renew_container_lease>

    # <Snippet_release_container_lease>
    def release_container_lease(self, lease_client: BlobLeaseClient):
        # Release a lease on the container
        lease_client.release()
    # </Snippet_release_container_lease>

    # <Snippet_break_container_lease>
    def break_container_lease(self, lease_client: BlobLeaseClient):
        # Break a lease on the container
        lease_client.break_lease()
    # </Snippet_break_container_lease>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = ContainerSamples()

    lease_client = sample.acquire_container_lease(blob_service_client, "sample-container")
    sample.renew_container_lease(lease_client)
    sample.release_container_lease(lease_client)
    sample.break_container_lease(lease_client)