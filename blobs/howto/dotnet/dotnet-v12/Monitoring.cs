//----------------------------------------------------------------------------------
// Microsoft Developer & Platform Evangelism
//
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, 
// EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES 
// OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
//----------------------------------------------------------------------------------
// The example companies, organizations, products, domain names,
// e-mail addresses, logos, people, places, and events depicted
// herein are fictitious.  No association with any real company,
// organization, product, domain name, email address, logo, person,
// places, or events is intended or should be inferred.
//----------------------------------------------------------------------------------

using Azure.Core.Pipeline;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Queues;
using System;
using System.IO;
using System.Net;

namespace dotnet_v12
{
    public class Monitoring
    {

        //-------------------------------------------------
        // Enable diagnostic logs
        //-------------------------------------------------

        public void EnableDiagnosticLogs()
        {
            var connectionString = Constants.connectionString;

            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            BlobServiceProperties serviceProperties = blobServiceClient.GetProperties().Value;

            serviceProperties.Logging.Delete = true;

            BlobRetentionPolicy retentionPolicy = new BlobRetentionPolicy();
            retentionPolicy.Enabled = true;
            retentionPolicy.Days = 2;
            serviceProperties.Logging.RetentionPolicy = retentionPolicy;

            blobServiceClient.SetProperties(serviceProperties);

            Console.WriteLine("Diagnostic logs are now enabled");
        }

        //---------------------------------------------------
        // Use Custom Request ID
        //---------------------------------------------------

        public void UseCustomRequestID()
        {
            string HOSTNAME = "";
            string APPNAME = "";
            string USERID = "";

            // <Snippet_UseCustomRequestID>

            var connectionString = Constants.connectionString;

            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            BlobContainerClient blobContainerClient = blobServiceClient.GetBlobContainerClient("demcontainer");

            BlobClient blobClient = blobContainerClient.GetBlobClient("testImage.jpg");

            string clientRequestID = String.Format("{0} {1} {2} {3}", HOSTNAME, APPNAME, USERID, Guid.NewGuid().ToString());

            using (HttpPipeline.CreateClientRequestIdScope(clientRequestID))
            {
                BlobDownloadInfo download = blobClient.Download();

                using (FileStream downloadFileStream = File.OpenWrite("C:\\testImage.jpg"))
                {
                    download.Content.CopyTo(downloadFileStream);
                    downloadFileStream.Close();
                }
            }

            // </Snippet_UseCustomRequestID>
        }

        //---------------------------------------------------
        // Disable Nagle algorithm
        //---------------------------------------------------

        public void DisableNagleAlgorithm()
        {
            // <Snippet_DisableNagle>

            var connectionString = Constants.connectionString;

            QueueServiceClient queueServiceClient = new QueueServiceClient(connectionString);

            ServicePoint queueServicePoint = ServicePointManager.FindServicePoint(queueServiceClient.Uri);
            queueServicePoint.UseNagleAlgorithm = false;

            // </Snippet_DisableNagle>

            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            ServicePoint blobServicePoint = ServicePointManager.FindServicePoint(blobServiceClient.Uri);
            blobServicePoint.UseNagleAlgorithm = false;

        }

        //---------------------------------------------------
        // Configure CORS
        //---------------------------------------------------

        public void ConfigureCORS()
        {
            // <Snippet_ConfigureCORS>

            var connectionString = Constants.connectionString;

            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            BlobServiceProperties sp = blobServiceClient.GetProperties();

            // Set the service properties.
            sp.DefaultServiceVersion = "2013-08-15";
            BlobCorsRule bcr = new BlobCorsRule();
            bcr.AllowedHeaders = "*";
           
            bcr.AllowedMethods = "GET,POST";
            bcr.AllowedOrigins = "http://www.contoso.com";
            bcr.ExposedHeaders = "x-ms-*";
            bcr.MaxAgeInSeconds = 5;
            sp.Cors.Clear();
            sp.Cors.Add(bcr);
            blobServiceClient.SetProperties(sp);

            // </Snippet_ConfigureCORS>
        }

        //-------------------------------------------------
        // Monitoring menu
        //-------------------------------------------------

        public bool Menu()
        {
            Console.Clear();
            Console.WriteLine("Choose a monitoring scenario:");
            Console.WriteLine("1) Enable diagnostic logs");
            Console.WriteLine("2) Use a client request ID");
            Console.WriteLine("3) Disable Nagle algorithm");
            Console.WriteLine("4) Configure CORS");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");
 
            switch (Console.ReadLine())
            {
                case "1":
                   
                   EnableDiagnosticLogs();
                   Console.WriteLine("Press enter to continue");   
                   Console.ReadLine();          
                   return true;
                
                case "2":

                   // call method here.
                   UseCustomRequestID();
                   Console.WriteLine("Press enter to continue"); 
                   Console.ReadLine();              
                   return true;
                
               case "3":

                    // call method here.
                    UseCustomRequestID();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

               case "4":

                    // call method here.
                    UseCustomRequestID();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "x":
                case "X":
                
                   return false;
                
                default:
                
                   return true;
            }
        }
        
    }

    


    
}
