import io
import os
from azure.core.exceptions import HttpResponseError, ResourceExistsError
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, BlobLeaseClient, BlobPrefix, ContentSettings

class BlobSamples(object):

    # <Snippet_upload_blob_data>
    def upload_blob_data(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")
        data = b"Sample data for blob"

        # Upload the blob data - default blob type is BlockBlob
        blob_client.upload_blob(data, blob_type="BlockBlob")
    # </Snippet_upload_blob_data>

    # <Snippet_upload_blob_stream>        
    def upload_blob_stream(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")
        input_stream = io.BytesIO(os.urandom(15))
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
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")
        with open(file=os.path.join('filepath', 'filename'), mode="wb") as sample_blob:
            download_stream = blob_client.download_blob()
            sample_blob.write(download_stream.readall())
    # </Snippet_download_blob_file>

    # <Snippet_download_blob_chunks>
    def download_blob_chunks(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # This returns a StorageStreamDownloader
        stream = blob_client.download_blob()
        chunk_list = []

        # Read data in chunks to avoid loading all into memory at once
        for chunk in stream.chunks():
            # Process your data (anything can be done here - 'chunk' is a byte array)
            chunk_list.append(chunk)
    # </Snippet_download_blob_chunks>

    # <Snippet_download_blob_stream>
    def download_blob_to_stream(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # readinto() downloads the blob contents to a stream and returns the number of bytes read
        stream = io.BytesIO()
        num_bytes = blob_client.download_blob().readinto(stream)
        print(f"Number of bytes: {num_bytes}")
    # </Snippet_download_blob_stream>

    # <Snippet_download_blob_text>
    def download_blob_to_string(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # encoding param is necessary for readall() to return str, otherwise it returns bytes
        downloader = blob_client.download_blob(max_concurrency=1, encoding='UTF-8')
        blob_text = downloader.readall()
        print(f"Blob contents: {blob_text}")
    # </Snippet_download_blob_text>

    # <Snippet_acquire_blob_lease>
    def acquire_blob_lease(self, blob_service_client: BlobServiceClient, container_name):
        # Instantiate a BlobClient
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Acquire a 30-second lease on the blob
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

    # <Snippet_list_blobs_flat>
    def list_blobs_flat(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)

        blob_list = container_client.list_blobs()

        for blob in blob_list:
            print(f"Name: {blob.name}")
    # </Snippet_list_blobs_flat>

    # <Snippet_list_blobs_flat_options>
    def list_blobs_flat_options(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)

        blob_list = container_client.list_blobs(include=['tags'])

        for blob in blob_list:
            print(f"Name: {blob['name']}, Tags: {blob['tags']}")
    # </Snippet_list_blobs_flat_options> 

    # <Snippet_list_blobs_hierarchical>
    depth = 0
    indent = "  "
    def list_blobs_hierarchical(self, container_client: ContainerClient, prefix):
        for blob in container_client.walk_blobs(name_starts_with=prefix, delimiter='/'):
            if isinstance(blob, BlobPrefix):
                # Indentation is only added to show nesting in the output
                print(f"{self.indent * self.depth}{blob.name}")
                self.depth += 1
                self.list_blobs_hierarchical(container_client, prefix=blob.name)
                self.depth -= 1
            else:
                print(f"{self.indent * self.depth}{blob.name}")
    # </Snippet_list_blobs_hierarchical> 

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

    # <Snippet_copy_blob>
    def copy_blob(self, blob_service_client: BlobServiceClient):
        source_blob = blob_service_client.get_blob_client(container="source-container", blob="sample-blob.txt")

        # Make sure the source blob exists before attempting to copy
        if source_blob.exists():
            # Lease the source blob during copy to prevent other clients from modifying it
            lease = BlobLeaseClient(client=source_blob)

            # Create an infinite lease by passing -1
            # We'll break the lease after the copy operation finishes
            lease.acquire(-1)

            # Get the source blob properties
            source_blob_properties = source_blob.get_blob_properties()
            print(f"Source blob lease state: {source_blob_properties.lease.state}")

            # Identify the destination blob and begin the copy operation
            destination_blob = blob_service_client.get_blob_client(container="destination-container", blob="sample-blob.txt")
            destination_blob.start_copy_from_url(source_url=source_blob.url)

            # Get the destination blob properties
            destination_blob_properties = destination_blob.get_blob_properties()
            print(f"Copy status: {destination_blob_properties.copy.status}")
            print(f"Copy progress: {destination_blob_properties.copy.progress}")
            print(f"Copy completion time: {destination_blob_properties.copy.completion_time}")
            print(f"Total bytes copied: {destination_blob_properties.size}")

            # Break the lease on the source blob
            if source_blob_properties.lease.state == "leased":
                lease.break_lease()

                # Display updated lease state
                source_blob_properties = source_blob.get_blob_properties()
                print(f"Source blob lease state: {source_blob_properties.lease.state}")
        else:
            print("Source blob does not exist")
    # </Snippet_copy_blob>

    # <Snippet_abort_copy>
    def abort_copy(self, blob_service_client: BlobServiceClient):
        # Get the destination blob and its properties
        destination_blob = blob_service_client.get_blob_client(container="destination-container", blob="sample-blob.txt")
        destination_blob_properties = destination_blob.get_blob_properties()

        # Check the copy status and abort if pending
        if destination_blob_properties.copy.status == 'pending':
            destination_blob.abort_copy(destination_blob_properties.copy.id)
            print(f"Copy operation {destination_blob_properties.copy.id} has been aborted")
    # </Snippet_abort_copy>

    # <Snippet_delete_blob>
    def delete_blob(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")
        blob_client.delete_blob()
    # </Snippet_delete_blob>

    # <Snippet_delete_blob_snapshots>
    def delete_blob_snapshots(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")
        blob_client.delete_blob(delete_snapshots="include")
    # </Snippet_delete_blob_snapshots>

    # <Snippet_restore_blob>
    def restore_deleted_blob(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")
        blob_client.undelete_blob()
    # </Snippet_restore_blob>

    # <Snippet_restore_blob_version>
    def restore_deleted_blob_version(self, blob_service_client: BlobServiceClient, container_name):
        blob_name = "file1.txt"
        container_client = blob_service_client.get_container_client(container=container_name)

        # Get a reference to the soft-deleted base blob and list all the blob versions
        blob_client = container_client.get_blob_client(blob=blob_name)
        blob_list = container_client.list_blobs(name_starts_with=blob_name, include=['deleted','versions'])
        blob_versions = []
        for blob in blob_list:
            blob_versions.append(blob.version_id)
        
        # Get the latest version of the soft-deleted blob
        blob_versions.sort(reverse=True)
        latest_version = blob_versions[0]

        # Build the blob URI and add the version ID as a query string
        versioned_blob_url = f"{blob_client.url}?versionId={latest_version}"

        # Restore the latest version by copying it to the base blob
        blob_client.start_copy_from_url(versioned_blob_url)
    # </Snippet_restore_blob_version>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = BlobSamples()

    sample.upload_blob_data(blob_service_client, "sample-container")
    sample.upload_blob_stream(blob_service_client, "sample-container")
    sample.upload_blob_file(blob_service_client, "sample-container")
    sample.upload_blob_tags(blob_service_client, "sample-container")

    sample.download_blob_to_file(blob_service_client, "sample-container")
    sample.download_blob_chunks(blob_service_client, "sample-container")
    sample.download_blob_to_stream(blob_service_client, "sample-container")
    sample.download_blob_to_string(blob_service_client, "sample-container")

    sample.list_blobs_flat(blob_service_client, "sample-container")
    sample.list_blobs_flat_options(blob_service_client, "sample-container")

    container_client = blob_service_client.get_container_client(container="sample-container")
    sample.list_blobs_hierarchical(container_client, "")

    lease_client = sample.acquire_blob_lease(blob_service_client, "sample-container")
    sample.renew_blob_lease(lease_client)
    sample.release_blob_lease(lease_client)
    sample.break_blob_lease(lease_client)

    sample.set_properties(blob_service_client, "sample-container")
    sample.get_properties(blob_service_client, "sample-container")
    sample.set_metadata(blob_service_client, "sample-container")
    sample.get_metadata(blob_service_client, "sample-container")

    sample.set_blob_tags(blob_service_client, "sample-container")
    sample.get_blob_tags(blob_service_client, "sample-container")
    #sample.clear_blob_tags(blob_service_client, "sample-container")
    sample.find_blobs_by_tags(blob_service_client, "sample-container")

    sample.copy_blob(blob_service_client)
    #sample.abort_copy(blob_service_client)

    #sample.delete_blob(blob_service_client, "sample-container")
    #sample.restore_deleted_blob(blob_service_client, "sample-container")
    #sample.restore_deleted_blob_version(blob_service_client, "source-container")