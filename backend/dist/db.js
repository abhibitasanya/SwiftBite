import mysql from "mysql2/promise";
const host = process.env.MYSQL_HOST ?? "localhost";
const port = Number(process.env.MYSQL_PORT ?? 3306);
const user = process.env.MYSQL_USER ?? "root";
const password = process.env.MYSQL_PASSWORD ?? "";
const database = process.env.MYSQL_DATABASE ?? "swiftdb";
export const db = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
});
