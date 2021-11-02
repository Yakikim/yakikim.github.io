git log -1;
pulltext=$(git pull);
uptodate="Already up to date.";
ppwd=$(pwd);
if [[ "$pulltext" == *"$uptodate"* ]]; then 
 else echo " $(tput setaf 1)Please re-run CustomPushPull.sh again,  because there was unmerged changes $(tput sgr 0) ";
fi;
git add .;
git commit -m "auto commit";
git push;
read "yaki";
sleep 10;
