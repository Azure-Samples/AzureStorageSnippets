# <Snippet_imports>
import asyncio
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import BlobServiceClient
from azure.storage.blob import ContentSettings
# </Snippet_imports>

class BlobSamples(object):

    # <Snippet_get_blob_properties>
    async def get_properties(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        properties = await blob_client.get_blob_properties()

        print(f"Blob type: {properties.blob_type}")
        print(f"Blob size: {properties.size}")
        print(f"Content type: {properties.content_settings.content_type}")
        print(f"Content language: {properties.content_settings.content_language}")
    # </Snippet_get_blob_properties>

    # <Snippet_set_blob_properties>
    async def set_properties(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Get the existing blob properties
        properties = await blob_client.get_blob_properties()

        # Set the content_type and content_language headers, and populate the remaining headers from the existing properties
        blob_headers = ContentSettings(content_type="text/plain",
                                       content_encoding=properties.content_settings.content_encoding,
                                       content_language="en-US",
                                       content_disposition=properties.content_settings.content_disposition,
                                       cache_control=properties.content_settings.cache_control,
                                       content_md5=properties.content_settings.content_md5)
        
        await blob_client.set_http_headers(blob_headers)
    # </Snippet_set_blob_properties>

    # <Snippet_set_blob_metadata>
    async def set_metadata(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Retrieve existing metadata, if desired
        properties = await blob_client.get_blob_properties()
        blob_metadata = properties.metadata

        more_blob_metadata = {'docType': 'text', 'docCategory': 'reference'}
        blob_metadata.update(more_blob_metadata)

        # Set metadata on the blob
        await blob_client.set_blob_metadata(metadata=blob_metadata)
    # </Snippet_set_blob_metadata>

    # <Snippet_get_blob_metadata>
    async def get_metadata(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Retrieve existing metadata, if desired
        properties = await blob_client.get_blob_properties()
        blob_metadata = properties.metadata

        for k, v in blob_metadata.items():
            print(k, v)
    # </Snippet_get_blob_metadata>

    # <Snippet_set_blob_tags>
    async def set_blob_tags(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Get any existing tags for the blob if they need to be preserved
        tags = await blob_client.get_blob_tags()

        # Add or modify tags
        updated_tags = {'Sealed': 'false', 'Content': 'image', 'Date': '2022-01-01'}
        tags.update(updated_tags)

        await blob_client.set_blob_tags(tags)
    # </Snippet_set_blob_tags>

    # <Snippet_get_blob_tags>
    async def get_blob_tags(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        tags = await blob_client.get_blob_tags()
        print("Blob tags: ")
        for k, v in tags.items():
            print(k, v)
    # </Snippet_get_blob_tags>

    # <Snippet_clear_blob_tags>
    async def clear_blob_tags(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Pass in empty dict object to clear tags
        tags = dict()
        await blob_client.set_blob_tags(tags)
    # </Snippet_clear_blob_tags>

    # <Snippet_find_blobs_by_tags>
    async def find_blobs_by_tags(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)

        query = "\"Content\"='image'"
        blob_list = await container_client.find_blobs_by_tags(filter_expression=query)
        
        print("Blobs tagged as images")
        for blob in blob_list:
            print(blob.name)
    # </Snippet_find_blobs_by_tags>

# <Snippet_create_client_async>
async def main():
    sample = BlobSamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        await sample.set_properties(blob_service_client, "sample-container")
        await sample.get_properties(blob_service_client, "sample-container")
        await sample.set_metadata(blob_service_client, "sample-container")
        await sample.get_metadata(blob_service_client, "sample-container")

        await sample.set_blob_tags(blob_service_client, "sample-container")
        await sample.get_blob_tags(blob_service_client, "sample-container")

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>