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

                case "x":
                case "X":
                   return false;                
                
                default:
                   return true;
            }
        }
    
    }    
}
