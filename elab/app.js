process.env.NODE_ENV = "production";
// CloudLinux exports the server hostname, which makes Next's standalone
// server bind to the public IP. LiteSpeed proxies Node applications through
// localhost, so listen on every interface instead.
process.env.HOSTNAME = "0.0.0.0";
require("./.next/standalone/server.js");
