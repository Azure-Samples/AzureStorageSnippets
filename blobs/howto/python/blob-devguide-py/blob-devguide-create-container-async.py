import asyncio
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import BlobServiceClient
from azure.core.exceptions import ResourceExistsError

class ContainerSamples(object):

    # <Snippet_create_container>
    async def create_blob_container(self, blob_service_client: BlobServiceClient, container_name):
        try:
            container_client = await blob_service_client.create_container(name=container_name)
        except ResourceExistsError:
            print('A container with this name already exists')
    # </Snippet_create_container>

    # <Snippet_create_root_container>
    async def create_blob_root_container(self, blob_service_client: BlobServiceClient):
        container_client = blob_service_client.get_container_client(container="$root")

        # Create the root container if it doesn't already exist
        if not await container_client.exists():
            await container_client.create_container()
    # </Snippet_create_root_container>

# <Snippet_create_client_async>
async def main():
    sample = ContainerSamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        await sample.create_blob_container(blob_service_client, "sample-container")

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>