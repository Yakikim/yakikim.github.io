---
layout: mynote
tags: [notes, build, devops, apex, infrastructures, pipeline, memo, op] 
created: 2022-01-19 17:39
modified: 2022-01-19 17:39
type: Document
title:  תכנון תהליך ה-Build של אפליקציות APEX 
---
Week Of: [[2022-01-16]]
[[2022-01-19]]


#  תזכיר בנושא  תכנון תהליך ה-Build של אפליקציות APEX

[[home]]/[[Open University]]/[[Memos]]

## רקע\תיאור
תהליך ה-Build יהיה מורכב מהתהליכים הבאים:
תהליך TEST:
Trigger: Merge into QA branch
Step 1: Collect the TNS and credentials
Step 2: Import the Application
Step 3: Import the DB Objects
Step 4: move the controller.xml to archive


```mermaid
graph 
	a(("Merge to QA")) --> aa["Collect info"]
	aa --> b{"Is connected?"}
	b -. Y .-> c["Import to QA instance"]
	c --> f["Import the Application from the APP dir"]
	c --> l["Import the DB objects from the DB dir"]
	f --> m{"Imported?"} 
	m -."Y" .-> arc["Move Controller to archive"]
	arc --> e
	l --> m
	m -. "N" .-> r["Rollback"] 
	r --> o["Open WorkItem"]
	r --> s
	s --> e
	b -. N .-> s["Send mail"]
	s --> e(("End"))
```

## משתתפים

## מסקנות ופעולות

- [ ] 
 
#memo #op/memo
