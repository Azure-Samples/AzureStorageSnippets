import asyncio
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import BlobServiceClient

class ContainerSamples(object):

    # <Snippet_list_containers>
    async def list_containers(self, blob_service_client: BlobServiceClient):
        async for container in blob_service_client.list_containers(include_metadata=True):
            print(container['name'], container['metadata'])
    # </Snippet_list_containers>

    # <Snippet_list_containers_prefix>
    async def list_containers_prefix(self, blob_service_client: BlobServiceClient):
        async for container in blob_service_client.list_containers(name_starts_with='test-'):
            print(container['name'])
    # </Snippet_list_containers_prefix>

    # <Snippet_list_containers_pages>
    async def list_containers_pages(self, blob_service_client: BlobServiceClient):
        i=0
        async for container_page in blob_service_client.list_containers(results_per_page=5).by_page():
            i += 1
            print(f"Page {i}")
            async for container in container_page:
                print(container['name'])
    # </Snippet_list_containers_pages>

# <Snippet_create_client_async>
async def main():
    sample = ContainerSamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        await sample.list_containers_pages(blob_service_client)

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>