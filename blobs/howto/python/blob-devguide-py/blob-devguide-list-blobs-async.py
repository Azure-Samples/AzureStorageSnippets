import asyncio
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import BlobServiceClient, ContainerClient, BlobPrefix

class BlobSamples(object):

    # <Snippet_list_blobs_flat>
    async def list_blobs_flat(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)

        async for blob in container_client.list_blobs():
            print(f"Name: {blob.name}")
    # </Snippet_list_blobs_flat>

    # <Snippet_list_blobs_flat_options>
    async def list_blobs_flat_options(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)

        async for blob in container_client.list_blobs(include=['tags']):
            print(f"Name: {blob['name']}, Tags: {blob['tags']}")
    # </Snippet_list_blobs_flat_options> 

    # <Snippet_list_blobs_hierarchical>
    depth = 0
    indent = "  "
    async def list_blobs_hierarchical(self, container_client: ContainerClient, prefix):
        async for blob in container_client.walk_blobs(name_starts_with=prefix, delimiter='/'):
            if isinstance(blob, BlobPrefix):
                # Indentation is only added to show nesting in the output
                print(f"{self.indent * self.depth}{blob.name}")
                self.depth += 1
                await self.list_blobs_hierarchical(container_client, prefix=blob.name)
                self.depth -= 1
            else:
                print(f"{self.indent * self.depth}{blob.name}")
    # </Snippet_list_blobs_hierarchical> 

# <Snippet_create_client_async>
async def main():
    sample = BlobSamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        sample.list_blobs_flat(blob_service_client, "sample-container")

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>