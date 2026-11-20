Description : this is an authientaction file

Flow

user stories

-we hace to see the admin with email and password
    -email:jps@admin.com
    -password:admin@123

-first user open the website. he goes to the register section  and fills the three feild(email,password,role)

-when his registartion is sucessfull then he will be redirect to login page .after login he will be redirect to role based dashboard

APIs(/api)

for registration  -> /auth/register(package:bycript ,jwt)
for login ->   /auth/login(
       we have to generate acess and refresh tokem
       send user data (id name email role  ,that should be send in user front end)
)


for logout-> /logout(from the frontend delete the token and userdata)