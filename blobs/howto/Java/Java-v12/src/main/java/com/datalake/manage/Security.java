package com.datalake.manage;

import com.azure.core.cryptography.AsyncKeyEncryptionKey;
import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
//import com.azure.identity.DefaultAzureCredential;
//import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.storage.blob.specialized.cryptography.*;
import com.azure.security.keyvault.keys.cryptography.*;
import com.azure.security.keyvault.keys.cryptography.models.KeyWrapAlgorithm;

import java.io.*;

public class Security {
    
    // ---------------------------------------------------------
    // Blob encryption
    // ----------------------------------------------------------
    

    public void EncryptBlob(){
        
        String connectionString = Constants.connectionString;

        //<Snippet_BlobServiceEncryption>
        ClientSecretCredential clientSecretCredential = new ClientSecretCredentialBuilder()
            .clientId("<your-client-ID>")
            .clientSecret("your-client-secret") 
            .tenantId("Your tenant ID")
            .build();

        AsyncKeyEncryptionKey key = new KeyEncryptionKeyClientBuilder()
            .credential(clientSecretCredential)
            .buildAsyncKeyEncryptionKey("https://mykeyvault.vault.azure.net/keys/mykey/xxxxxxxxxxxxxxxxxxxxxxxxx").block();

        EncryptedBlobClient encryptedBlobClient = new EncryptedBlobClientBuilder()
            .connectionString(connectionString)
            .endpoint("https://mystorageaccount.blob.core.windows.net/")
            .containerName("my-container")
            .blobName("new-blob-to-upload")
            .key(key, KeyWrapAlgorithm.RSA1_5.toString())
            .buildEncryptedBlobClient();

        encryptedBlobClient.uploadFromFile("C:\\Users\\contoso\\copy.txt");

        //</Snippet_BlobServiceEncryption>
        
    }
    
    // ----------------------------------------------------------
    // Driver Menu
    // ----------------------------------------------------------

    public void ShowMenu() throws java.lang.Exception{
        
        try {

            // Create a BlobServiceClient object which will be used to create a container client
      //      String connectionString = Constants.connectionString;
   //         BlobServiceClient blobServiceClient = new BlobServiceClientBuilder().connectionString(connectionString).buildClient();


            // Listening for commands from the console
            System.out.print("\033[H\033[2J");  
            System.out.flush();

            System.out.println("Enter a command");

            System.out.println("(1) Encrypt blob | (2) Exit");

            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));

            while (true) {

                System.out.println("# Enter a command : ");
                String input = reader.readLine();

                switch(input){

                    case "1":
                       EncryptBlob();
                    break;
                    case "2":
                    return;
                    default:
                        break;
                }
            }
        } catch (java.lang.Exception e) {
            System.out.println(e.toString());
            System.exit(-1);

        }

    }
    
}
