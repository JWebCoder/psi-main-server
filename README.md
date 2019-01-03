# ras-psi (Raspberry - PSI Functions)

This is a personal project to create a distributed computing structure using raspberry pies connected through TCP

## Why?

Has a developer, i really like to try out new paradigms and architectures
Basically i'm trying to see if this is possible and also usefull

## How?

The idea is to create a fully scalable system using micro components and make it simple to use

## Main structure

Raspberry PI 1 - Express JS application to handle the http requests and TCP server for the other PI's

Raspberry PI 2,3,... - TPC clients able to load javascript files dynamically passing them the body and query objects from the Express JS application

## TODO

- Minimal express server
- Data passage between TCP clients and application User (Express - TCP - PSI function - TCP - Express - Application User)
- The system should also be capable to handle the location of the PSI functions without user intervention, if a new PSI function is added to any Raspberry it should be automaticaly avaible on the administration panel for the Express application
- Express server should have an administrator backoffice where the user could define the routing and the target function