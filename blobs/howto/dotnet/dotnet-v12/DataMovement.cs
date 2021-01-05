using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System;
using System.Threading.Tasks;

namespace dotnet_v12
{
    class DataMovement
    {
        #region User menu

        //-------------------------------------------------
        // Data Movement Library menu
        //-------------------------------------------------
        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a container scenario:");
            Console.WriteLine("1) Scenario 1");
            Console.WriteLine("2) Scenario 2");
            Console.WriteLine("3) Scenario 3");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "2":

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "3":

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
        #endregion
    }
}
