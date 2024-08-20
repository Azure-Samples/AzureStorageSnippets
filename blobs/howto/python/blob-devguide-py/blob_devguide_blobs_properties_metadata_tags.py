# <Snippet_imports>
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, ContentSettings
# </Snippet_imports>

class BlobSamples(object):

    # <Snippet_get_blob_properties>
    def get_properties(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        properties = blob_client.get_blob_properties()

        print(f"Blob type: {properties.blob_type}")
        print(f"Blob size: {properties.size}")
        print(f"Content type: {properties.content_settings.content_type}")
        print(f"Content language: {properties.content_settings.content_language}")
    # </Snippet_get_blob_properties>

    # <Snippet_set_blob_properties>
    def set_properties(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Get the existing blob properties
        properties = blob_client.get_blob_properties()

        # Set the content_type and content_language headers, and populate the remaining headers from the existing properties
        blob_headers = ContentSettings(content_type="text/plain",
                                       content_encoding=properties.content_settings.content_encoding,
                                       content_language="en-US",
                                       content_disposition=properties.content_settings.content_disposition,
                                       cache_control=properties.content_settings.cache_control,
                                       content_md5=properties.content_settings.content_md5)
        
        blob_client.set_http_headers(blob_headers)
    # </Snippet_set_blob_properties>

    # <Snippet_set_blob_metadata>
    def set_metadata(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Retrieve existing metadata, if desired
        blob_metadata = blob_client.get_blob_properties().metadata

        more_blob_metadata = {'docType': 'text', 'docCategory': 'reference'}
        blob_metadata.update(more_blob_metadata)

        # Set metadata on the blob
        blob_client.set_blob_metadata(metadata=blob_metadata)
    # </Snippet_set_blob_metadata>

    # <Snippet_get_blob_metadata>
    def get_metadata(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Retrieve existing metadata, if desired
        blob_metadata = blob_client.get_blob_properties().metadata

        for k, v in blob_metadata.items():
            print(k, v)
    # </Snippet_get_blob_metadata>

    # <Snippet_set_blob_tags>
    def set_blob_tags(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Get any existing tags for the blob if they need to be preserved
        tags = blob_client.get_blob_tags()

        # Add or modify tags
        updated_tags = {'Sealed': 'false', 'Content': 'image', 'Date': '2022-01-01'}
        tags.update(updated_tags)

        blob_client.set_blob_tags(tags)
    # </Snippet_set_blob_tags>

    # <Snippet_get_blob_tags>
    def get_blob_tags(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        tags = blob_client.get_blob_tags()
        print("Blob tags: ")
        for k, v in tags.items():
            print(k, v)
    # </Snippet_get_blob_tags>

    # <Snippet_clear_blob_tags>
    def clear_blob_tags(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Pass in empty dict object to clear tags
        tags = dict()
        blob_client.set_blob_tags(tags)
    # </Snippet_clear_blob_tags>

    # <Snippet_find_blobs_by_tags>
    def find_blobs_by_tags(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)

        query = "\"Content\"='image'"
        blob_list = container_client.find_blobs_by_tags(filter_expression=query)
        
        print("Blobs tagged as images")
        for blob in blob_list:
            print(blob.name)
    # </Snippet_find_blobs_by_tags>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = BlobSamples()

    sample.set_properties(blob_service_client, "sample-container")
    sample.get_properties(blob_service_client, "sample-container")
    sample.set_metadata(blob_service_client, "sample-container")
    sample.get_metadata(blob_service_client, "sample-container")

    sample.set_blob_tags(blob_service_client, "sample-container")
    sample.get_blob_tags(blob_service_client, "sample-container")
    #sample.clear_blob_tags(blob_service_client, "sample-container")
    sample.find_blobs_by_tags(blob_service_client, "sample-container")