---
layout: mynote
tags: [notes, memo, op, weblogic, apex, infrastructures ] 
created: 2021-10-21 15:09
modified: 2021-10-21 15:09
type: Document
title: memo  2021-10-21
---
Week Of: [[2021-10-17]]
[[2021-10-21]]


# Authenticating Against WebLogic Server User Repositories
נלקח מתוך: [Developing Oracle REST Data Services Applications](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/19.1/aelig/developing-REST-applications.html#GUID-3D8D1AD4-6D50-4FAA-BCE3-11D4BF559CE3)

Oracle REST Data Services can use APIs provided by WebLogic Server to verify credentials (username and password) and to retrieve the set of groups and roles that the user is a member of.

This section walks through creating a user in the built-in user repositories provided by WebLogic Server, and verifying the ability to authenticate against that user.

This document does not describe how to integrate WebLogic Server with the many popular user repository systems such as LDAP repositories, but Oracle REST Data Services can authenticate against such repositories after WebLogic Server has been correctly configured. See your application server documentation for more information on what user repositories are supported by the application server and how to configure access to these repositories.

Topics:

-   [Authenticating Against WebLogic Server](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/19.1/aelig/developing-REST-applications.html#GUID-C3E7BD65-7503-476B-B786-15155C91EBB5)
    

#### 3.5.1 Authenticating Against WebLogic Server

Authenticating a user against WebLogic Server involves the following major steps:

1.  [Creating a WebLogic Server User](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/19.1/aelig/developing-REST-applications.html#GUID-A2B0C9C6-E781-4DFF-99B0-9692E9970DFC)
    
2.  [Verifying the WebLogic Server User](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/19.1/aelig/developing-REST-applications.html#GUID-3D8D1AD4-6D50-4FAA-BCE3-11D4BF559CE3)
    

##### 3.5.1.1 Creating a WebLogic Server User

To create a sample WebLogic Server user, follow these steps:

1.  Start WebLogic Server if it is not already running
    
2.  Access the WebLogic Server Administration Console (typically `http://server:7001/console`), enter your credentials.
    
3.  In the navigation tree on the left, click the Security Realms node
    
4.  If a security realm already exists, go to the next step. If a security realm does not exist, create one as follows:
    
    1.  Click New.
        
    2.  For Name, enter `Test-Realm`, then click OK.
        
    3.  Click Test-Realm.
        
    4.  Click the Providers tab.
        
    5.  Click New, and enter the following information:
        
        Name: `test-authenticator`
        
        Type: `DefaultAuthenticator`
        
    6.  Restart WebLogic Server if you are warned that a restart is necessary.
        
    7.  Click Test-Realm.
        
5.  Click the Users and Groups tab.
    
6.  Click New, and enter the following information:
    
    -   Name: `3rdparty_dev2`
        
    -   Password: Enter and confirm the desired password for this user.
        
7.  Click OK.
    
8.  Click the Groups tab.
    
9.  Click New., and enter the following information:
    
    -   Name: OAuth2 Client Developer (case sensitive)
        
10.  Click OK.
    
11.  Click the Users tab.
    
12.  Click the 3rdparty_dev2 user.
    
13.  Click the Groups tab.
    
14.  In the Chosen list, add `OAuth2 Client Developer` .
    
15.  Click Save.
    

You have created a user named `3rdparty_dev2` and made it a member of a group named `OAuth2 Client Developer`. This means the user will acquire the `OAuth2 Client Developer` role, and therefore will be authorized to register OAuth 2.0 applications.

Now verify that the user can be successfully authenticated.

##### 3.5.1.2 Verifying the WebLogic Server User

To verify that the WebLogic Server user created can be successfully authenticated, follow these steps:

1.  In your browser, go to a URI in the following format:
    
    `https://server:port/ords/resteasy/ui/oauth2/clients/`
    
2.  Enter the credentials of the `3rdparty_dev2` user, and click Sign In.

The OAuth 2.0 Client Registration page should be displayed, with no applications listed. If this page is displayed, you have verified that authentication against the WebLogic Server user repository is working.

However, if the sign-on prompt is displayed again with the message `User is not authorized to access resource`, then you made mistake (probably misspelling the Group List value). 
 
#memo #op/memo
