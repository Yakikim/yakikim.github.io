#!python3
# -*- coding: utf-8 -*-
import requests
import pandas as pd
import codecs
import sys


from requests.auth import HTTPBasicAuth
my_headers = HTTPBasicAuth('yakiki@openu.ac.il','sjsj2cccd7t3mybfvvwlkcmp42tuzjalez7ohe265v65heo6y5sa')

response = requests.get("http://tfs1:8080/tfs/Codesafe/Oracle%20APEX/_apis/work/teamsettings/iterations?api-version=4.1", auth=my_headers)

dftext = response.json()
df = pd.DataFrame(dftext['value'])

iterationid = df['id'][0]
response = requests.get("http://tfs1:8080/tfs/Codesafe/Oracle%20APEX/_apis/work/teamsettings/iterations/" + iterationid +"/workitems?api-version=4.1-preview.1", auth=my_headers)
dftext = response.json()
ids = str()
for x in dftext['workItemRelations'] :
    ids = ids + str(x['target']['id']) + ","

iterationid = df['id'][1]
response = requests.get("http://tfs1:8080/tfs/Codesafe/Oracle%20APEX/_apis/work/teamsettings/iterations/" + iterationid +"/workitems?api-version=4.1-preview.1", auth=my_headers)
dftext = response.json()
for x in dftext['workItemRelations'] :
    ids = ids + str(x['target']['id']) + ","

ids = ids[:-1]
response = requests.get("http://tfs1:8080/tfs/Codesafe/Oracle%20APEX/_apis/wit/workitems/?ids=" + str(ids), auth=my_headers)
restext = response.json()['value']
wit_list = []
for wit_info in restext:
	wit_list.append([int(wit_info['id']), wit_info['url'], wit_info['fields']['System.State'], wit_info['fields']['System.Title'] ,wit_info['fields']['System.WorkItemType'], wit_info['fields']['System.IterationPath'], wit_info['fields'] ])

wit_df = pd.DataFrame(data =wit_list, columns=['id', 'url', 'State' ,'Title', 'Type','Iteration' ,'fields'] )
#baseFilePath = "C:/Users/yakiki.OPENU/Main/OP/GitREPOS/github/MyObsidian/📒Notes/"
#filePath =  input('Type the file in /Notes:')
#fullPath = baseFilePath + filePath + ".md"
#myfile = codecs.open(fullPath, "a", "utf-8")
sys.stdout.buffer.write(('## This Week\'s Work Items \n \n').encode('utf8'))
sys.stdout.buffer.write(('| Type | ID | Title | State | Iteration |\n').encode('utf8'))
sys.stdout.buffer.write(('| -- | -- | -- | -- | -- |\n').encode('utf8'))
for ind, row in wit_df.iterrows():
	if row['State'] != 'Closed' :
		text = ('| '+ row['Type']+ ' |  '+  str(row['id']) + ' |['+ row['Title'] +']('+ row['url'].replace('_apis/wit/workItems/','_workItems?id=') +" ) | "+ row['State'] + "  | "+  row['Iteration'].replace('Oracle APEX\\','') + '|\n').encode('utf8')
		sys.stdout.buffer.write(text)
sys.stdout.buffer.write(('\n').encode('utf8'))
for ind, row in wit_df.iterrows():
	sys.stdout.buffer.write(('- [ ] #task Type "'+ row['Type']+'" ID '+ str(row['id']) +' Title[['+ row['url'].replace('_apis/wit/workItems/','_workItems?id=') +'|'+ row['Title'] +"]]\n").encode('utf8')) if row['State'] != 'Closed' else ' '

#myfile.close()