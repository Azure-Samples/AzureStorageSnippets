import os, uuid
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient

class AuthSamples(object):

    # <Snippet_get_service_client_DAC>
    def get_blob_service_client_token_credential(self):
        # TODO: Replace <storage-account-name> with your actual storage account name
        account_url = "https://<storage-account-name>.blob.core.windows.net"
        credential = DefaultAzureCredential()

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential)

        return blob_service_client
    # </Snippet_get_service_client_DAC>

    # <Snippet_get_service_client_SAS>
    def get_blob_service_client_sas(self, sas_token: str):
        # TODO: Replace <storage-account-name> with your actual storage account name
        account_url = "https://<storage-account-name>.blob.core.windows.net"
        # The SAS token string can be assigned to credential here or appended to the account URL
        credential = sas_token

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential)

        return blob_service_client
    # </Snippet_get_service_client_SAS>

    # <Snippet_get_service_client_account_key>
    def get_blob_service_client_account_key(self):
        # TODO: Replace <storage-account-name> with your actual storage account name
        account_url = "https://<storage-account-name>.blob.core.windows.net"
        shared_access_key = os.getenv("AZURE_STORAGE_ACCESS_KEY")
        credential = shared_access_key

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential)

        return blob_service_client
    # </Snippet_get_service_client_account_key>

    # <Snippet_get_service_client_connection_string>
    def get_blob_service_client_connection_string(self):
        # TODO: Replace <storage-account-name> with your actual storage account name
        account_url = "https://<storage-account-name>.blob.core.windows.net"
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)

        return blob_service_client
    # </Snippet_get_service_client_connection_string>

if __name__ == '__main__':
    sample = AuthSamples()
    blob_service_client = sample.get_blob_service_client_token_credential()
    #blob_service_client = sample.get_blob_service_client_sas(sas_token=<sas_token_str>)
    blob_service_client = sample.get_blob_service_client_account_key()
    blob_service_client = sample.get_blob_service_client_connection_string()