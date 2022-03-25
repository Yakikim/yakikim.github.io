---
layout: mynote
tags: [notes, memo, configuration, infrastructures, apex, op] 
created: 2021-12-20 19:43
modified: 2021-12-20 19:43
type: Document
title:  configuration of the DEVOP scheme 
---
Week Of: [[2021-12-19]]
[[2021-12-20]]


#  תזכיר בנושא  configuration of the DEVOP scheme

[[home]]/[[Open University]]/[[Memos]]

## כללי
מסמך תיאור פעולות שיש לבצע על ה-DB למעבר מסביבת הבדיקות הלאה.
## דרישות והרשאות בסביבת המקור
### הרשאות 
#### Create client for SQL Enabled
````ad-code
```plsql
BEGIN
  -- ORDS Enable the Schema
  ords.enable_schema;
  -- Create OAUTH Client.
oauth.create_client(
    p_name            => 'RESTSQL',
    p_description     => 'Rest Enabled SQL Client',
    p_grant_type      => 'client_credentials',
    p_support_email   => 'yakiki@openu.ac.il',
    p_privilege_names => NULL);   
  oauth.grant_client_role('RESTSQL', 'SQL Developer');
  COMMIT;
 END; 
 
SELECT id, name, client_id, client_secret
FROM   user_ords_clients;
```
````

### אובייקטים 
`conn REST_AUTH/ser479420@oradeva`



````ad-code
collapse: close
title: auth_check_access 
```plsql
create or replace function auth_check_access(p_user IN VARCHAR2,
                                 p_resource     IN VARCHAR2,
                                 p_grant   IN VARCHAR2,
                                 p_sub_resource  IN VARCHAR2 DEFAULT NULL
                                 ) return NUMBER is

  BEGIN
    IF auth_pkg.check_access(p_user, p_resource, p_sub_resource, p_grant) = TRUE THEN
      RETURN 1;
    ELSE
      RETURN 0;
    END IF;
end auth_check_access;

```
````
## כתיבה בסביבת היעד
### אגרגציות לדוגמא
#### VIEW
````ad-code
title: OP_USERS_V
collapse: close
```plsql
CREATE OR REPLACE VIEW OP_USERS_V AS 
SELECT SVC.MIS_ZEHUT , SVC.PRATI, SVC.PK_GGC, SVC.USERNAME, SVC.NODE, SVC.MISHPACHA
  FROM TABLE(WWV_FLOW_T_CLOB(APEX_WEB_SERVICE.MAKE_REST_REQUEST(P_URL         => 'https://apex-ora-devtest.openu.ac.il:8443/oradeva/auth/v1/users',
                                                                P_HTTP_METHOD => 'GET'))) APX,
       JSON_TABLE(APX.COLUMN_VALUE FORMAT JSON,
                  '$."items"[*]'
                  COLUMNS("NODE" VARCHAR2(4000) PATH '$."node"',
                          "PRATI" VARCHAR2(4000) PATH '$."prati"',
                          "PK_GGC" VARCHAR2(4000) PATH '$."pk_ggc"',
                          "USERNAME" VARCHAR2(4000) PATH '$."username"',
                          "MIS_ZEHUT" VARCHAR2(4000) PATH '$."mis_zehut"',
                          "MISHPACHA" VARCHAR2(4000) PATH '$."mishpacha"')) SVC
;
```
````

---
````ad-code
title: employees
```plsql
CREATE OR REPLACE VIEW employees AS 
 SELECT SVC.*
  FROM TABLE(WWV_FLOW_T_CLOB(APEX_WEB_SERVICE.MAKE_REST_REQUEST(P_URL         => 'https://apex-ora-devtest.openu.ac.il:8443/oradeva/auth/hr/employees/',
                                                                P_HTTP_METHOD => 'GET'))) APX,
       JSON_TABLE(APX.COLUMN_VALUE FORMAT JSON,
                  '$."items"[*]'
                  COLUMNS("empno" VARCHAR2(4000) PATH '$."empno"',
                          "rn" VARCHAR2(4000) PATH '$."rn"',
                          "ename" VARCHAR2(4000) PATH '$."ename"',
                          "job" VARCHAR2(4000) PATH '$."job"',
                          "mgr" VARCHAR2(4000) PATH '$."mgr"',
                          "sal" VARCHAR2(4000) PATH '$."sal"',
                          "comm" VARCHAR2(4000) PATH '$."comm"',
                          "deptno" VARCHAR2(4000) PATH '$."deptno"',
                          "hiredate" VARCHAR2(4000) PATH '$."hiredate"')) SVC;
```
````
### אובייקטים
````ad-code
title:DEVOP_GET_GLOBAL_NAME 
collapse: close 
```plsql
create or replace function DEVOP_GET_GLOBAL_NAME(in_global_name IN VARCHAR2 := NULL)  RETURN  VARCHAR2 IS
  v_global_name VARCHAR2(100) :='';
BEGIN
    IF in_global_name IS  NULL  THEN
        BEGIN
            SELECT GLOBAL_NAME--substr(lower(GLOBAL_NAME),1,instr(lower(GLOBAL_NAME),'.')-1 )
            INTO   v_global_name
            FROM   GLOBAL_NAME
            WHERE  ROWNUM =1 ;
        END;
        IF  v_global_name IN  ('web9test','web9test2','web9test3','web9test4')      THEN
            v_global_name :='webdeva';
        END IF;
    ELSE
        v_global_name   := in_global_name;
    END IF ;

    RETURN v_global_name;
END;  
```
````

````ad-code
title: APEX_GENERAL_PKG 
collapse: close
```plsql
CREATE OR REPLACE PACKAGE APEX_GENERAL_PKG IS

  -- Author  : DIANA
  -- Purpose : Support apex activities

  -- Public type declarations

  -- Public constant declarations
  C_APX_COLL_SELECTED_ROWS CONSTANT VARCHAR2(30) := 'SELECTED_COLLECTION';

  C_CHECKED_VALUE   CONSTANT VARCHAR2(30) := 'Y';
  C_UNCHECKED_VALUE CONSTANT VARCHAR2(30) := 'N';

  -- Public variable declarations
  G_HTTP_BUFFER VARCHAR2(32000) := '';

  -- Public function and procedure declarations

  ------------------------------------------
  FUNCTION GET_AUTH(P_USER_ID IN VARCHAR2, P_APP IN VARCHAR2) RETURN NUMBER;

  /*  ------------------------------------------
  FUNCTION FUN_STR_MACHLAKA_AKADEMIT(IN_STR_MACHLAKA IN VARCHAR2)
    RETURN VARCHAR2;*/
  ------------------------------------------
  PROCEDURE GET_FILE(P_FILE_DOC IN NUMBER, P_TABLE_NAME IN VARCHAR2);
  -----------------------------------------------------------------------
  FUNCTION GET_CHECKED_VALUE RETURN VARCHAR2;
  ------------------------------------------
  FUNCTION IF_AUTHORIZED(P_ARG VARCHAR2) RETURN NUMBER;
  ------------------------------------------
  FUNCTION GET_UNCHECKED_VALUE RETURN VARCHAR2;
  ------------------------------------------
  FUNCTION GET_COLL_SELECTED_NAME RETURN VARCHAR2;
  ------------------------------------------
  FUNCTION GET_COLLECTION_COUNT RETURN NUMBER;
  ------------------------------------------
  FUNCTION GET_REPORT_SQL(PI_REPORT_REGION_NAME IN VARCHAR2,
                          PI_APP_ID             IN NUMBER DEFAULT NV('APP_ID'),
                          PI_PAGE_ID            IN NUMBER DEFAULT NV('APP_PAGE_ID'),
                          PI_ALL_COLS           IN BOOLEAN DEFAULT TRUE,
                          PI_SHOW_LABELS        IN BOOLEAN DEFAULT FALSE)
    RETURN VARCHAR2;
  ------------------------------------------
  FUNCTION SWITCH_CHECK_ALL(PI_CHECK_VALUE        VARCHAR2,
                            PI_REPORT_REGION_NAME IN VARCHAR2,
                            PI_APP_ID             IN NUMBER := NV('APP_ID'),
                            PI_PAGE_ID            IN NUMBER := NV('APP_PAGE_ID'))
    RETURN VARCHAR2;
  ------------------------------------------

  ------------------------------------------
  /*  PROCEDURE truncate_collection;*/
  ------------------------------------------
  PROCEDURE SET_LOG;
  ------------------------------------------
  /*  PROCEDURE log(pi_msg VARCHAR2, pi_type VARCHAR2 := NULL);
  ------------------------------------------*/
  FUNCTION PERFORM_CHECKBOX(PI_PK VARCHAR2) RETURN VARCHAR2;
  ------------------------------------------
  FUNCTION GET_RBAC_APP(PI_APP_ID NUMBER) RETURN VARCHAR2;
  ------------------------------------------
  FUNCTION GET_GLOBAL_NAME RETURN VARCHAR2;
  ------------------------------------------
  FUNCTION READFROMWEB(URL VARCHAR2) RETURN CLOB;

  ----------------------------------------------
  FUNCTION GET_AUTH_CHECK_ACCESS(P_USER_ID IN VARCHAR2,
                                 P_APP     IN VARCHAR2,
                                 P_GRANT   IN VARCHAR2) RETURN NUMBER;
  ----------------------------------------------
    FUNCTION CHECK_ACCESS(P_USER_ID IN VARCHAR2,
                                 P_RESOURCE     IN VARCHAR2,
                                 P_GRANT   IN VARCHAR2,
                                 P_SUB_RESOURCE IN VARCHAR2 DEFAULT NULL) RETURN BOOLEAN;
                                 
                                 
END APEX_GENERAL_PKG;
/
CREATE OR REPLACE PACKAGE BODY APEX_GENERAL_PKG IS
  -- Purpose : Support apex activities

  -- Public type declarations

  -- Public constant declarations
  C_SET_DEBUG VARCHAR2(10) := 'NO';

  -- Public variable declarations
  V_IND         INTEGER;
  V_MSG         VARCHAR2(2000);
  V_KEEPSYSDATE DATE;
  V_STEP        VARCHAR2(10);

  ERREXCEPETION EXCEPTION;

  ------------------------------------------
  PROCEDURE INSERT_TO_DEBUG(P_MESSAGE VARCHAR2) IS
  BEGIN
    APEX_DEBUG.MESSAGE(P_MESSAGE => '+++++++++++ ' || P_MESSAGE,
                       P_LEVEL   => 3,
                       P_FORCE   => TRUE);
  END;
  ------------------------------------------
  FUNCTION GET_AUTH(P_USER_ID IN VARCHAR2, P_APP IN VARCHAR2) RETURN NUMBER IS
    V_USER_ROLES     VARCHAR2(2000) := '';
    L_SQL_PARAMETERS APEX_EXEC.T_PARAMETERS;
    L_OUT_VALUE      VARCHAR2(32767);
  BEGIN
    BEGIN
      APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'p_user_id', P_USER_ID);
      APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'p_app', P_APP);
      APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'v_user_roles', '');
    
      APEX_EXEC.EXECUTE_REMOTE_PLSQL(P_SERVER_STATIC_ID => 'REST_AUTH',
                                     P_PLSQL_CODE       => q'#begin AUTH_PKG.authorize(:p_user_id, :p_app, :v_user_roles); end;#',
                                     P_AUTO_BIND_ITEMS  => FALSE,
                                     P_SQL_PARAMETERS   => L_SQL_PARAMETERS);
    
      V_USER_ROLES := APEX_EXEC.GET_PARAMETER_VARCHAR2(P_PARAMETERS => L_SQL_PARAMETERS,
                                                       P_NAME       => 'v_user_roles');
    
    EXCEPTION
      WHEN OTHERS THEN
        V_USER_ROLES := '';
    END;
    IF V_USER_ROLES IS NULL THEN
      RETURN 0;
    ELSE
      RETURN 1;
    END IF;
  END;
  ------------------------------------------

  /*  FUNCTION FUN_STR_MACHLAKA_AKADEMIT(IN_STR_MACHLAKA IN VARCHAR2)
    RETURN VARCHAR2 IS
    RETURN_VALUE VARCHAR2(1000);
  BEGIN
    FOR REC IN (SELECT C.TEUR SHEM_MACHLAKA
                  FROM TPMACHLAKOT_UC6 C
                 WHERE INSTR(NVL(',' || IN_STR_MACHLAKA || ',', '#'),
                             ',' || C.KOD || ',',
                             1) > 0) LOOP
      RETURN_VALUE := LTRIM(LTRIM(RETURN_VALUE || '; ' || REC.SHEM_MACHLAKA,
                                  ';'),
                            ' ');
    END LOOP;
    RETURN RETURN_VALUE;
  END FUN_STR_MACHLAKA_AKADEMIT;*/
  --------------------------------------------------
  PROCEDURE GET_FILE(P_FILE_DOC IN NUMBER, P_TABLE_NAME IN VARCHAR2) IS
    L_BFILE BFILE;
  
    -- l_blob_content  documents.blob_content%TYPE;
    -- l_mime_type     documents.mime_type%TYPE;
    L_BLOB_CONTENT BLOB;
    L_MIME_TYPE    VARCHAR2(100) := '';
    L_FILE_NAME    VARCHAR2(200) := '';
  BEGIN
    EXECUTE IMMEDIATE 'SELECT FILE_BLOB, MIME_TYPE,FILENAME
        FROM ' || P_TABLE_NAME || 'WHERE doc_id = ' ||
                      P_FILE_DOC
      INTO L_BLOB_CONTENT, L_MIME_TYPE, L_FILE_NAME;
  
    SYS.HTP.INIT;
    SYS.OWA_UTIL.MIME_HEADER(L_MIME_TYPE, FALSE);
    SYS.HTP.P('Content-Length: ' || DBMS_LOB.GETLENGTH(L_BFILE));
    SYS.HTP.P('Content-Disposition: filename="' || L_FILE_NAME || '"');
    SYS.OWA_UTIL.HTTP_HEADER_CLOSE;
  
    SYS.WPG_DOCLOAD.DOWNLOAD_FILE(L_BFILE);
    APEX_APPLICATION.STOP_APEX_ENGINE;
  EXCEPTION
    WHEN OTHERS THEN
      HTP.P('Whoops' || ' ' || SQLERRM);
  END;
  ------------------------------------------
  /*  PROCEDURE log(pi_msg VARCHAR2, pi_type VARCHAR2 := NULL) IS
    PRAGMA AUTONOMOUS_TRANSACTION;
  BEGIN
    IF c_SET_DEBUG = 'YES' THEN
      INSERT INTO apx_log
        (run_seq, msg, TYPE, keep_date)
      VALUES
        (apx_run_seq.nextval, pi_msg, pi_type, SYSDATE);
      COMMIT;
    END IF;
  END;*/

  -- Function and procedure implementations
  ------------------------------------------
  FUNCTION GET_COLL_SELECTED_NAME RETURN VARCHAR2 IS
  BEGIN
    RETURN C_APX_COLL_SELECTED_ROWS;
  END;
  ------------------------------------------
  FUNCTION GET_CHECKED_VALUE RETURN VARCHAR2 IS
  BEGIN
    RETURN C_CHECKED_VALUE;
  END;
  ------------------------------------------
  FUNCTION GET_COLLECTION_COUNT RETURN NUMBER IS
    L_COUNT NUMBER;
  BEGIN
    SELECT COUNT(*)
      INTO L_COUNT
      FROM APEX_COLLECTIONS T
     WHERE T.COLLECTION_NAME = C_APX_COLL_SELECTED_ROWS;
    INSERT_TO_DEBUG(P_MESSAGE => 'Now in collection exists ' || L_COUNT ||
                                 ' rows');
  
    RETURN L_COUNT;
  END;
  ------------------------------------------
  FUNCTION GET_UNCHECKED_VALUE RETURN VARCHAR2 IS
  BEGIN
    RETURN C_UNCHECKED_VALUE;
  END;
  ------------------------------------------
  FUNCTION GET_REPORT_SQL(PI_REPORT_REGION_NAME IN VARCHAR2,
                          PI_APP_ID             IN NUMBER DEFAULT NV('APP_ID'),
                          PI_PAGE_ID            IN NUMBER DEFAULT NV('APP_PAGE_ID'),
                          PI_ALL_COLS           IN BOOLEAN DEFAULT TRUE,
                          PI_SHOW_LABELS        IN BOOLEAN DEFAULT FALSE)
    RETURN VARCHAR2 IS
    V_REPORT_ID NUMBER;
    V_REGION_ID NUMBER;
    V_REPORT    APEX_IR.T_REPORT;
    V_QUERY     VARCHAR2(32767);
    V_COLUMN    VARCHAR2(4000);
    V_POSITION  NUMBER;
    V_FROM      NUMBER;
    V_LABELS    VARCHAR2(4000);
  BEGIN
    SELECT REGION_ID
      INTO V_REGION_ID
      FROM APEX_APPLICATION_PAGE_REGIONS T
     WHERE APPLICATION_ID = PI_APP_ID
       AND PAGE_ID = PI_PAGE_ID
       AND T.REGION_NAME = PI_REPORT_REGION_NAME
       AND SOURCE_TYPE = 'Interactive Report';
  
    V_REPORT_ID := APEX_IR.GET_LAST_VIEWED_REPORT_ID(P_PAGE_ID   => PI_PAGE_ID,
                                                     P_REGION_ID => V_REGION_ID);
  
    V_REPORT := APEX_IR.GET_REPORT(P_PAGE_ID   => PI_PAGE_ID,
                                   P_REGION_ID => V_REGION_ID,
                                   P_REPORT_ID => V_REPORT_ID);
    V_QUERY  := V_REPORT.SQL_QUERY;
  
    FOR I IN 1 .. V_REPORT.BINDS.COUNT LOOP
      V_POSITION := INSTR(UPPER(V_QUERY), UPPER(V_REPORT.BINDS(I).NAME));
      IF V_POSITION > 0 THEN
        V_QUERY := SUBSTR(V_QUERY, 1, V_POSITION - 2) || '''' || V_REPORT.BINDS(I)
                  .VALUE || '''' ||
                   SUBSTR(V_QUERY,
                          V_POSITION + LENGTH(V_REPORT.BINDS(I).NAME) + 1);
      END IF;
    END LOOP;
  
    IF PI_SHOW_LABELS AND NOT PI_ALL_COLS THEN
      V_FROM   := INSTR(UPPER(V_QUERY), ' FROM ');
      V_LABELS := SUBSTR(V_QUERY, 1, V_FROM);
    
      FOR B IN (SELECT *
                  FROM APEX_APPLICATION_PAGE_IR_COL T
                 WHERE APPLICATION_ID = PI_APP_ID
                   AND PAGE_ID = PI_PAGE_ID
                   AND T.REGION_ID = V_REGION_ID
                 ORDER BY DISPLAY_ORDER) LOOP
        V_LABELS := REPLACE(V_LABELS,
                            '"' || B.COLUMN_ALIAS || '"',
                            B.COLUMN_ALIAS || ' "' || B.REPORT_LABEL || '"');
      END LOOP;
    
      V_QUERY := V_LABELS || SUBSTR(V_QUERY, V_FROM + 1);
    END IF;
  
    IF PI_ALL_COLS THEN
      FOR C IN (SELECT *
                  FROM APEX_APPLICATION_PAGE_IR_COL T
                 WHERE APPLICATION_ID = PI_APP_ID
                   AND PAGE_ID = PI_PAGE_ID
                   AND T.REGION_ID = V_REGION_ID
                 ORDER BY DISPLAY_ORDER) LOOP
        V_COLUMN := V_COLUMN || ', ' || C.COLUMN_ALIAS || CASE
                      WHEN PI_SHOW_LABELS THEN
                       ' "' || C.REPORT_LABEL || '"'
                      ELSE
                       NULL
                    END;
      END LOOP;
    
      V_COLUMN   := LTRIM(V_COLUMN, ', ');
      V_POSITION := INSTR(V_QUERY, '(');
      V_QUERY    := SUBSTR(V_QUERY, V_POSITION);
      V_QUERY    := 'SELECT ' || V_COLUMN || ' FROM ' || V_QUERY;
    END IF;
    INSERT_TO_DEBUG('get_report_sql select:' || V_QUERY);
  
    RETURN V_QUERY;
  EXCEPTION
    WHEN OTHERS THEN
      V_QUERY := SQLERRM;
      RETURN V_QUERY;
  END GET_REPORT_SQL;
  ------------------------------------------
  FUNCTION SWITCH_CHECK_ALL(PI_CHECK_VALUE        VARCHAR2,
                            PI_REPORT_REGION_NAME IN VARCHAR2,
                            PI_APP_ID             IN NUMBER := NV('APP_ID'),
                            PI_PAGE_ID            IN NUMBER := NV('APP_PAGE_ID'))
    RETURN VARCHAR2 IS
    L_SELECT    VARCHAR2(32600);
    L_REFCURSOR SYS_REFCURSOR;
    L_PK        VARCHAR2(100);
  BEGIN
    V_STEP := 0;
    INSERT_TO_DEBUG('switch_check_all pi_check_value:' || PI_CHECK_VALUE);
    INSERT_TO_DEBUG('switch_check_all pi_report_region_name:' ||
                    PI_REPORT_REGION_NAME);
    IF NOT APEX_COLLECTION.COLLECTION_EXISTS(C_APX_COLL_SELECTED_ROWS) THEN
      INSERT_TO_DEBUG('switch_check_all collection ' ||
                      C_APX_COLL_SELECTED_ROWS || ' exists');
      APEX_COLLECTION.CREATE_COLLECTION(P_COLLECTION_NAME => C_APX_COLL_SELECTED_ROWS);
    END IF;
    INSERT_TO_DEBUG('switch_check_all begin');
    APEX_COLLECTION.TRUNCATE_COLLECTION(P_COLLECTION_NAME => C_APX_COLL_SELECTED_ROWS);
    IF PI_CHECK_VALUE = C_CHECKED_VALUE THEN
      INSERT_TO_DEBUG(P_MESSAGE => 'Checked');
      L_SELECT := 'select PK from (' ||
                  GET_REPORT_SQL(PI_APP_ID             => PI_APP_ID,
                                 PI_PAGE_ID            => PI_PAGE_ID,
                                 PI_REPORT_REGION_NAME => PI_REPORT_REGION_NAME,
                                 PI_ALL_COLS           => TRUE,
                                 PI_SHOW_LABELS        => FALSE) || ')';
      /*      insert_to_debug(p_message => 'switch_check_all select:' || chr(10) ||
                                            l_Select,
                               p_level   => 3);
      */
      V_STEP := 1;
      OPEN L_REFCURSOR FOR L_SELECT;
      LOOP
        FETCH L_REFCURSOR
          INTO L_PK;
        EXIT WHEN L_REFCURSOR%NOTFOUND;
        V_STEP := 2;
        INSERT_TO_DEBUG(P_MESSAGE => 'into loop :' /*||l_RefCursor%ROWCOUNT*/);
        V_MSG  := APEX_COLLECTION.ADD_MEMBER(P_COLLECTION_NAME => C_APX_COLL_SELECTED_ROWS,
                                             P_C001            => L_PK);
        V_STEP := 3;
        INSERT_TO_DEBUG(P_MESSAGE => 'switch_check_all add_member:' ||
                                     V_MSG);
      END LOOP;
      CLOSE L_REFCURSOR;
      V_STEP := 4;
    ELSE
      INSERT_TO_DEBUG(P_MESSAGE => 'UnChecked');
    END IF;
    RETURN NULL;
  EXCEPTION
    WHEN OTHERS THEN
      V_MSG := 'Step=' || V_STEP || ' # ' || SQLERRM;
      APEX_COLLECTION.TRUNCATE_COLLECTION(P_COLLECTION_NAME => C_APX_COLL_SELECTED_ROWS);
      INSERT_TO_DEBUG(P_MESSAGE => 'switch_check_all Exception:' || V_MSG);
      RETURN 'Exception:' || V_MSG || CHR(10) || L_SELECT;
  END;
  ------------------------------------------
  FUNCTION PERFORM_CHECKBOX(PI_PK VARCHAR2) RETURN VARCHAR2 IS
    L_VALUE     VARCHAR2(1000) := PI_PK;
    L_CURRINDEX INTEGER := 0;
    L_DUMMY     VARCHAR2(2000);
    L_RC        VARCHAR2(2000);
  BEGIN
    APEX_DEBUG.ENTER(P_ROUTINE_NAME => 'perform_checkbox',
                     P_NAME01       => 'pi_PK',
                     P_VALUE01      => PI_PK);
  
    IF NOT APEX_COLLECTION.COLLECTION_EXISTS(C_APX_COLL_SELECTED_ROWS) THEN
      APEX_COLLECTION.CREATE_COLLECTION(P_COLLECTION_NAME => C_APX_COLL_SELECTED_ROWS);
    END IF;
    --
  
    FOR C1 IN (SELECT SEQ_ID
                 FROM APEX_COLLECTIONS
                WHERE COLLECTION_NAME = C_APX_COLL_SELECTED_ROWS
                  AND C001 = L_VALUE) LOOP
      L_CURRINDEX := C1.SEQ_ID;
      EXIT;
    END LOOP;
    APEX_DEBUG.TRACE(P_MESSAGE => 'l_CurrIndex=' || L_CURRINDEX);
    --
    IF L_CURRINDEX = 0 THEN
      BEGIN
        L_DUMMY := APEX_COLLECTION.ADD_MEMBER(P_COLLECTION_NAME => C_APX_COLL_SELECTED_ROWS,
                                              P_C001            => L_VALUE);
        L_RC    := C_CHECKED_VALUE;
      END;
    ELSE
      BEGIN
        INSERT_TO_DEBUG(P_MESSAGE => L_RC);
        APEX_COLLECTION.DELETE_MEMBER(P_COLLECTION_NAME => C_APX_COLL_SELECTED_ROWS,
                                      P_SEQ             => L_CURRINDEX);
        L_RC := C_UNCHECKED_VALUE;
      END;
    END IF;
    INSERT_TO_DEBUG(P_MESSAGE => L_RC);
    COMMIT;
    RETURN L_RC;
  EXCEPTION
    WHEN OTHERS THEN
      L_RC := ' Exception:' || SQLERRM;
  END;
  ------------------------------------------
  /*  PROCEDURE truncate_collection IS
  BEGIN
    log('truncate_collection');
    IF NOT apex_collection.collection_exists(c_APX_COLL_SELECTED_ROWS) THEN
      apex_collection.create_collection(p_collection_name => c_APX_COLL_SELECTED_ROWS);
    END IF;
    apex_collection.truncate_collection(p_collection_name => c_APX_COLL_SELECTED_ROWS);
  END;*/
  ------------------------------------------
  FUNCTION IF_AUTHORIZED(P_ARG VARCHAR2) RETURN NUMBER IS
  BEGIN
    IF APEX_AUTHORIZATION.IS_AUTHORIZED(P_ARG) THEN
      RETURN 1;
    ELSE
      RETURN 0;
    END IF;
  END;
  ------------------------------------------

  PROCEDURE SET_LOG IS
  BEGIN
    C_SET_DEBUG := 'YES';
  END;
  ------------------------------------------
  FUNCTION READFROMWEB(URL VARCHAR2) RETURN CLOB IS
    PCS  UTL_HTTP.HTML_PIECES;
    RETV CLOB;
  BEGIN
    UTL_HTTP.SET_PROXY('proxy5.openu.ac.il');
    UTL_HTTP.SET_TRANSFER_TIMEOUT(600);
    UTL_HTTP.SET_BODY_CHARSET('utf8');
    PCS := UTL_HTTP.REQUEST_PIECES(URL);
    DBMS_OUTPUT.PUT_LINE('pcs' || TO_CHAR(PCS.COUNT));
    FOR I IN 1 .. PCS.COUNT LOOP
      RETV := RETV || (PCS(I));
    END LOOP;
    RETURN RETV;
  END;
  -------------------------------------------------
  FUNCTION GET_RBAC_APP(PI_APP_ID NUMBER) RETURN VARCHAR2 IS
    L_RBAC VARCHAR2(100);
  BEGIN
    SELECT T.RBAC_NAME_APPLICATION
      INTO L_RBAC
      FROM APX_RBAC_LINK T
     WHERE T.APEX_APP_ID = PI_APP_ID;
    RETURN L_RBAC;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN 'ERROR: ' || SQLERRM;
  END;

  ------------------------------------------
  FUNCTION GET_GLOBAL_NAME RETURN VARCHAR2 IS
    L_RC VARCHAR2(200);
  BEGIN
    L_RC := DEVOP_GET_GLOBAL_NAME;
    IF L_RC = 'ora9' THEN
      RETURN 'prod';
    ELSIF L_RC = 't2000' THEN
      RETURN 'oradeva';
    ELSE
      RETURN L_RC;
    END IF;
  END;

  FUNCTION GET_AUTH_CHECK_ACCESS(P_USER_ID IN VARCHAR2,
                                 P_APP     IN VARCHAR2,
                                 P_GRANT   IN VARCHAR2) RETURN NUMBER IS
    RETURN_VAL       NUMBER;
    L_SQL_PARAMETERS APEX_EXEC.T_PARAMETERS;
  BEGIN
    APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'p_user_id', P_USER_ID);
    APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'p_app', P_APP);
    APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'p_grant', P_GRANT);
    APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'RETURN_VAL', 0);
  
    APEX_EXEC.EXECUTE_REMOTE_PLSQL(P_SERVER_STATIC_ID => 'REST_AUTH',
                                   P_PLSQL_CODE       => q'#begin
             :RETURN_VAL := sys.diutil.bool_to_int(auth_pkg.check_access(:p_user_id, :p_app, NULL, :p_grant));
              end;#',
                                   P_AUTO_BIND_ITEMS  => FALSE,
                                   P_SQL_PARAMETERS   => L_SQL_PARAMETERS);
  
    RETURN_VAL := APEX_EXEC.GET_PARAMETER_NUMBER(P_PARAMETERS => L_SQL_PARAMETERS,
                                                 P_NAME       => 'RETURN_VAL');
  

    RETURN RETURN_VAL;
  END;
  -----------------------------
    FUNCTION CHECK_ACCESS(P_USER_ID IN VARCHAR2,
                                 P_RESOURCE     IN VARCHAR2,
                                 P_GRANT   IN VARCHAR2,
                                 P_SUB_RESOURCE IN VARCHAR2 DEFAULT NULL) RETURN BOOLEAN IS
  RETURN_VAL       NUMBER;
    L_SQL_PARAMETERS APEX_EXEC.T_PARAMETERS;
  BEGIN
    APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'p_user_id', P_USER_ID);
    APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'p_resource', P_RESOURCE);
    APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'p_grant', P_GRANT);
    APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'p_sub_resource', P_SUB_RESOURCE);
    APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'RETURN_VAL', 0);
  
    APEX_EXEC.EXECUTE_REMOTE_PLSQL(P_SERVER_STATIC_ID => 'REST_AUTH',
                                   P_PLSQL_CODE       => q'#begin
             :RETURN_VAL := sys.diutil.bool_to_int(auth_pkg.check_access(:p_user_id, :p_resource, :p_sub_resource, :p_grant));
              end;#',
                                   P_AUTO_BIND_ITEMS  => FALSE,
                                   P_SQL_PARAMETERS   => L_SQL_PARAMETERS);
  
    RETURN_VAL := APEX_EXEC.GET_PARAMETER_NUMBER(P_PARAMETERS => L_SQL_PARAMETERS,
                                                 P_NAME       => 'RETURN_VAL');
  
IF RETURN_VAL = 1 THEN 
  RETURN TRUE;  
  ELSE
    RETURN FALSE;
    END IF;
    EXCEPTION WHEN OTHERS THEN
      RETURN FALSE;
      
  END;
  ----------------------------
BEGIN
  -- Initialization
  --set_log;
  APEX_DEBUG.ENABLE;
  APEX_DEBUG.ENABLE(3);

END APEX_GENERAL_PKG;
/

```
````
#memo #op/memo
