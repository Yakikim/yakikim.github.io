---
layout: mynote
tags: [apex, op, wiki, guide, infrastructures]  
created: 2021-08-03 16:57
modified: 2021-08-03 14:53
type: Document
title: Building a REST API to Deploy APEX Apps
---


[[2021-08-03]]

# Building a REST API to Deploy APEX Apps

[[home]]/[[Open University]]/[[APEX]]

> From: [Building a REST API to Deploy APEX Apps (oracle.com)](https://blogs.oracle.com/apex/building-a-rest-api-to-deploy-apex-apps)

[Carsten Czarski](https://blogs.oracle.com/author/carsten-czarski)  
CONSULTING MEMBER OF TECHNICAL STAFF

![Building a REST API to Deploy Apps](https://cdn.app.compendium.com/uploads/user/e7c690e8-6ff9-102a-ac6d-e4aebca50425/fbd61610-2cfe-4a98-b117-958129af0c39/Image/eb7b3df46580844caa163c3fb09058d4/title.png)

Every APEX developer knows how to **export and import applications** using the Application Builder. And since an APEX export file is actually a SQL script, it's also pretty obvious, that one can use **SQL*Plus** or [**SQLcl**](https://www.oracle.com/database/technologies/appdev/sqlcl.html) to deploy the application on the target system. So far, so good.

The _export part_ of the process can also be automated: APEX provides the [**APEXExport**](https://docs.oracle.com/en/database/oracle/application-express/20.2/aeadm/exporting-from-a-command-line.html#GUID-7C70BD79-3AA0-4B70-A386-D611D3CB12AC) command line utility for years now. This Java-based tool allows to build _shell scripts_ to export APEX applications or workspaces. Such export scripts, combined with SQL*Plus invocations to import on the target system, people can build automated deployment processes. 

However ...

-   Running the **APEXExport** utility requires either _Linux/Unix access_ or _JDBC connection details_ to the APEX database. That way of accessing the APEX instance is often complicated or not even supported (for instance, because of Firewalls or Cloud environments).
-   The same applies to the import part, which requires SQL*Plus access to the target database. An alternative is to use the **SQLcl** utility and [**REST Enabled SQL**](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/20.4/aelig/rest-enabled-sql-service.html#GUID-BA9F9457-ED3A-48A4-828A-CC8CBEA9A2AB) on the server (which uses HTTPS instead of a JDBC connection), but that feature must be enabled on the target system as well, which is often not the case.

A typical modern way of automating things is to use REST APIs - and we can do the same for APEX application exports and deployments. So we need a REST API, that ...

-   ... _exports_ an application by invoking a URL with HTTP **GET**.
-   ... _imports_ an application by sending the export file via **POST** to a URL.
-   ... _deletes_ an application by sending a **DELETE** request to a URL.
-   ... is protected by modern Authentication flows like **OAuth2 Client Credentials**.

This blog posting works with **APEX 19.2** or higher, and will walk you through building, configuring and securing a simple "**Application Export and Import**" REST API. The REST API will enable exporting and importing applications from and to workspaces assigned to the database schema the API is installed in. However, if the database schema has the **APEX_ADMINISTRATOR_ROLE** assigned, the REST API will allow working with applications in _all_ workspaces within the APEX instance.

Once the REST endpoints are installed and running, it should be easy and straightforward to extend for custom needs.

# 1. Building the PL/SQL Package

Recent APEX and ORDS releases contain all the building blocks we need.

-   The **[APEX_EXPORT](https://docs.oracle.com/en/database/oracle/application-express/20.2/aeapi/APEX_EXPORT.html#GUID-6A4628A6-9F86-4394-9938-87A7FFFC7BC8)** PL/SQL package allows to programmatically export an application
-   The [**APEX_APPLICATION_INSTALL**](https://docs.oracle.com/en/database/oracle/application-express/20.2/aeapi/APEX_APPLICATION_INSTALL.html#GUID-64D43160-E4F9-44CF-96A4-42D3190102BE) package contains the [INSTALL](https://docs.oracle.com/en/database/oracle/application-express/20.2/aeapi/INSTALL-Procedure.html#GUID-D44BDEE9-C249-4984-987E-55F1DABD6B03) procedure to programmatically import an APEX export file.
-   ORDS provides the functionality to set up REST endpoints and to protect these with the _OAuth2_ _Client Credentials_ authentication flow.

The procedure interfaces of the **APEX_EXPORT** and **APEX_APPLICATION_INSTALL** packages are not very suitable to be directly invoked from a REST handler. So we need to implement a "wrapper package", with a more simple API.

Such a simplified API could look as in the following **APEX_APPS_REST** package - to install the code into your workspace schema, simply copy and paste and run it using either SQL*Plus, SQLcl, SQL Developer or with APEX SQL Workshop, SQL Scripts.
```plsql
--=============================================================================
-- Wrapper package for ORDS Export / Import API
--
-- Contains procedures to be called by ORDS handlers for exporting or
-- importing an application. This package encapsulates all logic to map
-- the invocation of the ORDS handler to APEX_EXPORT or APEX_APPLICATION_INSTALL
-- package invocations.
--=============================================================================
create or replace package apex_apps_rest 
is
--
-- This is the name of the ORDS REST Module
--
c_ords_module_name constant varchar2(16) := 'apex.apps.expimp';

--=============================================================================
-- exports an application or application components, as SQL or ZIP file.
--
-- Parameters:
-- * p_application_file   Application ID to be exported; append ".zip" or ".sql"
--                        to determine the file type.
-- * p_components         Only export the specified components; use syntax
--                        of APEX_EXPORT.GET_APPLICATION procedure; components
--                        separated by comma.
-- * p_mimetype           mimetype of the expected target file. Supports .sql or .zip
--                        and .json in the future. Overrides the suffix specified
--                        in p_application_file.
--=============================================================================
procedure export( 
    p_application_file in varchar2,
    p_components       in varchar2,
    p_mimetype         in varchar2 );

--=============================================================================
-- imports an application or application components, as SQL or ZIP file.
--
-- Parameters:
-- * p_export_file        Export file
-- * p_mimetype           Mime Type of the export file, to determine whether 
--                        this is ZIP or SQL
-- * p_application_id     Import file as this application ID
-- * p_to_workspace       if provided, import into this workspace
--=============================================================================
procedure import( 
    p_export_file    in blob, 
    p_mimetype       in varchar2,
    p_to_workspace   in varchar2 default null,
    p_application_id in number   default null );

--=============================================================================
-- deletes an application.
--
-- Parameters:
-- * p_in_workspace       if provided, delete application in this workspace
-- * p_application_id     Application ID to be deleted; extension will be ignored.
--=============================================================================
procedure delete( 
    p_in_workspace   in varchar2 default null,
    p_application_id in number );

end apex_apps_rest;
/
```
The **EXPORT**, **IMPORT** and **DELETE** procedures of this package are simple enough to be exposed as a REST API. 

-   **EXPORT:**  
    Based on the **P_MIMETYPE** parameter, the export is provided as SQL or as a ZIP file. If **P_COMPONENTS** is not passed, the procedure exports the whole application, otherwise it returns application components.
-   **IMPORT:**  
    Imports the BLOB which is passed in. The **P_MIMETYPE** argument indicates whether a ZIP or a SQL file was passed in. Since the database schema where this code runs in might be mapped to multiple APEX workspaces, the procedure allows to optionally pass in the workspace name also (**P_TO_WORKSPACE**).
-   **DELETE:**  
    This one is simple - it just deletes the specified application. As for the **IMPORT** procedure, there is a parameter to pass in the workspace, if required (**P_IN_WORKSPACE**).

The following code contains the implementation of the package.The logic is pretty simple: it does not do much more than preparing parameters and invoking **APEX_EXPORT** or **APEX_APPLICATION_INSTALL**.
```plsql
--=============================================================================
-- Package implementation
-- (scroll down within the code window to walk through)
--=============================================================================
create or replace package body apex_apps_rest 
is

LF constant varchar2(1) := chr( 10 );

--=============================================================================
-- Helper Function: Convert a CLOB to a BLOB
--=============================================================================
function clob_to_blob( 
    p_clob in clob ) 
    return blob 
is
    l_blob      blob;
    l_dstoff    pls_integer := 1;
    l_srcoff    pls_integer := 1;
    l_lngctx    pls_integer := 0;
    l_warn      pls_integer;
begin
    sys.dbms_lob.createtemporary( 
        lob_loc     => l_blob,
        cache       => true,
        dur         => sys.dbms_lob.call );    

    sys.dbms_lob.converttoblob(
        dest_lob     => l_blob,
        src_clob     => p_clob,
        amount       => sys.dbms_lob.lobmaxsize,
        dest_offset  => l_dstoff,
        src_offset   => l_srcoff,
        blob_csid    => nls_charset_id( 'AL32UTF8' ),
        lang_context => l_lngctx,
        warning      => l_warn );

    return l_blob;
end clob_to_blob;

--=============================================================================
-- Helper Function: Convert a BLOB to a CLOB
--=============================================================================
function blob_to_clob( 
    p_blob in blob ) 
    return clob 
is
    l_clob      clob;
    l_dstoff    pls_integer := 1;
    l_srcoff    pls_integer := 1;
    l_lngctx    pls_integer := 0;
    l_warn      pls_integer;
begin
    sys.dbms_lob.createtemporary( 
        lob_loc     => l_clob,
        cache       => true,
        dur         => sys.dbms_lob.call );    

    sys.dbms_lob.converttoclob(
        dest_lob     => l_clob,
        src_blob     => p_blob,
        amount       => sys.dbms_lob.lobmaxsize,
        dest_offset  => l_dstoff,
        src_offset   => l_srcoff,
        blob_csid    => nls_charset_id( 'AL32UTF8' ),
        lang_context => l_lngctx,
        warning      => l_warn );

    return l_clob;
end blob_to_clob;

--=============================================================================
-- split filename to file name and extension
--=============================================================================
procedure split_filename(
    p_full_filename  in varchar2,
    p_filename      out varchar2,
    p_extension     out varchar2 )
is
begin
    if instr( p_full_filename, '.' ) > 0 then
        p_filename  := substr( p_full_filename, 1, instr( p_full_filename, '.' ) - 1 );
        p_extension := lower( substr( p_full_filename, instr( p_full_filename, '.' ) + 1 ) );
    else
        p_filename := p_full_filename;
    end if;
end split_filename;

--=============================================================================
-- sets workspace to specified workspace, or to first workspace assigned to
-- current schema
--=============================================================================
procedure set_workspace( p_workspace in varchar2 ) 
is
begin
    if p_workspace is not null then
        apex_util.set_workspace( p_workspace );
    else 
        for w in (
            select workspace
              from apex_workspaces
             where rownum = 1 )
        loop
            apex_util.set_workspace( w.workspace );
        end loop;
    end if;
end set_workspace;

--=============================================================================
-- Public API, see specification
--=============================================================================
procedure delete( 
    p_in_workspace   in varchar2 default null,
    p_application_id in number )
is
begin
    set_workspace( p_workspace => p_in_workspace );
    apex_application_install.remove_application( p_application_id => p_application_id );
end delete;

--=============================================================================
-- Public API, see specification
--=============================================================================
procedure export( 
    p_application_file in varchar2,
    p_components       in varchar2,
    p_mimetype         in varchar2 )
is
    l_files       apex_t_export_files;
    l_filename    varchar2(255);
    l_extension   varchar2(255);

    l_components  apex_t_varchar2;
    l_blob        blob;

    l_as_zip      boolean;
begin
    split_filename( 
        p_full_filename => p_application_file,
        p_filename      => l_filename,
        p_extension     => l_extension );

    l_as_zip := case when p_mimetype is null 
                    then coalesce( l_extension = 'zip', false )
                    else coalesce( lower( p_mimetype ) = 'application/zip', false )
                end;

    if p_components is not null then
        l_components := apex_string.split( ltrim(rtrim( p_components ) ) , ',' );
    end if;

    l_files := apex_export.get_application( 
                   p_application_id => to_number( l_filename ),
                   p_components     => l_components,
                   p_split          => l_as_zip );

    sys.dbms_lob.createtemporary( 
        lob_loc     => l_blob,
        cache       => true,
        dur         => sys.dbms_lob.call );
        
    if l_as_zip then
        for i in 1 .. l_files.count loop
            apex_zip.add_file (
                p_zipped_blob => l_blob,
                p_file_name   => l_files(i).name,
                p_content     => clob_to_blob( l_files(i).contents ) );
        end loop;
        apex_zip.finish( l_blob );
        sys.owa_util.mime_header( 'application/zip', false );
    else 
        l_blob := clob_to_blob( l_files(1).contents );
        sys.owa_util.mime_header( 'application/sql', false );
    end if;

    sys.htp.p( 'Content-Length: ' || sys.dbms_lob.getlength( l_blob ) );
    sys.htp.p( 'Content-Disposition: attachment; filename=' || l_filename || '.' || case when l_as_zip then 'zip' else 'sql' end );
    sys.owa_util.http_header_close;
    sys.wpg_docload.download_file( l_blob );

end export;

--=============================================================================
-- Public API, see specification
--=============================================================================
procedure import( 
    p_export_file    in blob, 
    p_mimetype       in varchar2,
    p_to_workspace   in varchar2 default null,
    p_application_id in number   default null )
is
    l_files         apex_t_export_files := apex_t_export_files();
    l_zip_files     apex_zip.t_files;
    --
    l_dstoff        pls_integer := 1;
    l_srcoff        pls_integer := 1;
    l_lngctx        pls_integer := 0;
    l_warn          pls_integer;
begin

    set_workspace( p_workspace => p_to_workspace );

    if lower( p_mimetype ) = 'application/zip' then
        l_zip_files := apex_zip.get_files( 
                           p_zipped_blob => p_export_file,
                           p_only_files  => true );

        l_files.extend( l_zip_files.count );
        for i in 1 .. l_zip_files.count loop
            l_files( i ) := apex_t_export_file( 
                                l_zip_files( i ),
                                blob_to_clob( 
                                    apex_zip.get_file_content( 
                                        p_zipped_blob => p_export_file,
                                        p_file_name   => l_zip_files( i ) ) ) );
        end loop;
    else 
        l_files.extend(1);
        l_files( 1 ) := apex_t_export_file( 'import-data', blob_to_clob( p_export_file ) );
    end if;

    apex_application_install.set_application_id( 
        p_application_id => p_application_id );

    apex_application_install.install( 
        p_source             => l_files,
        p_overwrite_existing => true );

end import;

end apex_apps_rest;
/
```

# 2. Creating the ORDS REST Module

With **SQLcl** or **SQL*Plus**, we could start using this package right now. However, that is not the goal of the exercise - instead we'll now use the [ORDS](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/20.4/aelig/ORDS-reference.html#GUID-E4476C14-01B1-4EA4-94D3-73B92C8C9AB3) package in order to build a _REST Module_ with _REST Handlers_ to import, export and delete applications. These ORDS handlers will just call into the new **APEX_APPS_REST** package.

```plsql
--=============================================================================
-- Set up the ORDS REST Module and its handlers
-- (scroll down within the code window to walk through)
--=============================================================================
begin
    ords.enable_schema;
end;
/
sho err

--
-- delete the module if it already exists, to make this script re-runnable.
--
begin
    ords.delete_module(
        p_module_name => apex_apps_rest.c_ords_module_name );
exception
    -- ignore errors ...
    when others then null;
end;
/
sho err

begin
    ords.define_module(
        p_module_name    => apex_apps_rest.c_ords_module_name,
        p_base_path      => 'deploy/app/' );

    ----------------------------------------------------------------------------
    -- Export Handler for the full application
    -- 
    -- Parameters:
    -- * app_id (URL)               ID of the application to export
    -- * Accept (Request Header)    format in which to return the export file
    --
    -- Example:
    --
    -- curl -X GET 
    --      -H "Accept: application/sql
    --      http://localhost:8080/ords/schema/deploy/app/102
    ----------------------------------------------------------------------------
    ords.define_template(
        p_module_name    => apex_apps_rest.c_ords_module_name,
        p_pattern        => ':app_file' );

    ords.define_handler(
        p_module_name    => apex_apps_rest.c_ords_module_name,
        p_pattern        => ':app_file',
        p_method         => 'GET',
        p_source_type    => ords.source_type_plsql,
        p_source         => 
q'~begin 
    apex_apps_rest.export( 
        p_application_file => :app_file,
        p_components       => null,
        p_mimetype         => null );
end;~' );

    ords.define_parameter(
        p_module_name        => apex_apps_rest.c_ords_module_name,
        p_pattern            => ':app_file',
        p_method             => 'GET',
        p_name               => 'Accept',
        p_bind_variable_name => 'ACCEPT',
        p_source_type        => 'HEADER' );

    ----------------------------------------------------------------------------
    -- Export Handler for application components
    -- 
    -- Parameters:
    -- * app_id (URL)               ID of the application to export
    -- * Accept (Request Header)    format in which to return the export file
    -- *        (Request Body)      components to export, as outlined in the documentation
    --                              for APEX_EXPORT.GET_APPLICATION. Components separated
    --                              by comma.
    --
    -- Example:
    --
    -- curl -X POST
    --      -H "Accept: application/sql
    --      -d 'PAGE:1,PAGE:2'
    --      http://localhost:8080/ords/schema/deploy/app/102/components
    ----------------------------------------------------------------------------
    ords.define_template(
        p_module_name    => apex_apps_rest.c_ords_module_name,
        p_pattern        => ':app_id/components' );

    ords.define_handler(
        p_module_name    => apex_apps_rest.c_ords_module_name,
        p_pattern        => ':app_id/components',
        p_method         => 'POST',
        p_source_type    => ords.source_type_plsql,
        p_source         => 
q'~begin 
    apex_apps_rest.export( 
        p_application_file => :app_id,
        p_components       => :body_text,
        p_mimetype         => :accept );
end;~' );

    ords.define_parameter(
        p_module_name        => apex_apps_rest.c_ords_module_name,
        p_pattern            => ':app_id/components',
        p_method             => 'POST',
        p_name               => 'Accept',
        p_bind_variable_name => 'ACCEPT',
        p_source_type        => 'HEADER' );

    ----------------------------------------------------------------------------
    -- Import Handler
    -- curl -X POST 
    --      -H "Content-Type: tapplication/octet-stream" 
    --      --data-binary @f101.sql 
    --      http://localhost:8080/ords/schema/deploy/app/102
    --
    -- Parameters:
    -- X-Target-Workspace - HTTP Header
    ----------------------------------------------------------------------------
    ords.define_template(
        p_module_name    => apex_apps_rest.c_ords_module_name,
        p_pattern        => ':app_id/' );

    ords.define_handler(
        p_module_name    => apex_apps_rest.c_ords_module_name,
        p_pattern        => ':app_id/',
        p_method         => 'POST',
        p_source_type    => ords.source_type_plsql,
        p_source         => 
q'~begin 
    apex_apps_rest.import( 
        p_application_id => :app_id,
        p_mimetype       => :content_type,
        p_to_workspace   => :workspace,
        p_export_file    => :body );
end;~' );

    ords.define_parameter(
        p_module_name        => apex_apps_rest.c_ords_module_name,
        p_pattern            => ':app_id/',
        p_method             => 'POST',
        p_name               => 'X-Target-Workspace',
        p_bind_variable_name => 'WORKSPACE',
        p_source_type        => 'HEADER' );

    ----------------------------------------------------------------------------
    -- Delete Handler
    -- curl -X DELETE 
    --      http://localhost:8080/ords/schema/deploy/app/102
    --
    -- Parameters:
    -- X-Target-Workspace - HTTP Header
    ----------------------------------------------------------------------------
    ords.define_handler(
        p_module_name    => apex_apps_rest.c_ords_module_name,
        p_pattern        => ':app_file',
        p_method         => 'DELETE',
        p_source_type    => ords.source_type_plsql,
        p_source         => 
q'~begin 
    apex_apps_rest.delete( 
        p_application_id => :app_file,
        p_in_workspace   => :workspace );
end;~' );

    ords.define_parameter(
        p_module_name        => apex_apps_rest.c_ords_module_name,
        p_pattern            => ':app_file',
        p_method             => 'DELETE',
        p_name               => 'X-Target-Workspace',
        p_bind_variable_name => 'WORKSPACE',
        p_source_type        => 'HEADER' );

end;
/
-- 
-- the COMMIT is important.
commit
/
```
# 3. Testing the new REST API

Now we have installed the PL/SQL package, as well as the ORDS REST Handlers. We can now do a first test by calling the REST Handler to _export_ an application. The following example assumes that application **101** exists in the APEX workspace, which is mapped to the database schema where the package and REST API are installed.

Use the **curl** utility to export application **101** and to store the contents in the **f101.sql** file. Of course, other REST clients like **Postman** will also work. For simplicity, this blog posting is based on **curl** examples.

```bash

$ curl -X GET http://localhost:8080/ords/schema/deploy/app/101 > f101.sql
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 1369k    0 1369k    0     0   491k      0 --:--:--  0:00:02 --:--:--  491k

$ more f101.sql
prompt --application/set_environment
set define off verify off feedback off
whenever sqlerror exit sql.sqlcode rollback
--------------------------------------------------------------------------------
--
-- ORACLE Application Express (APEX) export file
--
-- You should run the script connected to SQL*Plus as the Oracle user
-- APEX_200200 or as the owner (parsing schema) of the application.
--
-- NOTE: Calls to apex_application_install override the defaults below.
--
--------------------------------------------------------------------------------
begin
wwv_flow_api.import_begin (
 p_version_yyyy_mm_dd=>'2020.10.01'
,p_release=>'20.2.0.00.20'
,p_default_workspace_id=>1303680926490695
,p_default_application_id=>101
,p_default_id_offset=>6096020459023782
,p_default_owner=>'SCHEMA'
);
end;
/
 
prompt APPLICATION 101 - Sample Geolocation Showcase
--
-- Application Export:
--   Application:     101
--   Name:            Sample Geolocation Showcase
--   Exported By:     SCHEMA
--   Flashback:       0
:
```

We can now call the **Import** REST Handler to import the **f101.sql** file, as a new application with the ID **256**.

```bash
$ curl -X POST                           \
       -H"Content-Type: application/sql" \
       --data-binary @f101.sql           \
       http://localhost:8080/ords/schema/deploy/app/256/
```

After this **curl** invocation completed, we have the application twice in our workspace.

![After import. the application exists twice in the workspace.](https://cdn.app.compendium.com/uploads/user/e7c690e8-6ff9-102a-ac6d-e4aebca50425/fbd61610-2cfe-4a98-b117-958129af0c39/Image/f15082f9f925aeba18a985904fe226ec/bildschirmfoto_2021_04_18_um_16_39_44.png)

Let's _delete_ that copy of the application now.

```bash
$ curl -X DELETE http://localhost:8080/ords/schema/deploy/app/256
```
The REST API also allows to only export application _components_: The following example exports pages **21** and **22** of application **101**, as a ZIP file.
```bash
$ curl --output f101_pages.zip      \
       -X POST                      \
       -H"Accept: application/zip"  \
       -H"Content-Type: text/plain" \
       -d 'PAGE:21,PAGE:22'         \
       http://localhost:8080/ords/schema/deploy/app/101/components

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 11894    0 11879  100    15  17316     21 --:--:-- --:--:-- --:--:-- 17312

$ unzip f101_pages.zip
Archive:  f101_pages.zip
  :
  inflating: f101/application/pages/delete_00021.sql  
  inflating: f101/application/pages/page_00021.sql  
  inflating: f101/application/pages/delete_00022.sql  
  inflating: f101/application/pages/page_00022.sql  
  inflating: f101/application/end_environment.sql  
  inflating: f101/install_component.sql
```
The new REST API appears to be functional. However, before actually using it, we want to _protect it in order to only allow authenticated access_. 

# 4. Protecting the REST API

ORDS allows to protect REST APIs with the **OAuth2 Client Credentials** out-of-the-box. First, we need to create an ORDS role (not a database role) and to assign that role to the REST Module we created before. As a result, all handlers in that module are now protected by that role.

```plsql

declare
    l_roles     sys.owa.vc_arr;
    l_modules   sys.owa.vc_arr;
    l_patterns  sys.owa.vc_arr;
begin
    ords.create_role(
        p_role_name => 'apex.apps.deployment.role');
      
    l_roles(1)   := 'apex.apps.deployment.role';
    l_modules(1) := 'apex.apps.expimp';

    ords.define_privilege(
        p_privilege_name => 'apex.apps.expimp.priv',
        p_roles          => l_roles,
        p_patterns       => l_patterns,
        p_modules        => l_modules,
        p_label          => 'apex.apps.expimp privilege.',
        p_description    => 'Protects the apex.apps.expimp module.',
        p_comments       => null );  
end;
/

commit
/
```
We can clearly see that the module is now protected: Unauthenticated curl requests are not accepted any more.

```bash
$ curl -X GET -I http://localhost:8080/ords/schema/deploy/app/101
HTTP/1.1 401 Unauthorized
Content-Type: text/html
Content-Length: 16358
```
Next, we need to create an **OAuth2 Client**, which allows us to authenticate to ORDS. For this, ORDS provides the [OAUTH](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/20.4/aelig/OAUTH-reference.html#GUID-55EA7EE8-F634-479E-9BEF-BAFFB695D18D) package. First, the **APEX Apps Deployment Client** is created, then the **apex.apps.deployment.role** role (which we created above) is assigned to that client.

```plsql
begin
    oauth.create_client(
        p_name            => 'APEX Apps Deployment Client',
        p_grant_type      => 'client_credentials',
        p_owner           => 'APEX Owner',
        p_description     => 'This is to authenticate for the deployment APIs',
        p_support_email   => 'deployment@mycompany.com',
        p_privilege_names => 'apex.apps.expimp.priv');

    oauth.grant_client_role(
        p_client_name   => 'APEX Apps Deployment Client',
        p_role_name     => 'apex.apps.deployment.role' );
end;
/

commit
/
```

Credentials for the OAuth2 Client Credentials flow are generated and can be retrieved from the **USER_ORDS_CLIENTS** view.

![Credentials for OAuth authentication can be retrieved from the USER_ORDS_CLIENTS view.](https://cdn.app.compendium.com/uploads/user/e7c690e8-6ff9-102a-ac6d-e4aebca50425/fbd61610-2cfe-4a98-b117-958129af0c39/Image/1740ff62d80715327db7e26704b6b02e/bildschirmfoto_2021_04_18_um_17_15_34.png)With all this in place, we can now follow the **OAuth2 Client Credentials** flow to first get an access token, and then we can do the actual REST call using the access token for authentication.

1. Get the access token:
```bash
$ curl -X POST -d'grant_type=client_credentials'                  \
               -u'{client-id}:{client-secret}'      \
               -H"Content-Type:application/x-www-form-urlencoded" \
               http://localhost:8080/ords/schema/oauth/token

{"access_token":"kKJQ2EzZMh7PaBDdTiw5sw","token_type":"bearer","expires_in":3600}
```
2. Perform the actual REST call using the access token:
```bash
$ curl -X GET                                          \
       -H"Authorization:Bearer kKJQ2EzZMh7PaBDdTiw5sw" \
       http://localhost:8080/ords/schema/deploy/app/101 > f101.sql
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 1369k    0 1369k    0     0   491k      0 --:--:--  0:00:02 --:--:--  491k

$ more f101.sql
prompt --application/set_environment
set define off verify off feedback off
whenever sqlerror exit sql.sqlcode rollback
--------------------------------------------------------------------------------
--
-- ORACLE Application Express (APEX) export file
:
```
We now have protected the REST API; applications can only be exported, imported or deleted after providing correct authentication credentials.

# 5. Summary

In this blog posting we have shown how to build an "Application Deployment" REST API using ORDS and some custom PL/SQL code on top of the **APEX_EXPORT** and **APEX_APPLICATION_INSTALL** API packages. The setup allows to export and import APEX applications using standard REST tools like curl, Postman or others. JDBC or SQL*Plus connections are no longer required for automated application deployments. 

This is just a simple example - the API can easily be extended to control supporting objects installation or whether to include translations, public or private reports. Also the shown authentication setup is only the most simple approach - ORDS would also allow to distribute the functionality to multiple REST modules and to have different roles, clients and credentials for exporting or importing.

## Further Reading:

1.  APEX PL/SQL API: [APEX_EXPORT](https://docs.oracle.com/en/database/oracle/application-express/20.2/aeapi/APEX_EXPORT.html#GUID-6A4628A6-9F86-4394-9938-87A7FFFC7BC8)
2.  APEX PL/SQL API: [APEX_APPLICATION_INSTALL](https://docs.oracle.com/en/database/oracle/application-express/20.2/aeapi/APEX_APPLICATION_INSTALL.html#GUID-64D43160-E4F9-44CF-96A4-42D3190102BE)
3.  ORDS PL/SQL API: [ORDS](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/20.4/aelig/ORDS-reference.html#GUID-E4476C14-01B1-4EA4-94D3-73B92C8C9AB3)
4.  ORDS PL/SQL API: [OAUTH](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/20.4/aelig/OAUTH-reference.html#GUID-55EA7EE8-F634-479E-9BEF-BAFFB695D18D)
5.  [ORDS Documentation](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/20.4/aelig/index.html)