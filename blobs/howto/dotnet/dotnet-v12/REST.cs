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

using System;
using System.Collections.Specialized;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Xml.Linq;

namespace dotnet_v12
{
    public class REST
    {

        #region Helper methods
        /// <summary>
        /// This creates the authorization header. This is required, and must be built 
        ///   exactly following the instructions. This will return the authorization header
        ///   for most storage service calls.
        /// Create a string of the message signature and then encrypt it.
        /// </summary>
        /// <param name="storageAccountName">The name of the storage account to use.</param>
        /// <param name="storageAccountKey">The access key for the storage account to be used.</param>
        /// <param name="now">Date/Time stamp for now.</param>
        /// <param name="httpRequestMessage">The HttpWebRequest that needs an auth header.</param>
        /// <param name="ifMatch">Provide an eTag, and it will only make changes
        /// to a blob if the current eTag matches, to ensure you don't overwrite someone else's changes.</param>
        /// <param name="md5">Provide the md5 and it will check and make sure it matches the blob's md5.
        /// If it doesn't match, it won't return a value.</param>
        /// <returns></returns>
        /// 

        internal static AuthenticationHeaderValue GetAuthorizationHeader(
           string storageAccountName, string storageAccountKey, DateTime now,
           HttpRequestMessage httpRequestMessage, string ifMatch = "", string md5 = "")
        {
            // This is the raw representation of the message signature.
            HttpMethod method = httpRequestMessage.Method;
            String MessageSignature = String.Format("{0}\n\n\n{1}\n{5}\n\n\n\n{2}\n\n\n\n{3}{4}",
                      method.ToString(),
                      (method == HttpMethod.Get || method == HttpMethod.Head) ? String.Empty
                        : httpRequestMessage.Content.Headers.ContentLength.ToString(),
                      ifMatch,
                      GetCanonicalizedHeaders(httpRequestMessage),
                      GetCanonicalizedResource(httpRequestMessage.RequestUri, storageAccountName),
                      md5);

            // Now turn it into a byte array.
            byte[] SignatureBytes = Encoding.UTF8.GetBytes(MessageSignature);

            // Create the HMACSHA256 version of the storage key.
            HMACSHA256 SHA256 = new HMACSHA256(Convert.FromBase64String(storageAccountKey));

            // Compute the hash of the SignatureBytes and convert it to a base64 string.
            string signature = Convert.ToBase64String(SHA256.ComputeHash(SignatureBytes));

            // This is the actual header that will be added to the list of request headers.
            // You can stop the code here and look at the value of 'authHV' before it is returned.
            AuthenticationHeaderValue authHV = new AuthenticationHeaderValue("SharedKey",
                storageAccountName + ":" + Convert.ToBase64String(SHA256.ComputeHash(SignatureBytes)));
            return authHV;
        }

        /// <summary>
        /// Put the headers that start with x-ms in a list and sort them.
        /// Then format them into a string of [key:value\n] values concatenated into one string.
        /// (Canonicalized Headers = headers where the format is standardized).
        /// </summary>
        /// <param name="httpRequestMessage">The request that will be made to the storage service.</param>
        /// <returns>Error message; blank if okay.</returns>
        private static string GetCanonicalizedHeaders(HttpRequestMessage httpRequestMessage)
        {
            var headers = from kvp in httpRequestMessage.Headers
                          where kvp.Key.StartsWith("x-ms-", StringComparison.OrdinalIgnoreCase)
                          orderby kvp.Key
                          select new { Key = kvp.Key.ToLowerInvariant(), kvp.Value };

            StringBuilder sb = new StringBuilder();

            // Create the string in the right format; this is what makes the headers "canonicalized" --
            //   it means put in a standard format. http://en.wikipedia.org/wiki/Canonicalization
            foreach (var kvp in headers)
            {
                StringBuilder headerBuilder = new StringBuilder(kvp.Key);
                char separator = ':';

                // Get the value for each header, strip out \r\n if found, then append it with the key.
                foreach (string headerValues in kvp.Value)
                {
                    string trimmedValue = headerValues.TrimStart().Replace("\r\n", String.Empty);
                    headerBuilder.Append(separator).Append(trimmedValue);

                    // Set this to a comma; this will only be used 
                    //   if there are multiple values for one of the headers.
                    separator = ',';
                }
                sb.Append(headerBuilder.ToString()).Append("\n");
            }
            return sb.ToString();
        }

        /// <summary>
        /// This part of the signature string represents the storage account 
        ///   targeted by the request. Will also include any additional query parameters/values.
        /// For ListContainers, this will return something like this:
        ///   /storageaccountname/\ncomp:list
        /// </summary>
        /// <param name="address">The URI of the storage service.</param>
        /// <param name="accountName">The storage account name.</param>
        /// <returns>String representing the canonicalized resource.</returns>
        private static string GetCanonicalizedResource(Uri address, string storageAccountName)
        {
            // The absolute path is "/" because for we're getting a list of containers.
            StringBuilder sb = new StringBuilder("/").Append(storageAccountName).Append(address.AbsolutePath);

            // Address.Query is the resource, such as "?comp=list".
            // This ends up with a NameValueCollection with 1 entry having key=comp, value=list.
            // It will have more entries if you have more query parameters.
            NameValueCollection values = HttpUtility.ParseQueryString(address.Query);

            foreach (var item in values.AllKeys.OrderBy(k => k))
            {
                sb.Append('\n').Append(item).Append(':').Append(values[item]);
            }

            return sb.ToString().ToLower();

        }
        #endregion

        //-------------------------------------------------
        // ListContainers
        //-------------------------------------------------
        private static async Task ListContainersAsyncREST(string storageAccountName, 
            string storageAccountKey, CancellationToken cancellationToken)
        {

            // Construct the URI. This will look like this:
            //   https://myaccount.blob.core.windows.net/resource

            String uri = string.Format("http://{0}.blob.core.windows.net?comp=list", storageAccountName);

            // Set this to whatever payload you desire. Ours is null because 
            //   we're not passing anything in.
            Byte[] requestPayload = null;

            //Instantiate the request message with a null payload.
            using (var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, uri)
            { Content = (requestPayload == null) ? null : new ByteArrayContent(requestPayload) })
            {

                // Add the request headers for x-ms-date and x-ms-version.
                DateTime now = DateTime.UtcNow;
                httpRequestMessage.Headers.Add("x-ms-date", now.ToString("R", CultureInfo.InvariantCulture));
                httpRequestMessage.Headers.Add("x-ms-version", "2017-04-17");
                // If you need any additional headers, add them here before creating
                //   the authorization header. 

                // Add the authorization header.
                httpRequestMessage.Headers.Authorization = GetAuthorizationHeader(
                   storageAccountName, storageAccountKey, now, httpRequestMessage);

                // Send the request.
                using (HttpResponseMessage httpResponseMessage = await new HttpClient().SendAsync(httpRequestMessage, cancellationToken))
                {
                    // If successful (status code = 200), 
                    //   parse the XML response for the container names.
                    if (httpResponseMessage.StatusCode == HttpStatusCode.OK)
                    {
                        String xmlString = await httpResponseMessage.Content.ReadAsStringAsync();
                        XElement x = XElement.Parse(xmlString);
                        foreach (XElement container in x.Element("Containers").Elements("Container"))
                        {
                            Console.WriteLine("Container name = {0}", container.Element("Name").Value);
                        }
                    }
                }
            }
        }


        //-------------------------------------------------
        // REST menu (Can call asynchronous and synchronous methods)
        //-------------------------------------------------

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a REST scenario:");
            Console.WriteLine("1) List containers");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":

                    ListContainersAsyncREST(Constants.storageAccountName, 
                        Constants.accountKey, CancellationToken.None).GetAwaiter().GetResult();

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "2":

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



