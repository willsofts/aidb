## AI DB Project

This is project using Google Gemini AI to generate query and then execute statement for result to answer

## Installation

With npm installed (comes with [node](https://nodejs.org/en/)), run the following commands into a terminal in the root directory of this project:

```shell
npm install
npm run build
npm run start
```

## How To Install
This project need [@willsofts](https://github.com/willsofts) libraries to run that is private access, then you have to gain access key and setting in your own environment before start installation \
ex. \
Window

    set NPM_TOKEN=your access token key here

Linux

    export NPM_TOKEN=your access token key here


The project will run at http://localhost:8080/

## Setup
Since this project required database setup before starting you have to create database schema by run sql file under folder `/database/aidb_mysql.sql` this sql snippet file come with MySQL.

## Configuration
After setup database you may change configuration setting to access your database by `/config/default.json`. see more detail [will-sql](https://www.npmjs.com/package/will-sql)

In case of setting http connection especially port (default at 8080) can be config by `/config/default.json` or environment setting in command prompt \
ex. \
Window 

    set HTTP_PORT=8888 

Linux 

    export HTTP_PORT=8888 

## Example

This project contains API that it can invoke by [curl](https://curl.se/download.html):

* curl -X POST http://localhost:8080/api/question/quest -d "query=List all product name and price"

