using System;

namespace dotnet_v12
{
    class Program
    {
        //-----------------------------------------------
        // Submenu for security scenarios.
        //----------------------------------------------- 
        static bool AccessControlLists()
        {
            AccessControlLists ACL = new AccessControlLists();

            while (ACL.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Main menu
        //-----------------------------------------------
        private static bool MainMenu()
        {
            Console.Clear();
            Console.WriteLine("Choose a feature area:");
            Console.WriteLine("1) Set ACLs");
            Console.WriteLine("2) Exit");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":

                    return AccessControlLists();

                case "2":

                    return false;

                default:

                    return true;
            }
        }


        static void Main(string[] args)
        {
            while (MainMenu()) { }
        }
    }
}
