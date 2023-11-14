import io
import asyncio
import os
import uuid
from azure.storage.blob import BlobBlock, StandardBlobTier
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import BlobServiceClient, ContainerClient, BlobClient

class BlobSamples(object):

    # <Snippet_upload_blob_data>
    async def upload_blob_data(self, blob_service_client: BlobServiceClient, container_name: str):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")
        data = b"Sample data for blob"

        # Upload the blob data - default blob type is BlockBlob
        await blob_client.upload_blob(data, blob_type="BlockBlob")
    # </Snippet_upload_blob_data>

    # <Snippet_upload_blob_stream>        
    async def upload_blob_stream(self, blob_service_client: BlobServiceClient, container_name: str):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")
        input_stream = io.BytesIO(os.urandom(15))
        await blob_client.upload_blob(input_stream, blob_type="BlockBlob")
    # </Snippet_upload_blob_stream>

    # <Snippet_upload_blob_file>
    async def upload_blob_file(self, blob_service_client: BlobServiceClient, container_name: str):
        container_client = blob_service_client.get_container_client(container=container_name)
        with open(file=os.path.join('filepath', 'filename'), mode="rb") as data:
            blob_client = await container_client.upload_blob(name="sample-blob.txt", data=data, overwrite=True)
    # </Snippet_upload_blob_file>

    # <Snippet_upload_blob_tags>
    async def upload_blob_tags(self, blob_service_client: BlobServiceClient, container_name: str):
        container_client = blob_service_client.get_container_client(container=container_name)
        sample_tags = {"Content": "image", "Date": "2022-01-01"}
        with open(file=os.path.join('filepath', 'filename'), mode="rb") as data:
            blob_client = await container_client.upload_blob(name="sample-blob.txt", data=data, tags=sample_tags)
    # </Snippet_upload_blob_tags>

    # <Snippet_upload_blob_blocks>
    async def upload_blocks(self, blob_container_client: ContainerClient, local_file_path: str, block_size: int):
        file_name = os.path.basename(local_file_path)
        blob_client = blob_container_client.get_blob_client(file_name)

        with open(file=local_file_path, mode="rb") as file_stream:
            block_id_list = []

            while True:
                buffer = file_stream.read(block_size)
                if not buffer:
                    break

                block_id = uuid.uuid4().hex
                block_id_list.append(BlobBlock(block_id=block_id))

                await blob_client.stage_block(block_id=block_id, data=buffer, length=len(buffer))

            await blob_client.commit_block_list(block_id_list)
    # </Snippet_upload_blob_blocks>

    # <Snippet_upload_blob_transfer_options>
    async def upload_blob_transfer_options(self, account_url: str, container_name: str, blob_name: str):
        # Create a BlobClient object with data transfer options for upload
        async with BlobClient(
            account_url=account_url, 
            container_name=container_name, 
            blob_name=blob_name,
            credential=DefaultAzureCredential(),
            max_block_size=1024*1024*4, # 4 MiB
            max_single_put_size=1024*1024*8 # 8 MiB
        ) as blob_client:
        
            with open(file=os.path.join(r'file_path', blob_name), mode="rb") as data:
                await blob_client.upload_blob(data=data, overwrite=True, max_concurrency=2)
    # </Snippet_upload_blob_transfer_options>

    # <Snippet_upload_blob_access_tier>
    async def upload_blob_access_tier(self, blob_service_client: BlobServiceClient, container_name: str, blob_name: str):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        
        #Upload blob to the cool tier
        with open(file=os.path.join(r'file_path', blob_name), mode="rb") as data:
            blob_client = await blob_client.upload_blob(data=data, overwrite=True, standard_blob_tier=StandardBlobTier.COOL)
    # </Snippet_upload_blob_access_tier>

    # <Snippet_upload_blob_transfer_validation>
    async def upload_blob_transfer_validation(self, blob_service_client: BlobServiceClient, container_name: str, blob_name: str):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        
        #Upload blob to the cool tier
        with open(file=os.path.join(r'file_path', blob_name), mode="rb") as data:
            blob_client = await blob_client.upload_blob(data=data, overwrite=True, validate_content=True)
    # </Snippet_upload_blob_transfer_validation>

# <Snippet_create_client_async>
async def main():
    sample = BlobSamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        await sample.upload_blob_data(blob_service_client, "sample-container")

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>