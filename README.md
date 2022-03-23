# Team finder 

Like the name suggests, this is an app that someone can use to find colleagues needed for a team for an upcoming project in the work environment. Think of it as Tinder (or Grindr) but for the workplace. This also opened an opportunity to learn lots, such as DOM usage, and creating a non-hardcoded website for the first time.

## Features

### Users:

> A normal user can look up employees in the database on the website, and filter down results to their wants and needs. All people who meet the provided conditions (if any) are presented inside a table with name, contact, skills etc. People who are a match to the users requirements can then be shortlisted, and people who aren't what the user needs can be removed from the search. The shortlist is another version of the same results, with only the people the user selected this time around. Users inside the shortlist can be added and removed anytime, and the shortlist can be compiled up from many searches.

![User search GIF](https://github.com/qtdceu/team_finder/blob/main/img/ezgif.com-gif-maker.gif)

### Lower-tier Admins:

> Administrators can use the same features as a normal user, but also have access to moderate members of the organisation. Behind the password locked panel, admins have the ability to create users, as well as update certain ones by name. All actions attempted to be taken by admins is logged to a database for peace of mind. 

![Low-admin create/update GIF](https://github.com/qtdceu/team_finder/blob/main/img/ezgif.com-gif-maker%20(1).gif)

### Higher-tier Admins:

> Higher-tier Administrators have the ability to use the 'Create Admin Account' panel. Using the same login page as lower-tier admins, and using the 'masterUsername' and 'masterPassword', they can generate an account by inputting a username, and the email of the person to recieve the account. This is designed to email the username and password to the person recieving the account, while keeping the password hidden from everyone else, even the Admin creating the account. 

![High-admin create GIF](https://github.com/qtdceu/team_finder/blob/main/img/ezgif.com-gif-maker%20(2).gif)

> What the user recieving the account sees: 

![Credentials email](https://github.com/qtdceu/team_finder/blob/main/img/Screenshot%202022-03-11%20225752.png)

## How to use

Firstly, clone this repository.

Run `npm install` inside your console.

Inside your MySQL, create a database.

Inside that database, run this statement: 

```sql 
CREATE TABLE `users` (
  `name` varchar(255) NOT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `qualifications` varchar(255) DEFAULT NULL,
  `year_joined` year NOT NULL,
  `location` varchar(255) NOT NULL,
  `ou` varchar(255) NOT NULL,
  `contact_info` varchar(255) NOT NULL,
  `grade` varchar(255) NOT NULL,
  `skills` varchar(255) NOT NULL,
  `current_project` varchar(255) NOT NULL,
  `availability` varchar(255) NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `contact_info` (`contact_info`)
);

CREATE TABLE `credentials` (
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  PRIMARY KEY (`username`)
);

CREATE TABLE `logs` (
  `username` varchar(255) NOT NULL,
  `action` varchar(500) NOT NULL
);
```

In `databaseConfig.js`, edit the `connection` variable's options to fit your setup. 

In `config.json`, edit the `username`, `password` to fit with your GMail account's credentials. If you wish, in the same file, edit the `masterUsername` and `masterPassword`. If you are not using GMail, see the [nodemailer documentation](https://nodemailer.com/about/) and edit the `transporter` variable's configuration in `mailConfig.js` to work with your provider.

Run `node .` to start the programme. 

Access the programme at `http://localhost:8080`.

To access the admin panel, you have to use the `masterUsername` and `masterPassword` on the same login gate as moderating regular users, and create accounts. Then, use the credentials generated by the system to access the admin panel.  

## Technologies

> Node.js >= 16.11.1

> Express

> (NPM Package) MySQL2 

> Crypto

> Generate-password

> Nodemailer

> MySQL >= 8.0

## To do

- [x] Multiple admin logins for logging 

- [x] Log admin actions 

- [x] Remove button for results

- [x] Hash and Salt admin logins

- [x] Make website more eye pleasing

- [x] Similar results, not exact

- [x] Present results as a profile 'card', break out of table

- [ ] Add photos to results

## License 

License can be found [here](https://github.com/qtdceu/team_finder/blob/main/LICENSE).
