REM dbdrv: none


PROMPT                ************************************
PROMPT                Data Manipulation Scripts Disclaimer
PROMPT                ************************************
PROMPT As always please run the scripts on test instance first before applying it
PROMPT on production. Make sure the data is validated for correctness and related
PROMPT functionality is verified after the script has been  run on a test instance.
PROMPT Customers are responsible to authenticate and verify correctness of data
PROMPT updated by data manipulation scripts.
PROMPT
accept file_n prompt 'Please enter the File name to export (default: <Resource>@<Instance>): ';

accept resource_n prompt 'Please enter the Resource name to export: ';


SET PAGESIZE 0 
SET LONG 90000

SPOOL C:\Users\yakiki.OPENU\Main\OP\GitREPOS\APEXRepositories\Public\Documentations\MDs\APEX\&resource_n..sql;

select AMSTERDAM.RBAC_EXIM.EXPORT(P_RESOURCE => '&resource_n') from dual;


SPOOL OFF
/

