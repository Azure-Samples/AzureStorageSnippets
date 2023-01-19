import io
import os, uuid
import random
import time
from azure.core.exceptions import HttpResponseError, ResourceExistsError
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, BlobLeaseClient, ContentSettings

class BlobSamples(object):

    # <Snippet_upload_blob_data>
    def upload_blob_data(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_container_client(container=container_name).get_blob_client("sample-blob.txt")
        data = "Sample data for blob"
        blob_client.upload_blob(data, blob_type="BlockBlob")
    # </Snippet_upload_blob_data>

    # <Snippet_upload_blob_stream>
    def get_random_bytes(self, size):
        rand = random.Random()
        result = bytearray(size)
        for i in range(size):
            result[i] = rand.randint(0, 255)
        return bytes(result)
        
    def upload_blob_stream(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_container_client(container=container_name).get_blob_client("sample-blob.txt")
        input_stream = io.BytesIO(self.get_random_bytes(15))
        blob_client.upload_blob(input_stream, blob_type="BlockBlob")
    # </Snippet_upload_blob_stream>

    # <Snippet_upload_blob_file>
    def upload_blob_file(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)
        with open(file=os.path.join('filepath', 'filename'), mode="rb") as data:
            blob_client = container_client.upload_blob(name="sample-blob.txt", data=data, overwrite=True)
    # </Snippet_upload_blob_file>

    # <Snippet_upload_blob_tags>
    def upload_blob_tags(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)
        sample_tags = {"Content": "image", "Date": "2022-01-01"}
        with open(file=os.path.join('filepath', 'filename'), mode="rb") as data:
            blob_client = container_client.upload_blob(name="sample-blob.txt", data=data, tags=sample_tags)
    # </Snippet_upload_blob_tags>

    # <Snippet_download_blob_file>
    def download_blob_to_file(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_container_client(container=container_name).get_blob_client("sample-blob.txt")
        with open(file=os.path.join('filepath', 'filename'), mode="wb") as sample_blob:
            download_stream = blob_client.download_blob()
            sample_blob.write(download_stream.readall())
    # </Snippet_download_blob_file>

    # <Snippet_download_blob_chunks>
    def download_blob_chunks(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_container_client(container=container_name).get_blob_client("sample-blob.txt")

        # This returns a StorageStreamDownloader
        stream = blob_client.download_blob()
        chunk_list = []

        # Read data in chunks to avoid loading all into memory at once
        for chunk in stream.chunks():
            # Process your data (anything can be done here - `chunk` is a byte array)
            chunk_list.append(chunk)
    # </Snippet_download_blob_chunks>

    # <Snippet_download_blob_stream>
    def download_blob_to_stream(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_container_client(container=container_name).get_blob_client("sample-blob.txt")

        # readinto() downloads the blob contents to a stream and returns the number of bytes read
        stream = io.BytesIO()
        num_bytes = blob_client.download_blob().readinto(stream)
        print(f"Number of bytes: {num_bytes}")
    # </Snippet_download_blob_stream>

    # <Snippet_download_blob_text>
    def download_blob_to_string(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_container_client(container=container_name).get_blob_client("sample-blob.txt")

        # content_as_text() downloads the blob contents and decodes as text - default values are shown for parameters
        blob_text = blob_client.download_blob().content_as_text(max_concurrency=1, encoding='UTF-8')
        print(f"Blob contents: {blob_text}")
    # </Snippet_download_blob_text>

    # <Snippet_list_containers>
    def list_containers(self, blob_service_client: BlobServiceClient):
        i=0
        all_pages = blob_service_client.list_containers(include_metadata=True, results_per_page=5).by_page()
        for container_page in all_pages:
            i += 1
            print(f"Page {i}")
            for container in container_page:
                print(container['name'], container['metadata'])
    # </Snippet_list_containers>

    # <Snippet_list_containers_prefix>
    def list_containers_prefix(self, blob_service_client: BlobServiceClient):
        containers = blob_service_client.list_containers(name_starts_with='test-')
        for container in containers:
            print(container['name'])
    # </Snippet_list_containers_prefix>

    # <Snippet_acquire_blob_lease>
    def acquire_blob_lease(self, blob_service_client: BlobServiceClient, container_name):
        # Instantiate a ContainerClient
        blob_client = blob_service_client.get_container_client(container=container_name).get_blob_client("sample-blob.txt")

        # Acquire a 30-second lease on the container
        lease_client = blob_client.acquire_lease(30)

        return lease_client
    # </Snippet_acquire_blob_lease>

    # <Snippet_renew_blob_lease>
    def renew_blob_lease(self, lease_client: BlobLeaseClient):
        # Renew a lease on a blob
        lease_client.renew()
    # </Snippet_renew_blob_lease>

    # <Snippet_release_blob_lease>
    def release_blob_lease(self, lease_client: BlobLeaseClient):
        # Release a lease on a blob
        lease_client.release()
    # </Snippet_release_blob_lease>

    # <Snippet_break_blob_lease>
    def break_blob_lease(self, lease_client: BlobLeaseClient):
        # Break a lease on a blob
        lease_client.break_lease()
    # </Snippet_break_blob_lease>

    # <Snippet_get_blob_properties>
    def get_properties(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_container_client(container=container_name).get_blob_client("sample-blob.txt")

        properties = blob_client.get_blob_properties()

        print(f"Blob type: {properties.blob_type}")
        print(f"Blob size: {properties.size}")
        print(f"Content type: {properties.content_settings.content_type}")
        print(f"Content language: {properties.content_settings.content_language}")
    # </Snippet_set_blob_properties>

    # <Snippet_set_blob_properties>
    def set_properties(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_container_client(container=container_name).get_blob_client("sample-blob.txt")

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
        blob_client = blob_service_client.get_container_client(container=container_name).get_blob_client("sample-blob.txt")

        # Retrieve existing metadata, if desired
        metadata = dict(blob_client.get_blob_properties().metadata)

        more_metadata = {'docType': 'text', 'docCategory': 'reference'}
        metadata.update(more_metadata)

        # Set metadata on the blob
        blob_client.set_blob_metadata(metadata=metadata)
    # </Snippet_set_blob_metadata>

    # <Snippet_get_blob_metadata>
    def get_metadata(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_container_client(container=container_name).get_blob_client("sample-blob.txt")

        # Retrieve existing metadata, if desired
        metadata = dict(blob_client.get_blob_properties().metadata)

        for key, value in metadata.items():
            print(key, value)
    # </Snippet_get_blob_metadata>

    # <Snippet_delete_container>
    def delete_container(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)
        container_client.delete_container()
    # </Snippet_delete_container>

    # <Snippet_delete_container_prefix>
    def delete_container_prefix(self, blob_service_client: BlobServiceClient):
        container_list = list(blob_service_client.list_containers(name_starts_with="test-"))
        assert len(container_list) >= 1

        for container in container_list:
            # Find containers with the specified prefix and delete
            container_client = blob_service_client.get_container_client(container=container.name)
            container_client.delete_container()
    # </Snippet_delete_container_prefix>

    # <Snippet_restore_container>
    def restore_deleted_container(self, blob_service_client: BlobServiceClient, container_name):
        container_list = list(blob_service_client.list_containers(include_deleted=True))
        assert len(container_list) >= 1

        for container in container_list:
            # Find the deleted container and restore it
            if container.deleted and container.name == container_name:
                restored_container_client = blob_service_client.undelete_container(container.name, container.version)
    # </Snippet_restore_container>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = BlobSamples()

    #sample.upload_blob_data(blob_service_client, "sample-container")
    #sample.upload_blob_stream(blob_service_client, "sample-container")
    #sample.upload_blob_file(blob_service_client, "sample-container")
    #sample.upload_blob_tags(blob_service_client, "sample-container")

    #sample.download_blob_to_file(blob_service_client, "sample-container")
    #sample.download_blob_chunks(blob_service_client, "sample-container")
    #sample.download_blob_to_stream(blob_service_client, "sample-container")
    #sample.download_blob_to_string(blob_service_client, "sample-container")

    #sample.list_blobs_flat(blob_service_client)
    #sample.list_blobs_flat_options(blob_service_client)
    #sample.list_blobs_hierarchical(blob_service_client)

    #lease_client = sample.acquire_blob_lease(blob_service_client, "sample-container")
    #sample.renew_blob_lease(lease_client)
    #sample.release_blob_lease(lease_client)
    #sample.break_blob_lease(lease_client)

    sample.get_properties(blob_service_client, "sample-container")
    sample.set_metadata(blob_service_client, "sample-container")
    sample.get_metadata(blob_service_client, "sample-container")

    #sample.set_blob_tags(blob_service_client, "sample-container")
    #sample.get_blob_tags(blob_service_client, "sample-container")
    #sample.clear_blob_tags(blob_service_client, "sample-container")

    #sample.copy_blob(blob_service_client, "sample-container")

    #sample.delete_blob(blob_service_client, "sample-container")