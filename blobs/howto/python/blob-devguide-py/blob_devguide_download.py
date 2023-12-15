import io
import os
import uuid
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, ContainerClient, BlobBlock, BlobClient

class BlobSamples(object):

    # <Snippet_download_blob_file>
    def download_blob_to_file(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")
        with open(file=os.path.join(r'filepath', 'filename'), mode="wb") as sample_blob:
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

    # <Snippet_download_blob_transfer_options>
    def download_blob_transfer_options(self, account_url: str, container_name: str, blob_name: str):
        # Create a BlobClient object with data transfer options for download
        blob_client = BlobClient(
            account_url=account_url, 
            container_name=container_name, 
            blob_name=blob_name,
            credential=DefaultAzureCredential(),
            max_single_get_size=1024*1024*32, # 32 MiB
            max_chunk_get_size=1024*1024*4 # 4 MiB
        )

        with open(file=os.path.join(r'file_path', 'file_name'), mode="wb") as sample_blob:
            download_stream = blob_client.download_blob(max_concurrency=2)
            sample_blob.write(download_stream.readall())
    # </Snippet_download_blob_transfer_options>

    # <Snippet_download_blob_transfer_validation>
    def download_blob_transfer_validation(self, blob_service_client: BlobServiceClient, container_name: str, blob_name: str):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)

        with open(file=os.path.join(r'file_path', 'file_name'), mode="wb") as sample_blob:
            download_stream = blob_client.download_blob(validate_content=True)
            sample_blob.write(download_stream.readall())
    # </Snippet_download_blob_transfer_validation>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = BlobSamples()

    #sample.download_blob_to_file(blob_service_client, "sample-container")
    #sample.download_blob_chunks(blob_service_client, "sample-container")
    #sample.download_blob_to_stream(blob_service_client, "sample-container")
    #sample.download_blob_to_string(blob_service_client, "sample-container")
    sample.download_blob_transfer_options(account_url, "sample-container", "sample-blob.txt")
    sample.download_blob_transfer_validation(blob_service_client, "sample-container", "sample-blob.txt")