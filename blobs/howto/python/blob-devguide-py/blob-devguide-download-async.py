import io
import asyncio
import os
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import BlobServiceClient, BlobClient

class BlobSamples(object):

    # <Snippet_download_blob_file>
    async def download_blob_to_file(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")
        with open(file=os.path.join(r'filepath', 'filename'), mode="wb") as sample_blob:
            download_stream = await blob_client.download_blob()
            data = await download_stream.readall()
            sample_blob.write(data)
    # </Snippet_download_blob_file>

    # <Snippet_download_blob_chunks>
    async def download_blob_chunks(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # This returns a StorageStreamDownloader
        stream = await blob_client.download_blob()
        chunk_list = []

        # Read data in chunks to avoid loading all into memory at once
        async for chunk in stream.chunks():
            # Process your data (anything can be done here - 'chunk' is a byte array)
            chunk_list.append(chunk)
    # </Snippet_download_blob_chunks>

    # <Snippet_download_blob_stream>
    async def download_blob_to_stream(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # readinto() downloads the blob contents to a stream and returns the number of bytes read
        stream = io.BytesIO()
        downloader = await blob_client.download_blob()
        num_bytes = await downloader.readinto(stream)
        print(f"Number of bytes: {num_bytes}")
    # </Snippet_download_blob_stream>

    # <Snippet_download_blob_text>
    async def download_blob_to_string(self, blob_service_client: BlobServiceClient, container_name):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # encoding param is necessary for readall() to return str, otherwise it returns bytes
        downloader = await blob_client.download_blob(max_concurrency=1, encoding='UTF-8')
        blob_text = await downloader.readall()
        print(f"Blob contents: {blob_text}")
    # </Snippet_download_blob_text>

    # <Snippet_download_blob_transfer_options>
    async def download_blob_transfer_options(self, account_url: str, container_name: str, blob_name: str):
        # Create a BlobClient object with data transfer options for download
        async with BlobClient(
            account_url=account_url, 
            container_name=container_name, 
            blob_name=blob_name,
            credential=DefaultAzureCredential(),
            max_single_get_size=1024*1024*32, # 32 MiB
            max_chunk_get_size=1024*1024*4 # 4 MiB
        ) as blob_client:

            with open(file=os.path.join(r'file_path', 'file_name'), mode="wb") as sample_blob:
                download_stream = await blob_client.download_blob(max_concurrency=2)
                data = await download_stream.readall()
                sample_blob.write(data)
    # </Snippet_download_blob_transfer_options>

    # <Snippet_download_blob_transfer_validation>
    async def download_blob_transfer_validation(self, blob_service_client: BlobServiceClient, container_name: str, blob_name: str):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)

        with open(file=os.path.join(r'file_path', 'file_name'), mode="wb") as sample_blob:
            download_stream = await blob_client.download_blob(validate_content=True)
            data = await download_stream.readall()
            sample_blob.write(data)
    # </Snippet_download_blob_transfer_validation>

# <Snippet_create_client_async>
async def main():
    sample = BlobSamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        await sample.download_blob_to_file(blob_service_client, "sample-container")

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>