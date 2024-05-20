namespace backend.Helpers
{
    public static class EmailBody
    {
        public static string EmailStringBody()
        {
            return $@"<html>
    <head></head>
    <body style= ""margin:0;padding:0;font-family: Arial, Helvetica, sans-serif;"">
        <div style=""height:auto; background: #009bab; width:400px;padding:30px"">
            <div>
                <div>
                    <h1 style=""color:white"">Reset your password</h1>
                    <hr>
                    <p style=""color:white"">You're receiving this email because you requested a password reset for your KT-eHospital account.</p>
                    <p style=""color:white"">Please tap the button below to choose a new password</p>
                    <a href=""http://localhost:4200/resetpassword"" , target=""_blank"" 
                        style=""background:white; padding:10px; border:none; color:#009bab; border-radius:4px; display:block;
                           margin:0 auto; width:50%; text-align:center; text-decoration:none"">Reset Password</a><br>
                    <p style=""color:white; text-align: right"">Best Regards,<br><br>
                    KT-eHospital</p>
                </div>
            </div>
        </div>  
    </body>
</html>";
        }

        public static string EmailBookSuccess(string time)
        {
            return $@"<html>
    <head></head>
    <body style= ""margin:0;padding:0;font-family: Arial, Helvetica, sans-serif;"">
        <div style=""height:auto; width:400px;padding:30px"">
            <div>
                <div>
                    <h1 style=""color:black"">Notification</h1>
                    <hr>
                    <p style=""color:black"">You booked appointment on {time} successfully</p>
                    <p style=""color:black; text-align: right"">Best Regards,<br><br>
                    KT-eHospital</p>
                </div>
            </div>
        </div>  
    </body>
</html>";
        }

        public static string EmailBookCancel(string time)
        {
            return $@"<html>
    <head></head>
    <body style= ""margin:0;padding:0;font-family: Arial, Helvetica, sans-serif;"">
        <div style=""height:auto; width:400px;padding:30px"">
            <div>
                <div>
                    <h1 style=""color:black"">Notification</h1>
                    <hr>
                    <p style=""color:black"">You canceled appointment on {time} successfully</p>
                    <p style=""color:black; text-align: right"">Best Regards,<br><br>
                    KT-eHospital</p>
                </div>
            </div>
        </div>  
    </body>
</html>";
        }

        public static string EmailBookComplete(string time)
        {
            return $@"<html>
    <head></head>
    <body style= ""margin:0;padding:0;font-family: Arial, Helvetica, sans-serif;"">
        <div style=""height:auto; width:400px;padding:30px"">
            <div>
                <div>
                    <h1 style=""color:black"">Notification</h1>
                    <hr>
                    <p style=""color:black"">You completed appointment on {time} successfully</p>
                    <p style=""color:black; text-align: right"">Best Regards,<br><br>
                    KT-eHospital</p>
                </div>
            </div>
        </div>  
    </body>
</html>";
        }

        public static string EmailBookAutoCancel(string time)
        {
            return $@"<html>
    <head></head>
    <body style= ""margin:0;padding:0;font-family: Arial, Helvetica, sans-serif;"">
        <div style=""height:auto; width:400px;padding:30px"">
            <div>
                <div>
                    <h1 style=""color:black"">Notification</h1>
                    <hr>
                    <p style=""color:black"">You were absent on {time}, so your appointment for that day was canceled</p>
                    <p style=""color:black; text-align: right"">Best Regards,<br><br>
                    KT-eHospital</p>
                </div>
            </div>
        </div>  
    </body>
</html>";
        }

        public static string EmailBookAutoSetRoom(string room_name, int number)
        {
            return $@"<html>
    <head></head>
    <body style= ""margin:0;padding:0;font-family: Arial, Helvetica, sans-serif;"">
        <div style=""height:auto; width:400px;padding:30px"">
            <div>
                <div>
                    <h1 style=""color:black"">Notification</h1>
                    <hr>
                    <p style=""color:black"">You have a medical appointment scheduled at our hospital today. Please arrive on time.</p>
                    <p style=""color:black"">Your room is {room_name}, your sequence number is {number}.</p>
                    <p style=""color:black; text-align: right"">Best Regards,<br><br>
                    KT-eHospital</p>
                </div>
            </div>
        </div>  
    </body>
</html>";
        }

        public static string EmailChangeDoctor(string room_name, int number, string name, string email)
        {
            return $@"<html>
    <head></head>
    <body style= ""margin:0;padding:0;font-family: Arial, Helvetica, sans-serif;"">
        <div style=""height:auto; width:400px;padding:30px"">
            <div>
                <div>
                    <h1 style=""color:black"">Notification</h1>
                    <hr>
                    <p style=""color:black"">You changed doctor successfully</p>
                    <p style=""color:black"">Your new room is {room_name}, your new sequence number is {number}, your new doctor is {name}({email}).</p>
                    <p style=""color:black; text-align: right"">Best Regards,<br><br>
                    KT-eHospital</p>
                </div>
            </div>
        </div>  
    </body>
</html>";
        }

        public static string EmailContact(string name, string message, string email)
        {
            return $@"<html>
    <head></head>
    <body style= ""margin:0;padding:0;font-family: Arial, Helvetica, sans-serif;"">
        <div style=""height:auto; width:400px;padding:30px"">
            <div>
                <div>
                    <h1 style=""color:black"">Notification</h1>
                    <hr>
                    <p style=""color:black"">You have a contact from email: {email}</p>
                    <p style=""color:black"">My name is {name}, I am sending this email with the following content</p>
                    <p style=""color:black"">{message}</p>
                    <p style=""color:black; text-align: right"">Best Regards,<br><br>
                    {name}</p>
                </div>
            </div>
        </div>  
    </body>
</html>";
        }
    }
}
