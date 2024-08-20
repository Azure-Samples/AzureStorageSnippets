# <Snippet_imports>
import asyncio
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import BlobServiceClient, BlobLeaseClient
# </Snippet_imports>

class ContainerSamples(object):

    # <Snippet_acquire_container_lease>
    async def acquire_container_lease(self, blob_service_client: BlobServiceClient, container_name):
        # Instantiate a ContainerClient
        container_client = blob_service_client.get_container_client(container=container_name)

        # Acquire a 30-second lease on the container
        lease_client = BlobLeaseClient(container_client)
        await lease_client.acquire(lease_duration=30)

        return lease_client
    # </Snippet_acquire_container_lease>

    # <Snippet_renew_container_lease>
    async def renew_container_lease(self, lease_client: BlobLeaseClient):
        # Renew a lease on the container
        await lease_client.renew()
    # </Snippet_renew_container_lease>

    # <Snippet_release_container_lease>
    async def release_container_lease(self, lease_client: BlobLeaseClient):
        # Release a lease on the container
        await lease_client.release()
    # </Snippet_release_container_lease>

    # <Snippet_break_container_lease>
    async def break_container_lease(self, lease_client: BlobLeaseClient):
        # Break a lease on the container
        await lease_client.break_lease()
    # </Snippet_break_container_lease>

# <Snippet_create_client_async>
async def main():
    sample = ContainerSamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        lease_client = await sample.acquire_container_lease(blob_service_client, "sample-container")

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>