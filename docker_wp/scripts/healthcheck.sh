#/bin/bash
content=`curl http://nginx/?health_check=1 -f -I`
# content=`curl https://httpstat.us/200 -f -I`
resCode=`echo $?`
echo $content
echo $resCode

if [[ $resCode != 0 ]];
then 
    if [[ `echo $content | grep 403` ]];
    then 
        echo 'ok.'
        exit 0
    else
        echo 'not ok'    
        exit 1
    fi    
else
    echo 'ok'
    exit 0
fi    