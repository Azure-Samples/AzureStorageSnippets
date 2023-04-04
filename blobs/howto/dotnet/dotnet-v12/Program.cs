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

namespace dotnet_v12
{
    class Program
    {

        //-----------------------------------------------
        // Submenu for security scenarios.
        //----------------------------------------------- 
        static bool Security()
        {
            Security security = new Security();

            while (security.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for diagnostic log scenarios.
        //----------------------------------------------- 
        static bool Monitoring()
        {
            Monitoring monitoring = new Monitoring();

            while (monitoring.Menu()){}

            return true;
        }

        //-----------------------------------------------
        // Submenu for data protection scenarios.
        //----------------------------------------------- 
        static bool DataProtection()
        {
            DataProtection dataProtection = new DataProtection();

            while (dataProtection.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for REST scenarios.
        //----------------------------------------------- 
        static bool REST()
        {
            REST rest = new REST();

            while (rest.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for CRUD scenarios.
        //----------------------------------------------- 
        static bool CRUD()
        {
            CRUD crud = new CRUD();

            while (crud.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for Metadata scenarios.
        //----------------------------------------------- 
        static bool Metadata()
        {
            Metadata metadata = new Metadata();

            while (metadata.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for Container scenarios.
        //----------------------------------------------- 
        static bool Containers()
        {
            Containers containers = new Containers();

            while (containers.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for Copy scenarios.
        //----------------------------------------------- 
        static bool CopyBlob()
        {
            CopyBlob copyBlob = new CopyBlob();

            while (copyBlob.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for Account scenarios.
        //----------------------------------------------- 
        static bool Account()
        {
            Account acct = new Account();

            while (acct.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for CRUD with Data Lake scenarios.
        //----------------------------------------------- 
        static bool CRUD_DataLake()
        {
            CRUD_DataLake crud_DataLake = new CRUD_DataLake();

            while (crud_DataLake.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for ACLs with Data Lake scenarios.
        //----------------------------------------------- 
        static bool ACL_DataLake()
        {
            ACL_DataLake acl_DataLake = new ACL_DataLake();

            while (acl_DataLake.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for Scalable scenarios.
        //----------------------------------------------- 
        static bool Scalable()
        {
            Scalable acct = new Scalable();

            while (acct.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for AccessTiers scenarios.
        //----------------------------------------------- 
        static bool AccessTiers()
        {
            AccessTiers acct = new AccessTiers();

            while (acct.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for Retry scenarios.
        //----------------------------------------------- 
        static bool Retry()
        {
            Retry retry = new Retry();

            while (retry.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for Concurrency scenarios.
        //----------------------------------------------- 
        static bool Concurrency()
        {
            Concurrency concurrency = new Concurrency();

            while (concurrency.MenuAsync().Result) { }

            return true;
        }

        //------------------------------------------------
        // Main function
        //------------------------------------------------
        static void Main(string[] args)
        {
            while (MainMenu()){}
        }

        //-----------------------------------------------
        // Main menu
        //-----------------------------------------------
        private static bool MainMenu()
        {
            Console.Clear();
            Console.WriteLine("Choose a feature area:");
            Console.WriteLine("1) Security");
            Console.WriteLine("2) Monitoring");
            Console.WriteLine("3) Data protection");
            Console.WriteLine("4) REST operations");
            Console.WriteLine("5) CRUD operations");
            Console.WriteLine("6) Properties and Metadata");
            Console.WriteLine("7) Container operations");
            Console.WriteLine("8) Copy operations");
            Console.WriteLine("9) Account info");
            Console.WriteLine("10) CRUD operations for accounts with a hierarchical namespace");
            Console.WriteLine("11) Access Control Lists (ACL) for accounts with a hierarchical namespace");
            Console.WriteLine("12) Parallel file transfers");
            Console.WriteLine("13) Manage access tiers");
            Console.WriteLine("14) Configure retry policy");
            Console.WriteLine("15) Test concurrency scenarios");
            Console.WriteLine("X) Exit");
            Console.Write("\r\nSelect an option: ");
 
            switch (Console.ReadLine())
            {
                case "1":
                    return Security();

                case "2":
                    return Monitoring();

                case "3":
                    return DataProtection();

                case "4":
                    return REST();

                case "5":
                    return CRUD();

                case "6":
                    return Metadata();

                case "7":
                    return Containers();

                case "8":
                    return CopyBlob();

                case "9":
                    return Account();

                case "10":
                    return CRUD_DataLake();

                case "11":
                    return ACL_DataLake();

                case "12":
                    return Scalable();

                case "13":
                    return AccessTiers();

                case "14":
                    return Retry();

                case "15":
                    return Concurrency();

                case "x":
                case "X":
                   return false;                
                
                default:
                   return true;
            }
        }
    
    }    
}
