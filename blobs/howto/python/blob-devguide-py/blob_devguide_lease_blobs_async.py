# <Snippet_imports>
import asyncio
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import BlobServiceClient, BlobLeaseClient 
# </Snippet_imports>

class BlobSamples(object):

    # <Snippet_acquire_blob_lease>
    async def acquire_blob_lease(self, blob_service_client: BlobServiceClient, container_name):
        # Instantiate a BlobClient
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Acquire a 30-second lease on the blob
        lease_client = await blob_client.acquire_lease(30)

        return lease_client
    # </Snippet_acquire_blob_lease>

    # <Snippet_renew_blob_lease>
    async def renew_blob_lease(self, lease_client: BlobLeaseClient):
        # Renew a lease on a blob
        await lease_client.renew()
    # </Snippet_renew_blob_lease>

    # <Snippet_release_blob_lease>
    async def release_blob_lease(self, lease_client: BlobLeaseClient):
        # Release a lease on a blob
        await lease_client.release()
    # </Snippet_release_blob_lease>

    # <Snippet_break_blob_lease>
    async def break_blob_lease(self, lease_client: BlobLeaseClient):
        # Break a lease on a blob
        await lease_client.break_lease()
    # </Snippet_break_blob_lease>

# <Snippet_create_client_async>
async def main():
    sample = BlobSamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        lease_client = await sample.acquire_blob_lease(blob_service_client, "sample-container")

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>